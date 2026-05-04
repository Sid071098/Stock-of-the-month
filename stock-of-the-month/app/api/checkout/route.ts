import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY environment variable." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 19900,
          recurring: {
            interval: "month"
          },
          product_data: {
            name: "Signal Desk: Stock of the Month",
            description: "Monthly premium equity research subscription"
          }
        }
      }
    ],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        plan: "stock-of-the-month",
        featuredTicker: "NFLX"
      }
    }
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a Checkout URL." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
