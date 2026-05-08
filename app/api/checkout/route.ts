import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePriceId = process.env.STRIPE_PRICE_ID;
const appUrlFallback = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || new URL(request.url).origin || appUrlFallback;

  if (!stripeSecretKey) {
    return redirectToCheckoutError(origin, "missing_secret");
  }

  if (!stripeSecretKey.startsWith("sk_")) {
    return redirectToCheckoutError(origin, "invalid_secret");
  }

  if (stripePriceId && !stripePriceId.startsWith("price_")) {
    return redirectToCheckoutError(origin, "invalid_price_id");
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20"
  });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = stripePriceId
    ? [{ price: stripePriceId, quantity: 1 }]
    : [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 19900,
            recurring: {
              interval: "month" as const
            },
            product_data: {
              name: "Signal Desk: Stock of the Month",
              description: "Monthly premium equity research subscription"
            }
          }
        }
      ];

  try {
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
      return redirectToCheckoutError(origin, "missing_checkout_url");
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    console.error("Stripe Checkout failed", getStripeErrorSummary(error));

    return redirectToCheckoutError(origin, "stripe_checkout_failed");
  }
}

function redirectToCheckoutError(origin: string, code: string) {
  return NextResponse.redirect(`${origin}/checkout-error?code=${encodeURIComponent(code)}`, {
    status: 303
  });
}

function getStripeErrorSummary(error: unknown) {
  if (error && typeof error === "object") {
    const stripeError = error as { type?: string; code?: string; message?: string };
    return {
      type: stripeError.type,
      code: stripeError.code,
      message: stripeError.message
    };
  }

  return { message: "Unknown Stripe error" };
}
