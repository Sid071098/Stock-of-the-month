import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPersistentSubscription,
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePersistentSubscription
} from "../../../lib/persistentStore";

const retentionCouponId = "stockymonth-retention-2mo";
const retentionCouponName = "2 free months — retention offer";

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
    return NextResponse.json({ error: "no_active_subscription" }, { status: 400 });
  }

  if (storedSubscription.retentionOfferUsed) {
    return NextResponse.json({ error: "retention_offer_already_used" }, { status: 409 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "missing_secret" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

  try {
    await ensureRetentionCoupon(stripe);

    const updatedSubscription = await stripe.subscriptions.update(storedSubscription.subscriptionId, {
      cancel_at_period_end: false,
      discounts: [{ coupon: retentionCouponId }]
    });

    const retainedUntil = updatedSubscription.current_period_end
      ? updatedSubscription.current_period_end + 60 * 24 * 60 * 60
      : Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60;

    await savePersistentSubscription({
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      currentPeriodEnd: updatedSubscription.current_period_end,
      customerId:
        typeof updatedSubscription.customer === "string"
          ? updatedSubscription.customer
          : updatedSubscription.customer?.id ?? storedSubscription.customerId,
      email,
      retentionOfferUsed: true,
      retainedUntil,
      status: updatedSubscription.status,
      subscriptionId: updatedSubscription.id
    });

    return NextResponse.json({
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      currentPeriodEnd: updatedSubscription.current_period_end,
      ok: true,
      retainedUntil,
      retentionOfferUsed: true,
      status: updatedSubscription.status
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Retention offer failed";
    return NextResponse.json({ error: "stripe_retain_failed", message }, { status: 502 });
  }
}

async function ensureRetentionCoupon(stripe: Stripe) {
  try {
    await stripe.coupons.retrieve(retentionCouponId);
  } catch (error) {
    const isMissing =
      error instanceof Stripe.errors.StripeInvalidRequestError && error.statusCode === 404;
    if (!isMissing) throw error;

    await stripe.coupons.create({
      id: retentionCouponId,
      duration: "repeating",
      duration_in_months: 2,
      name: retentionCouponName,
      percent_off: 100
    });
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
