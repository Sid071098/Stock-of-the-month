"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Gauge } from "lucide-react";

export default function SuccessPage({
  searchParams
}: {
  searchParams?: { session_id?: string };
}) {
  const [status, setStatus] = useState("Verifying subscription...");

  useEffect(() => {
    if (!searchParams?.session_id) {
      setStatus("Payment completed. Subscription verification will finish shortly.");
      return;
    }

    void fetch("/api/subscription/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sessionId: searchParams.session_id })
    })
      .then((response) => response.json())
      .then((payload) => {
        setStatus(payload.status ? `Subscription ${payload.status}. Dashboard unlocked.` : "Subscription verified.");
      })
      .catch(() => {
        setStatus("Payment completed. If dashboard access is delayed, refresh in a moment.");
      });
  }, [searchParams?.session_id]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f172a] px-6 text-slate-50">
      <section className="w-full max-w-2xl rounded-md border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Payment Successful</p>
        <h1 className="mt-3 text-4xl font-black text-white">Welcome to Stockymonth</h1>
        <p className="mt-4 leading-7 text-slate-300">{status}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
            <FileText className="mb-3 h-5 w-5 text-emerald-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-white">AI analysis unlocked</p>
            <p className="mt-1 text-sm text-slate-400">Opportunity, health, and risk</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
            <Gauge className="mb-3 h-5 w-5 text-emerald-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-white">Dashboard access</p>
            <p className="mt-1 text-sm text-slate-400">Monthly signal updates</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-emerald-400 px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
        >
          Open Dashboard
        </Link>
      </section>
    </main>
  );
}
