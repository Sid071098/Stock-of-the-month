import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPersistentSubscription,
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePersistentSubscription
} from "../../../lib/persistentStore";

export async function POST(request: Request) {
  const email = await readEmail(request);

  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }

  if (!isPersistentStoreConfigured()) {
    return NextResponse.json({ error: "persistent_store_not_configured" }, { status: 500 });
  }

  const storedSubscription = await getPersistentSubscription(email).catch(() => null);

  if (!storedSubscription?.subscriptionId) {
    await savePersistentSubscription({
      cancelAtPeriodEnd: false,
      customerId: storedSubscription?.customerId,
      email,
      status: "canceled"
    }).catch(() => undefined);

    return NextResponse.json({
      active: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      ok: true,
      status: "canceled"
    });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "missing_secret" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  try {
    const updatedSubscription = await stripe.subscriptions.update(storedSubscription.subscriptionId, {
      cancel_at_period_end: true
    });

    await savePersistentSubscription({
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      currentPeriodEnd: updatedSubscription.current_period_end,
      customerId:
        typeof updatedSubscription.customer === "string"
          ? updatedSubscription.customer
          : updatedSubscription.customer?.id ?? storedSubscription.customerId,
      email,
      status: updatedSubscription.status,
      subscriptionId: updatedSubscription.id
    });

    return NextResponse.json({
      active: updatedSubscription.status === "active" || updatedSubscription.status === "trialing",
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      currentPeriodEnd: updatedSubscription.current_period_end,
      ok: true,
      status: updatedSubscription.status
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Subscription cancellation failed";
    return NextResponse.json({ error: "stripe_cancel_failed", message }, { status: 502 });
  }
}

async function readEmail(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    return normalizePersistentEmail(body?.userEmail ?? body?.email ?? "");
  }

  const formData = await request.formData().catch(() => null);
  return normalizePersistentEmail(formData?.get("userEmail")?.toString() ?? "");
}
