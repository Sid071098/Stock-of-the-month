import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-slate-50">
      <section className="w-full max-w-xl rounded-md border border-line bg-panel p-8 shadow-2xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-danger/10 text-danger">
          <XCircle className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-danger">Payment Cancelled</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Checkout was not completed</h1>
        <p className="mt-4 leading-7 text-slate-300">
          No subscription was created and your card was not charged. You can return
          to the NFLX research page whenever you are ready.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white/5 px-5 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to NFLX Research
        </Link>
      </section>
    </main>
  );
}
