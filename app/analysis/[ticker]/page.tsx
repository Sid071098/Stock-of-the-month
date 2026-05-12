import Link from "next/link";
import type React from "react";
import { ArrowLeft, ShieldAlert, TrendingUp, WalletCards } from "lucide-react";
import AnalysisChart from "../../components/AnalysisChart";
import { getAIAnalysis, getStockSnapshot } from "../../lib/marketData";
import { defaultMonthlyPick } from "../../lib/picks";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({
  params
}: {
  params: { ticker: string };
}) {
  const snapshot = await getStockSnapshot(params.ticker);
  const analysis = await getAIAnalysis(snapshot);

  return (
    <main className="min-h-screen bg-[#0f172a] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-[#22c55e]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-md border border-slate-800 bg-[#111827] p-6 shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#22c55e]">AI Analysis</p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">
              {snapshot.name} ({snapshot.ticker})
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300 md:text-lg">{analysis.thesis}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Stat label="Price" value={snapshot.price} />
              <Stat label="Day Move" value={`${snapshot.changePercent}%`} positive={snapshot.changePercent.startsWith("+")} />
            </div>
          </section>

          <section className="rounded-md border border-slate-800 bg-[#111827] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">30-day performance</h2>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm font-black text-[#22c55e]">Alpha Vantage</span>
            </div>
            <AnalysisChart data={snapshot.sparkline} />
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <AnalysisCard icon={<TrendingUp className="h-5 w-5" />} title="Opportunity" body={analysis.opportunity} />
          <AnalysisCard icon={<WalletCards className="h-5 w-5" />} title="Health" body={analysis.health} />
          <AnalysisCard icon={<ShieldAlert className="h-5 w-5" />} title="Risk" body={analysis.risk} />
        </div>

        <section className="mt-6 rounded-md border border-slate-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xl font-black">Technical Stats</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="P/E Ratio" value={snapshot.peRatio} light />
            <Stat label="52-Week High" value={snapshot.high52} light />
            <Stat label="52-Week Low" value={snapshot.low52} light />
            <Stat label="Market Cap" value={snapshot.marketCap} light />
          </div>
        </section>

        {snapshot.ticker === defaultMonthlyPick.ticker && <EQTDeepDive />}
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
    <article className="rounded-md border border-slate-800 bg-[#111827] p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-400/10 text-[#22c55e]">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-slate-300">{body}</p>
    </article>
  );
}

function EQTDeepDive() {
  return (
    <section className="mt-6 rounded-md border border-slate-800 bg-[#111827] p-6 shadow-xl">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#22c55e]">Analysis Deep-Dive</p>
      <h2 className="mt-3 text-2xl font-black text-white">Why this is the best pick of the month</h2>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <DeepDiveCard
          title="The Thesis"
          body="EQT sits at the center of two demand tailwinds: LNG exports and AI data center electricity growth. LNG exports globalize U.S. gas demand, while AI infrastructure can support long-duration gas-fired generation needs."
        />
        <DeepDiveCard
          title="Vertical Integration"
          body="The Equitrans acquisition gives EQT more control over gathering, pipes, and transportation. Owning more of the route from wellhead to customer can reduce bottlenecks and lower delivered costs."
        />
        <DeepDiveCard
          title="Management Alignment"
          body="CEO Toby Rice owns substantial stock, receives a $1 salary, and is compensated primarily through performance-based incentives. That creates a cleaner alignment between management execution and shareholder outcomes."
        />
        <DeepDiveCard
          title="Risk Frame"
          body="Natural gas prices can remain volatile, and pipeline or commodity cycles can pressure results. The thesis depends on EQT maintaining cost leadership while LNG and power-demand catalysts develop."
        />
      </div>

      <div className="mt-6 rounded-md border border-slate-800 bg-[#0f172a] p-5">
        <h3 className="text-lg font-black text-white">Competitive Landscape</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {defaultMonthlyPick.competitors.map((competitor) => (
            <div key={competitor.ticker} className="rounded-md border border-slate-800 bg-[#111827] p-4">
              <p className="text-sm font-black text-[#22c55e]">
                {competitor.name} ({competitor.ticker})
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{competitor.edge}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeepDiveCard({ body, title }: { body: string; title: string }) {
  return (
    <article className="rounded-md border border-slate-800 bg-[#0f172a] p-5">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-slate-300">{body}</p>
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
    <div className={`rounded-md p-4 ${light ? "border border-slate-800 bg-[#0f172a]" : "border border-slate-800 bg-[#0f172a]"}`}>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-black ${positive === undefined ? "text-white" : positive ? "text-[#22c55e]" : "text-rose-400"}`}>
        {value}
      </p>
    </div>
  );
}
