import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePriceId = process.env.STRIPE_PRICE_ID;
const appUrlFallback = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY environment variable." },
      { status: 500 }
    );
  }

  const origin = request.headers.get("origin") || new URL(request.url).origin || appUrlFallback;

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  const lineItems = stripePriceId
    ? [{ price: stripePriceId, quantity: 1 }]
    : [
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
      ];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
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
