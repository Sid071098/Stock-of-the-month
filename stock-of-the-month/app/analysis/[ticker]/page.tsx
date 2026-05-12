import Link from "next/link";
import type React from "react";
import { ArrowLeft, ShieldAlert, TrendingUp, WalletCards } from "lucide-react";
import AnalysisChart from "../../components/AnalysisChart";
import { getAIAnalysis, getStockSnapshot } from "../../lib/marketData";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({
  params
}: {
  params: { ticker: string };
}) {
  const snapshot = await getStockSnapshot(params.ticker);
  const analysis = await getAIAnalysis(snapshot);

  return (
    <main className="min-h-screen bg-[#0f172a] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-md border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">AI Analysis</p>
            <h1 className="mt-3 text-5xl font-black">
              {snapshot.name} ({snapshot.ticker})
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-300">{analysis.thesis}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Stat label="Price" value={snapshot.price} />
              <Stat label="Day Move" value={`${snapshot.changePercent}%`} positive={snapshot.changePercent.startsWith("+")} />
            </div>
          </section>

          <section className="rounded-md border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">30-day performance</h2>
              <span className="text-sm font-bold text-slate-400">Alpha Vantage</span>
            </div>
            <AnalysisChart data={snapshot.sparkline} />
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <AnalysisCard icon={<TrendingUp className="h-5 w-5" />} title="Opportunity" body={analysis.opportunity} />
          <AnalysisCard icon={<WalletCards className="h-5 w-5" />} title="Health" body={analysis.health} />
          <AnalysisCard icon={<ShieldAlert className="h-5 w-5" />} title="Risk" body={analysis.risk} />
        </div>

        <section className="mt-6 rounded-md border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
          <h2 className="text-2xl font-black">Technical Stats</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="P/E Ratio" value={snapshot.peRatio} light />
            <Stat label="52-Week High" value={snapshot.high52} light />
            <Stat label="52-Week Low" value={snapshot.low52} light />
            <Stat label="Market Cap" value={snapshot.marketCap} light />
          </div>
        </section>
      </div>
    </main>
  );
}

function AnalysisCard({
  body,
  icon,
  title
}: {
  body: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-300">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{body}</p>
    </article>
  );
}

function Stat({
  label,
  light = false,
  positive,
  value
}: {
  label: string;
  light?: boolean;
  positive?: boolean;
  value: string;
}) {
  return (
    <div className={`rounded-md p-4 ${light ? "border border-slate-200 bg-slate-50" : "bg-white/10"}`}>
      <p className={`text-xs font-black uppercase tracking-wide ${light ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
      <p className={`mt-1 text-2xl font-black ${positive === undefined ? "" : positive ? "text-emerald-400" : "text-rose-400"}`}>
        {value}
      </p>
    </div>
  );
}
