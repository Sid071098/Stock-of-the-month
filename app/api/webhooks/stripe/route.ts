import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "missing_webhook_config" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Stripe subscription status changed", {
        customer: subscription.customer,
        status: subscription.status,
        subscription: subscription.id
      });
      // Production next step: persist customer/subscription/status to a database keyed to your app user.
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
