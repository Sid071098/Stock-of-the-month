import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPersistentSubscription,
  isPersistentStoreConfigured,
  normalizePersistentEmail
} from "../../lib/persistentStore";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://easecaseinc.com";

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const formData = await request.formData().catch(() => null);
  const email = normalizePersistentEmail(formData?.get("userEmail")?.toString() ?? "");
  const storedSubscription =
    email && isPersistentStoreConfigured()
      ? await getPersistentSubscription(email).catch(() => null)
      : null;
  const customerId =
    cookies().get("stockymonth_customer")?.value ??
    storedSubscription?.customerId ??
    request.headers.get("x-stockymonth-customer") ??
    process.env.STRIPE_TEST_CUSTOMER_ID;

  if (!stripeSecretKey || !customerId) {
    return NextResponse.redirect(new URL("/checkout-error?code=missing_portal_config", appUrl), { status: 303 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/subscription`
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
