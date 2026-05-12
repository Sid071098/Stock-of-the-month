"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-6 text-slate-950">
      <section className="w-full max-w-xl rounded-md border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-amber-50 text-amber-700">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-semibold">Something needs a quick reset</h1>
        <p className="mt-3 leading-7 text-slate-600">
          The site loaded, but one server-side setting failed while rendering this
          page. Try again, or return home.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-bold text-white"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-5 text-sm font-semibold text-slate-700"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
