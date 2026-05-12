import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6 text-[#210947]">
      <section className="w-full max-w-xl rounded-md border border-[#efe7f7] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-rose-50 text-rose-500">
          <XCircle className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-500">Payment Cancelled</p>
        <h1 className="mt-3 text-4xl font-black">Checkout was not completed</h1>
        <p className="mt-4 leading-7 text-[#4d3f68]">
          No subscription was created and your card was not charged. You can return
          to StockyMonth whenever you are ready.
        </p>
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
