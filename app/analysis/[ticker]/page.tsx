import Link from "next/link";
import type React from "react";
import {
  ArrowLeft,
  Activity,
  BarChart3,
  LineChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  WalletCards
} from "lucide-react";
import AnalysisDeepDive from "../../components/AnalysisDeepDive";
import AnalysisChart from "../../components/AnalysisChart";
import TradingViewChart from "../../components/TradingViewChart";
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
  const isPositive = snapshot.changePercent.startsWith("+");

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f8fafc] via-white to-[#ecfeff] px-6 py-10 text-slate-950">
      {/* Decorative aurora orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[80%] -translate-x-1/2 rounded-full bg-orange-100/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-cyan-100/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 -right-32 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-[#ff4f00] hover:bg-orange-50 hover:text-[#ff4f00]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 backdrop-blur-md md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
            Live Market Data
          </span>
        </div>

        {/* Hero card */}
        <section className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#0f1a40] to-[#0f1729] p-8 text-white shadow-2xl">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#ff4f00]/25 blur-3xl animate-drift" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#22d3ee]/20 blur-3xl animate-drift" style={{ animationDelay: "3s" }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                AI Analysis
              </span>
              <h1 className="mt-4 bg-gradient-to-r from-white via-[#ffd4c2] to-[#ff8a3d] bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
                {snapshot.name} <span className="text-white/70">({snapshot.ticker})</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">{analysis.thesis}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">Current price</p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-4xl font-black md:text-5xl">{snapshot.price}</span>
                <span className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
                  isPositive ? "bg-emerald-400/20 text-emerald-300" : "bg-rose-400/20 text-rose-300"
                }`}>
                  <Activity className="h-3 w-3" aria-hidden="true" />
                  {snapshot.changePercent}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Trading view */}
        <div className="mt-6">
          <TradingViewChart defaultPair={`${snapshot.ticker}/USD`} />
        </div>

        {/* Chart + KPI cards */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#34d399] to-[#ff8a3d]" />
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <LineChart className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-black">30-day performance</h2>
                  <p className="text-xs font-bold text-slate-500">Daily close · indexed</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black text-[#ff4f00]">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Alpha Vantage
              </span>
            </div>
            <AnalysisChart data={snapshot.sparkline} />
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 to-sky-500" />
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-black">Quick stats</h2>
                <p className="text-xs font-bold text-slate-500">Real-time snapshot</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Price" value={snapshot.price} accent="indigo" />
              <Stat label="Day Move" value={`${snapshot.changePercent}%`} positive={isPositive} accent={isPositive ? "emerald" : "rose"} />
              <Stat label="P/E Ratio" value={snapshot.peRatio} accent="amber" />
              <Stat label="Market Cap" value={snapshot.marketCap} accent="cyan" />
            </div>
          </section>
        </div>

        {/* AI insight cards */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <AnalysisCard
            icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
            title="Opportunity"
            body={analysis.opportunity}
            accent="emerald"
          />
          <AnalysisCard
            icon={<WalletCards className="h-5 w-5" aria-hidden="true" />}
            title="Health"
            body={analysis.health}
            accent="violet"
          />
          <AnalysisCard
            icon={<ShieldAlert className="h-5 w-5" aria-hidden="true" />}
            title="Risk"
            body={analysis.risk}
            accent="rose"
          />
        </div>

        {/* Technical stats */}
        <section className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-black">Technical stats</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="P/E Ratio" value={snapshot.peRatio} accent="amber" />
            <Stat label="52-Week High" value={snapshot.high52} accent="emerald" />
            <Stat label="52-Week Low" value={snapshot.low52} accent="rose" />
            <Stat label="Market Cap" value={snapshot.marketCap} accent="cyan" />
          </div>
        </section>

        {snapshot.ticker === defaultMonthlyPick.ticker && <AnalysisDeepDive competitors={defaultMonthlyPick.competitors} />}
      </div>
    </main>
  );
}

const cardAccentStyles = {
  emerald: { ring: "from-emerald-400 to-teal-500", iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
  violet:  { ring: "from-cyan-400 to-sky-500", iconBg: "bg-cyan-50", iconText: "text-cyan-600"   },
  rose:    { ring: "from-rose-400 to-pink-500",     iconBg: "bg-rose-50",   iconText: "text-rose-600"     },
  amber:   { ring: "from-amber-400 to-orange-400",  iconBg: "bg-amber-50",  iconText: "text-amber-600"    },
  cyan:    { ring: "from-cyan-400 to-sky-500",      iconBg: "bg-cyan-50",   iconText: "text-cyan-600"     },
  indigo:  { ring: "from-indigo-400 to-cyan-500", iconBg: "bg-indigo-50", iconText: "text-indigo-600"   }
} as const;

type AccentKey = keyof typeof cardAccentStyles;

function AnalysisCard({
  body,
  icon,
  title,
  accent = "emerald"
}: {
  body: string;
  icon: React.ReactNode;
  title: string;
  accent?: AccentKey;
}) {
  const styles = cardAccentStyles[accent];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.ring}`} />
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconText}`}>
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{body}</p>
    </article>
  );
}

function Stat({
  label,
  positive,
  value,
  accent
}: {
  label: string;
  positive?: boolean;
  value: string;
  accent?: AccentKey;
}) {
  const styles = accent ? cardAccentStyles[accent] : undefined;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 transition hover:border-slate-300 hover:shadow-sm">
      {styles && <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${styles.ring}`} />}
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-black ${
        positive === undefined ? "text-slate-950" : positive ? "text-emerald-600" : "text-rose-600"
      }`}>
        {value}
      </p>
    </div>
  );
}
