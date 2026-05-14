import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPersistentSubscription,
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePersistentSubscription
} from "../../../lib/persistentStore";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://easecaseinc.com";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const email = normalizePersistentEmail(formData?.get("userEmail")?.toString() ?? "");

  if (!email) {
    return NextResponse.redirect(new URL("/checkout-error?code=missing_email", appUrl), { status: 303 });
  }

  const storedSubscription =
    isPersistentStoreConfigured()
      ? await getPersistentSubscription(email).catch(() => null)
      : null;

  if (!storedSubscription?.subscriptionId) {
    if (isPersistentStoreConfigured()) {
      await savePersistentSubscription({
        customerId: storedSubscription?.customerId,
        email,
        status: "canceled"
      }).catch(() => undefined);
    }

    clearSubscriptionCookies();
    return NextResponse.redirect(new URL("/subscription?cancelled=1", appUrl), { status: 303 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.redirect(new URL("/checkout-error?code=missing_secret", appUrl), { status: 303 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  try {
    const canceledSubscription = await stripe.subscriptions.cancel(storedSubscription.subscriptionId);

    if (isPersistentStoreConfigured()) {
      await savePersistentSubscription({
        customerId:
          typeof canceledSubscription.customer === "string"
            ? canceledSubscription.customer
            : canceledSubscription.customer?.id ?? storedSubscription.customerId,
        email,
        status: canceledSubscription.status,
        subscriptionId: canceledSubscription.id
      });
    }

    clearSubscriptionCookies();
    return NextResponse.redirect(new URL("/subscription?cancelled=1", appUrl), { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Subscription cancellation failed";
    const url = new URL("/checkout-error", appUrl);
    url.searchParams.set("code", "stripe_cancel_failed");
    url.searchParams.set("stripe_message", message.slice(0, 260));

    return NextResponse.redirect(url, { status: 303 });
  }
}

function clearSubscriptionCookies() {
  cookies().set("stockymonth_subscription", "", {
    maxAge: 0,
    path: "/"
  });
  cookies().set("stockymonth_customer", "", {
    maxAge: 0,
    path: "/"
  });
}
