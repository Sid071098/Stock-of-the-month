import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { pickHistory } from "../lib/picks";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
        <h1 className="mt-8 text-5xl font-black">Pick History</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          Timeline of Stockymonth picks across 2025 and 2026.
        </p>

        <div className="mt-10 space-y-4">
          {pickHistory.map((pick) => (
            <Link
              key={`${pick.month}-${pick.ticker}`}
              href={`/analysis/${pick.ticker}`}
              className="grid gap-4 rounded-md border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition hover:border-emerald-300/40 md:grid-cols-[180px_1fr_auto] md:items-center"
            >
              <div className="flex items-center gap-3 text-slate-300">
                <CalendarDays className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                <span className="font-bold">{pick.month}</span>
              </div>
              <div>
                <h2 className="text-2xl font-black">
                  {pick.name} ({pick.ticker})
                </h2>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-black text-emerald-200">
                {pick.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
