import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const messages: Record<string, string> = {
  missing_secret: "Stripe is missing STRIPE_SECRET_KEY in the deployment environment.",
  invalid_secret: "STRIPE_SECRET_KEY should be a Stripe secret key starting with sk_.",
  invalid_price_id: "STRIPE_PRICE_ID must be a recurring Price ID starting with price_, not a Product ID starting with prod_.",
  missing_checkout_url: "Stripe created a session but did not return a Checkout URL.",
  missing_email: "The request did not include the signed-in user email.",
  stripe_cancel_failed: "Stripe could not cancel the subscription. Check the Vercel function logs for the Stripe error summary.",
  stripe_checkout_failed: "Stripe rejected the Checkout request. Check the Vercel function logs for the Stripe error summary."
};

export default function CheckoutErrorPage({
  searchParams
}: {
  searchParams?: {
    code?: string;
    stripe_type?: string;
    stripe_code?: string;
    stripe_message?: string;
  };
}) {
  const code = searchParams?.code ?? "stripe_checkout_failed";
  const message = messages[code] ?? messages.stripe_checkout_failed;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 text-[#0f1729]">
      <section className="w-full max-w-xl rounded-md border border-[#e2e8f0] bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-[#fff1ea] text-[#ff6b4a]">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff6b4a]">Checkout Setup Issue</p>
        <h1 className="mt-3 text-4xl font-black">Stripe checkout could not start</h1>
        <p className="mt-4 leading-7 text-[#4d3f68]">{message}</p>
        <p className="mt-4 rounded-md bg-[#f8fafc] px-4 py-3 font-mono text-sm text-[#475569]">
          code: {code}
        </p>
        {(searchParams?.stripe_type || searchParams?.stripe_code || searchParams?.stripe_message) && (
          <div className="mt-4 rounded-md bg-[#f8fafc] px-4 py-3 text-sm text-[#475569]">
            {searchParams?.stripe_type && <p>Stripe type: {searchParams.stripe_type}</p>}
            {searchParams?.stripe_code && <p>Stripe code: {searchParams.stripe_code}</p>}
            {searchParams?.stripe_message && <p className="mt-2">Stripe message: {searchParams.stripe_message}</p>}
          </div>
        )}
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ff6b4a] px-5 text-sm font-black text-white transition hover:bg-[#f45d3c]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to StockyMonth
        </Link>
      </section>
    </main>
  );
}
