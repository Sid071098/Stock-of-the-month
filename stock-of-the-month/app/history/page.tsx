import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { pickHistory } from "../lib/picks";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7] px-6 py-10 text-[#210947]">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-[#ff6b4a]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
        <h1 className="mt-8 text-4xl font-black md:text-5xl">Pick History</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4d3f68]">
          Timeline of StockyMonth picks across 2025 and 2026.
        </p>

        <div className="mt-10 space-y-4">
          {pickHistory.map((pick) => (
            <Link
              key={`${pick.month}-${pick.ticker}`}
              href={`/analysis/${pick.ticker}`}
              className="grid gap-4 rounded-md border border-[#efe7f7] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:grid-cols-[180px_1fr_auto] md:items-center"
            >
              <div className="flex items-center gap-3 text-[#6c5d7f]">
                <CalendarDays className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
                <span className="font-bold">{pick.month}</span>
              </div>
              <div>
                <h2 className="text-2xl font-black">
                  {pick.name} ({pick.ticker})
                </h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
                {pick.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
