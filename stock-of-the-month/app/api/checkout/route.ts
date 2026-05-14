import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePriceId = process.env.STRIPE_PRICE_ID;
const appUrlFallback = process.env.NEXT_PUBLIC_APP_URL ?? "https://easecaseinc.com";

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || new URL(request.url).origin || appUrlFallback;
  const formData = await request.formData().catch(() => null);
  const submittedPromoCode = normalizePromoCode(formData?.get("promoCode"));
  const userEmail = normalizeEmail(formData?.get("userEmail"));

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
            unit_amount: 199,
            recurring: {
              interval: "month" as const
            },
            product_data: {
              name: "StockyMonth",
              description: "Monthly premium equity research subscription"
            }
          }
        }
      ];

  try {
    const discounts = await getCheckoutDiscounts(stripe, submittedPromoCode);
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      subscription_data: {
        metadata: {
          plan: "stock-of-the-month",
          featuredTicker: "EQT",
          appUserEmail: userEmail || "none",
          requestedPromoCode: submittedPromoCode || "none"
        }
      }
    };

    if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return redirectToCheckoutError(origin, "missing_checkout_url");
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    const summary = getStripeErrorSummary(error);
    console.error("Stripe Checkout failed", summary);

    return redirectToCheckoutError(origin, "stripe_checkout_failed", summary);
  }
}

function redirectToCheckoutError(
  origin: string,
  code: string,
  detail?: { type?: string; code?: string; message?: string }
) {
  const url = new URL("/checkout-error", origin);
  url.searchParams.set("code", code);

  if (detail?.type) {
    url.searchParams.set("stripe_type", detail.type);
  }

  if (detail?.code) {
    url.searchParams.set("stripe_code", detail.code);
  }

  if (detail?.message) {
    url.searchParams.set("stripe_message", detail.message.slice(0, 260));
  }

  return NextResponse.redirect(url, { status: 303 });
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

function normalizePromoCode(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 64);
}

function normalizeEmail(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  const email = value.trim().toLowerCase();
  return email.includes("@") ? email.slice(0, 180) : "";
}

async function getCheckoutDiscounts(stripe: Stripe, promoCode: string) {
  if (!promoCode) {
    return [];
  }

  const promotionCodes = await stripe.promotionCodes.list({
    active: true,
    code: promoCode,
    limit: 1
  });
  const promotionCode = promotionCodes.data[0];

  return promotionCode ? [{ promotion_code: promotionCode.id }] : [];
}
