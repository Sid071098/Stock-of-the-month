import Link from "next/link";
import { CheckCircle2, FileText, Gauge } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-slate-50">
      <section className="w-full max-w-2xl rounded-md border border-line bg-panel p-8 shadow-2xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-bull/10 text-bull">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bull">Payment Successful</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Welcome to Signal Desk</h1>
        <p className="mt-4 leading-7 text-slate-300">
          Your subscription is active. The latest NFLX research brief and monthly
          market dashboard are ready for review.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-line bg-white/[0.03] p-4">
            <FileText className="mb-3 h-5 w-5 text-bull" aria-hidden="true" />
            <p className="text-sm font-semibold text-white">Research brief unlocked</p>
            <p className="mt-1 text-sm text-muted">Thesis, risks, and catalysts</p>
          </div>
          <div className="rounded-md border border-line bg-white/[0.03] p-4">
            <Gauge className="mb-3 h-5 w-5 text-bull" aria-hidden="true" />
            <p className="text-sm font-semibold text-white">Dashboard access</p>
            <p className="mt-1 text-sm text-muted">Monthly signal updates</p>
          </div>
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-bull px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          Return Home
        </Link>
      </section>
    </main>
  );
}
