import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getEmailForPersistentCustomer,
  getEmailForPersistentSubscription,
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePersistentSubscription
} from "../../../lib/persistentStore";

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
      const customerId = getStripeId(subscription.customer);
      const metadataEmail = normalizePersistentEmail(
        subscription.metadata?.appUserEmail && subscription.metadata.appUserEmail !== "none"
          ? subscription.metadata.appUserEmail
          : ""
      );
      const storedSubscriptionEmail = isPersistentStoreConfigured()
        ? await getEmailForPersistentSubscription(subscription.id).catch(() => null)
        : null;
      const storedCustomerEmail =
        customerId && isPersistentStoreConfigured()
          ? await getEmailForPersistentCustomer(customerId).catch(() => null)
          : null;
      const storedEmail = normalizePersistentEmail(storedSubscriptionEmail ?? storedCustomerEmail ?? "");
      const customerEmail = customerId ? await getStripeCustomerEmail(stripe, customerId) : "";
      const email = metadataEmail || storedEmail || customerEmail;

      console.log("Stripe subscription status changed", {
        customer: subscription.customer,
        email,
        status: subscription.status,
        subscription: subscription.id
      });

      if (email && isPersistentStoreConfigured()) {
        await savePersistentSubscription({
          customerId,
          email,
          status: subscription.status,
          subscriptionId: subscription.id
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function getStripeId(value: string | { id?: string } | null) {
  if (typeof value === "string") {
    return value;
  }

  return value?.id;
}

async function getStripeCustomerEmail(stripe: Stripe, customerId: string) {
  const customer = await stripe.customers.retrieve(customerId).catch(() => null);

  if (!customer || customer.deleted) {
    return "";
  }

  return normalizePersistentEmail(customer.email ?? "");
}
