import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

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

  return NextResponse.json({ status });
}
