import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const messages: Record<string, string> = {
  missing_secret: "Stripe is missing STRIPE_SECRET_KEY in the deployment environment.",
  invalid_secret: "STRIPE_SECRET_KEY should be a Stripe secret key starting with sk_.",
  invalid_price_id: "STRIPE_PRICE_ID must be a recurring Price ID starting with price_, not a Product ID starting with prod_.",
  missing_checkout_url: "Stripe created a session but did not return a Checkout URL.",
  stripe_checkout_failed: "Stripe rejected the Checkout request. Check the Vercel function logs for the Stripe error summary."
};

export default function CheckoutErrorPage({
  searchParams
}: {
  searchParams?: { code?: string };
}) {
  const code = searchParams?.code ?? "stripe_checkout_failed";
  const message = messages[code] ?? messages.stripe_checkout_failed;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-6 text-slate-950">
      <section className="w-full max-w-xl rounded-md border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-amber-50 text-amber-700">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Checkout Setup Issue</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Stripe checkout could not start</h1>
        <p className="mt-4 leading-7 text-slate-600">{message}</p>
        <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 font-mono text-sm text-slate-600">
          code: {code}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to StockMonth
        </Link>
      </section>
    </main>
  );
}
