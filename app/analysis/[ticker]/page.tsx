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
    <main className="min-h-screen bg-[#fffaf7] px-6 py-10 text-[#210947]">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-[#ff6b4a]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-md border border-[#efe7f7] bg-white/85 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff6b4a]">AI Analysis</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              {snapshot.name} ({snapshot.ticker})
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#4d3f68]">{analysis.thesis}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Stat label="Price" value={snapshot.price} />
              <Stat label="Day Move" value={`${snapshot.changePercent}%`} positive={snapshot.changePercent.startsWith("+")} />
            </div>
          </section>

          <section className="rounded-md border border-[#efe7f7] bg-white/85 p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">30-day performance</h2>
              <span className="rounded-full bg-[#fff1ea] px-3 py-1 text-sm font-black text-[#ff6b4a]">Alpha Vantage</span>
            </div>
            <AnalysisChart data={snapshot.sparkline} />
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <AnalysisCard icon={<TrendingUp className="h-5 w-5" />} title="Opportunity" body={analysis.opportunity} />
          <AnalysisCard icon={<WalletCards className="h-5 w-5" />} title="Health" body={analysis.health} />
          <AnalysisCard icon={<ShieldAlert className="h-5 w-5" />} title="Risk" body={analysis.risk} />
        </div>

        <section className="mt-6 rounded-md border border-[#efe7f7] bg-white p-6 shadow-xl">
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
    <article className="rounded-md border border-[#efe7f7] bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff1ea] text-[#ff6b4a]">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-[#4d3f68]">{body}</p>
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
    <div className={`rounded-md p-4 ${light ? "border border-[#efe7f7] bg-[#fffaf7]" : "border border-[#efe7f7] bg-white"}`}>
      <p className="text-xs font-black uppercase tracking-wide text-[#8d7ca3]">{label}</p>
      <p className={`mt-1 text-2xl font-black ${positive === undefined ? "text-[#210947]" : positive ? "text-emerald-700" : "text-rose-600"}`}>
        {value}
      </p>
    </div>
  );
}
