import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePersistentSubscription
} from "../../../lib/persistentStore";

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json({ error: "missing_stripe_secret" }, { status: 500 });
  }

  const { sessionId } = (await request.json().catch(() => ({}))) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: "missing_session_id" }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"]
  });
  const subscription = session.subscription as Stripe.Subscription | null;
  const status = subscription?.status;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const email = normalizePersistentEmail(
    session.metadata?.appUserEmail ?? session.customer_details?.email ?? session.customer_email ?? ""
  );

  if (status !== "active" && status !== "trialing") {
    return NextResponse.json({ error: "subscription_not_active", status }, { status: 403 });
  }

  cookies().set("stockymonth_subscription", status, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  if (customerId) {
    cookies().set("stockymonth_customer", customerId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }

  if (email && status && isPersistentStoreConfigured()) {
    await savePersistentSubscription({
      customerId,
      email,
      status,
      subscriptionId: subscription?.id
    }).catch(() => undefined);
  }

  return NextResponse.json({ status });
}
