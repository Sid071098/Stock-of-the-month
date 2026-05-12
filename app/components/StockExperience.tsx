"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  CircleDollarSign,
  CircleGauge,
  Crown,
  Database,
  Edit3,
  LineChart,
  LogOut,
  RefreshCcw,
  Save,
  Settings,
  Sparkles,
  TrendingUp,
  UserCircle
} from "lucide-react";
import AnalysisChart from "./AnalysisChart";
import StripePricingTable from "./StripePricingTable";
import type { SparklinePoint } from "../lib/marketData";
import type { ArchivePick, MonthlyPick, QualityPick } from "../lib/picks";

const monthlyStorageKey = "stockymonth.monthlyPick";
const qualityStorageKey = "stockymonth.qualityPicks";

type StockExperienceProps = {
  archivePicks: ArchivePick[];
  archiveUnlocked?: boolean;
  defaultMonthlyPick: MonthlyPick;
  defaultQualityPicks: QualityPick[];
  pricingTableId: string;
  publishableKey: string;
  showAdmin?: boolean;
  showPricing?: boolean;
};

export default function StockExperience({
  archivePicks,
  archiveUnlocked = false,
  defaultMonthlyPick,
  defaultQualityPicks,
  pricingTableId,
  publishableKey,
  showAdmin = false,
  showPricing = true
}: StockExperienceProps) {
  const [monthlyPick, setMonthlyPick] = useState(defaultMonthlyPick);
  const [qualityPicks, setQualityPicks] = useState(defaultQualityPicks);
  const [showQualityPicks, setShowQualityPicks] = useState(false);

  useEffect(() => {
    const savedMonthly = readStoredValue<MonthlyPick>(monthlyStorageKey);
    const savedQuality = readStoredValue<QualityPick[]>(qualityStorageKey);

    if (savedMonthly) {
      setMonthlyPick({ ...defaultMonthlyPick, ...savedMonthly });
    }

    if (Array.isArray(savedQuality) && savedQuality.length === 6) {
      setQualityPicks(savedQuality.map((pick, index) => ({ ...defaultQualityPicks[index], ...pick })));
    }
  }, []);

  function saveMonthlyPick(nextPick: MonthlyPick) {
    setMonthlyPick(nextPick);
    window.localStorage.setItem(monthlyStorageKey, JSON.stringify(nextPick));
  }

  function saveQualityPicks(nextPicks: QualityPick[]) {
    setQualityPicks(nextPicks);
    window.localStorage.setItem(qualityStorageKey, JSON.stringify(nextPicks));
  }

  function resetMonthlyPick() {
    setMonthlyPick(defaultMonthlyPick);
    window.localStorage.removeItem(monthlyStorageKey);
  }

  function resetQualityPicks() {
    setQualityPicks(defaultQualityPicks);
    window.localStorage.removeItem(qualityStorageKey);
  }

  function revealQualityPicks() {
    setShowQualityPicks(true);
    window.setTimeout(() => {
      document.getElementById("quality-picks")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <TopNav onShowTopPicks={revealQualityPicks} />
      <Hero monthlyPick={monthlyPick} />
      <MonthlyPickSection monthlyPick={monthlyPick} />
      <AllPicksSection isUnlocked={archiveUnlocked} picks={archivePicks} />
      {showQualityPicks && <QualityPicksSection picks={qualityPicks} />}
      {showPricing && (
        <PricingSection monthlyPick={monthlyPick} pricingTableId={pricingTableId} publishableKey={publishableKey} />
      )}
      {showAdmin && (
        <AdminPanel
          monthlyPick={monthlyPick}
          qualityPicks={qualityPicks}
          onResetMonthlyPick={resetMonthlyPick}
          onResetQualityPicks={resetQualityPicks}
          onSaveMonthlyPick={saveMonthlyPick}
          onSaveQualityPicks={saveQualityPicks}
        />
      )}
    </main>
  );
}

function TopNav({ onShowTopPicks }: { onShowTopPicks: () => void }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#ff4f00] text-white">
            <BarChart3 className="h-7 w-7" aria-hidden="true" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-950">StockyMonth</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#stock-of-month"
            className="rounded-full bg-orange-50 px-5 py-3 text-sm font-black text-[#ff4f00] transition hover:bg-orange-100"
          >
            Stock of the Month
          </a>
          <button
            type="button"
            onClick={onShowTopPicks}
            className="rounded-full px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            Top 6
          </button>
          <a
            href="#all-picks"
            className="rounded-full px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            All Picks
          </a>
        </div>

        <ProfileMenu />
      </div>
    </nav>
  );
}

function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50"
      >
        <UserCircle className="h-7 w-7" aria-hidden="true" />
        <span className="hidden sm:inline">Profile</span>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-md border border-[#efe7f7] bg-white p-4 text-[#210947] shadow-2xl">
          <div className="flex items-start gap-3 border-b border-[#efe7f7] pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#210947] text-sm font-black text-white">
              SP
            </div>
            <div>
              <p className="text-sm font-black">Siddharth Patel</p>
              <p className="text-xs font-semibold text-[#6c5d7f]">StockyMonth member</p>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-[#fff1ea] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black">Archive Access</p>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#ff4f00]">Preview</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#6c5d7f]">
              Subscribe to unlock the full historical archive. The latest picks remain available for preview.
            </p>
          </div>

          <div className="mt-4 grid gap-2">
            <Link href="/history" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold hover:bg-[#fff1ea]">
              <Crown className="h-4 w-4 text-[#ff6b4a]" aria-hidden="true" />
              Pick history
            </Link>
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold hover:bg-[#fff1ea]">
              <Settings className="h-4 w-4 text-[#ff6b4a]" aria-hidden="true" />
              Admin editor
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-[#6c5d7f] hover:bg-[#fff1ea]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Hero({ monthlyPick }: { monthlyPick: MonthlyPick }) {
  return (
    <section className="border-b border-slate-200 bg-[#f8fafc] px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-black text-[#ff4f00]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {monthlyPick.month} Stock of the Month
          </p>
          <h1 className="mt-7 max-w-4xl text-3xl font-black leading-tight text-slate-950 md:text-4xl">
            Monthly stock picks with focused data, thesis, and quality shortlist.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {monthlyPick.name} ({monthlyPick.ticker}) is the current featured idea. Review the thesis,
            open detailed Alpha Vantage charts, and compare six high-quality stocks.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#stock-of-month"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#ff4f00] px-8 text-base font-black text-white transition hover:bg-orange-600"
            >
              View stock of the month
            </a>
            <a
              href="#quality-picks"
              className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-black text-slate-800 transition hover:bg-slate-50"
            >
              See top quality picks
            </a>
          </div>
        </Reveal>

        <Reveal className="rounded-md border border-slate-200 bg-white p-5 shadow-xl">
          <div className="rounded-md border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Latest stock pick</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{monthlyPick.ticker}</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                <LiveDot />
                {monthlyPick.rating}
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Price" value={monthlyPick.price} />
              <MiniStat label="Move" value={monthlyPick.change} positive={monthlyPick.change.startsWith("+")} />
              <MiniStat label="Sector" value={monthlyPick.sector} />
            </div>
            <div className="mt-6 h-44 rounded-md border border-slate-200 bg-white p-4">
              <div className="flex h-full items-end gap-2">
                {[42, 58, 49, 70, 63, 76, 68, 82, 78, 90, 84, 96].map((height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className="flex-1 rounded-t bg-[#ff4f00]"
                    style={{ height: `${height}%`, opacity: 0.45 + index / 24 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MonthlyPickSection({ monthlyPick }: { monthlyPick: MonthlyPick }) {
  const backingPoints = [
    {
      icon: <CircleDollarSign className="h-5 w-5" aria-hidden="true" />,
      text: "EQT is the lowest-cost major natural gas producer in the U.S. It can stay profitable in weak gas markets and generate outsized cash flow when prices rise."
    },
    {
      icon: <TrendingUp className="h-5 w-5" aria-hidden="true" />,
      text: "EQT stands to benefit from two major long-term tailwinds. LNG export growth is globalizing the gas market, while AI data center buildouts are driving new electricity demand."
    },
    {
      icon: <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />,
      text: "CEO Toby Rice helped drive EQT's transformation and 4x+ stock appreciation since taking the reins in 2019, owns over $100 million of stock, and receives just a $1 salary."
    }
  ];

  return (
    <section id="stock-of-month" className="bg-[#f8fafc] px-6 py-8 md:py-12">
      <div className="mx-auto max-w-[1460px]">
        <Reveal className="mb-7 flex items-center gap-3 text-slate-950">
          <CircleGauge className="h-6 w-6" aria-hidden="true" />
          <h2 className="text-xl font-black tracking-tight md:text-2xl">Our Latest Stock Pick</h2>
        </Reveal>

        <Reveal as="article" className="overflow-hidden rounded-md border border-slate-800 bg-[#0f172a] p-5 shadow-2xl md:p-7">
          <div className="grid gap-8 lg:grid-cols-[0.62fr_1fr] lg:items-stretch">
            <MonthlyPickArtwork month={monthlyPick.month} />

            <div className="flex min-w-0 flex-col justify-center py-2">
              <div className="flex flex-wrap items-center gap-3">
                <EQTLogo />
                <span className="inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-4 py-2 text-sm font-black text-[#0f172a]">
                  <LiveDot dark />
                  {monthlyPick.rating}
                </span>
              </div>

              <h3 className="mt-5 text-3xl font-black leading-tight text-white">
                {monthlyPick.name} ({monthlyPick.ticker})
              </h3>

              <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-black text-slate-400 md:text-base">
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  {monthlyPick.sector}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Database className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  {monthlyPick.price}{" "}
                  <span className={monthlyPick.change.startsWith("+") ? "text-emerald-700" : "text-[#df2d74]"}>
                    ({monthlyPick.change})
                  </span>
                </span>
              </div>

              <p className="mt-5 max-w-5xl text-base font-medium leading-relaxed text-slate-300">{monthlyPick.summary}</p>

              <DashboardLiveChart ticker={monthlyPick.ticker} />

              <div className="mt-6 rounded-md border border-slate-800 bg-[#111827] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#22c55e]">AI dashboard summary</p>
                <ul className="mt-3 grid gap-2">
                  {(monthlyPick.summaryBullets?.length ? monthlyPick.summaryBullets : [monthlyPick.thesis]).map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-semibold leading-relaxed text-slate-200">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-9">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-[#22c55e]">
                    <CircleDollarSign className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h4 className="text-base font-black uppercase tracking-tight text-white">
                    Why this is the best pick of the month
                  </h4>
                </div>

                <div className="grid gap-7">
                  {backingPoints.map((point, index) => (
                    <BackingPoint key={point.text} accent={index} icon={point.icon} text={point.text} />
                  ))}
                </div>
              </div>

              <Link
                href={`/analysis/${monthlyPick.ticker}`}
                className="mt-9 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white transition hover:bg-orange-600"
              >
                Detailed analysis
                <LineChart className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AllPicksSection({
  isUnlocked,
  picks
}: {
  isUnlocked: boolean;
  picks: ArchivePick[];
}) {
  return (
    <section id="all-picks" className="bg-[#f8fafc] px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Historical Archive</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">All Picks</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              A complete archive of StockyMonth monthly selections with price movement, short summaries, and the three core reasons behind each pick.
            </p>
          </div>
          {!isUnlocked && (
            <form action="/api/checkout" method="POST">
              <button className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white shadow-sm transition hover:bg-orange-600">
                Join to View Full History
              </button>
            </form>
          )}
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picks.map((pick, index) => {
            const locked = !isUnlocked && index >= 3;

            return (
              <Reveal key={`${pick.month}-${pick.ticker}`} delay={(index % 6) * 55}>
                <article className="relative min-h-full overflow-hidden rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                  <div className={locked ? "select-none blur-[3px]" : ""}>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{pick.month}</p>
                        <h3 className="mt-2 text-lg font-black leading-snug text-slate-950">
                          {pick.name} ({pick.ticker})
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                        <LiveDot />
                        Active Buy
                      </span>
                    </div>

                    <div className="mb-5 flex items-end justify-between border-y border-slate-200 py-4">
                      <p className="text-2xl font-black text-slate-950">{pick.price}</p>
                      <p className={`text-sm font-black ${pick.change.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>
                        {pick.change}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">{pick.summary}</p>
                    <div className="mt-5 grid gap-3">
                      {pick.bullets.map((bullet) => (
                        <p key={bullet} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff4f00]" />
                          {bullet}
                        </p>
                      ))}
                    </div>
                  </div>

                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 p-6 backdrop-blur-[1px]">
                      <form action="/api/checkout" method="POST">
                        <button className="rounded-full bg-[#ff4f00] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-orange-600">
                          Join to View Full History
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MonthlyPickArtwork({ month }: { month: string }) {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-md bg-[#d6e9e7] p-5 sm:p-8">
      <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[#207d72]" />
      <div className="absolute left-20 -top-24 h-56 w-56 rounded-full bg-[#88beb8]" />
      <div className="absolute -left-16 top-24 h-36 w-36 rounded-[42px] bg-[#bce3df]" />
      <div className="absolute right-24 top-0 h-24 w-64 bg-[#bde2df]" />
      <div className="absolute right-12 top-0 h-24 w-28 skew-x-[-24deg] bg-[#7db4ae]" />
      <div className="absolute -right-10 top-8 h-28 w-28 rounded-[42px] bg-[#207d72] rotate-45" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#207d72]" />
      <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[150px] border-l-[150px] border-b-[#207d72] border-l-transparent" />
      <div className="absolute bottom-0 right-20 h-0 w-0 border-b-[120px] border-l-[120px] border-b-[#88beb8] border-l-transparent" />

      <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-center">
        <div className="mb-10 flex items-center justify-center gap-4">
          <span className="text-[#210947]">
            <BadgeCheck className="h-12 w-12" aria-hidden="true" />
          </span>
          <h3 className="text-2xl font-black text-[#210947] md:text-3xl">{month} Pick</h3>
        </div>

        <div className="relative rounded-md bg-white p-6 shadow-sm md:p-7">
          <div className="absolute -top-6 left-8 flex items-center">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-[#ffcfbf]">
              <div className="mx-auto mt-2 h-7 w-7 rounded-full bg-[#21104d]" />
              <div className="mx-auto mt-1 h-7 w-10 rounded-t-full bg-[#ff7b59]" />
            </div>
            <div className="-ml-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#210947] text-[#ff7b59] ring-4 ring-white">
              <CircleDollarSign className="h-8 w-8" aria-hidden="true" />
            </div>
          </div>

          <blockquote className="mt-8 text-base font-black leading-relaxed text-[#210947] md:text-lg">
            "The components: the lowest-cost position, multiple powerful secular tailwinds, and improving business fundamentals.
            The result: the twin turbines of explosive EPS/FCF growth and a likely re-rating that will send the stock soaring over a multi-year period."
          </blockquote>
          <p className="mt-5 text-sm font-black text-[#210947]">- StockyMonth Research Committee</p>
        </div>
      </div>
    </div>
  );
}

function EQTLogo() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#04083d] text-white shadow-sm ring-4 ring-white">
      <span className="relative text-xl font-black tracking-[-0.12em]">
        E<span className="text-[#ff5377]">Q</span>T
      </span>
    </div>
  );
}

function DashboardLiveChart({ ticker }: { ticker: string }) {
  const [sparkline, setSparkline] = useState<SparklinePoint[]>([]);

  useEffect(() => {
    let isMounted = true;

    void fetch(`/api/snapshot/${ticker}`)
      .then((response) => response.json())
      .then((payload: { snapshot?: { sparkline?: SparklinePoint[] } }) => {
        if (isMounted && Array.isArray(payload.snapshot?.sparkline)) {
          setSparkline(payload.snapshot.sparkline);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSparkline([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [ticker]);

  return (
    <div className="mt-6 rounded-md border border-slate-800 bg-[#111827] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Live Alpha Vantage Chart</p>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-black text-[#22c55e]">
          <LiveDot />
          Live
        </span>
      </div>
      {sparkline.length > 0 ? (
        <div>
          <AnalysisChart data={sparkline} heightClassName="h-56" />
        </div>
      ) : (
        <div className="h-56 animate-pulse rounded-md bg-slate-800/70" />
      )}
    </div>
  );
}

function BackingPoint({
  accent,
  icon,
  text
}: {
  accent: number;
  icon: React.ReactNode;
  text: string;
}) {
  const colors = ["bg-[#fff1ea] text-[#ff6b4a]", "bg-[#ffe5dc] text-[#ff6b4a]", "bg-[#ffd8cc] text-[#ff6b4a]"];

  return (
    <div className="grid grid-cols-[40px_1fr] gap-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-md ${colors[accent]}`}>
        {icon}
      </span>
      <p className="text-base font-medium leading-relaxed text-slate-200 md:text-lg">{text}</p>
    </div>
  );
}

function QualityPicksSection({ picks }: { picks: QualityPick[] }) {
  return (
    <section id="quality-picks" className="border-y border-slate-200 bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Top 6 High Quality Picks</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">Static shortlist you can update from admin</h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picks.map((pick, index) => (
            <Reveal key={pick.ticker} delay={index * 70}>
              <Link
                href={`/analysis/${pick.ticker}`}
                className="group block rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <CompanyLogo pick={pick} />
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                    <LiveDot />
                    {pick.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-950 group-hover:text-[#ff4f00]">
                  {pick.name} ({pick.ticker})
                </h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{pick.sector}</p>
                <div className="mt-5 flex items-end justify-between">
                  <p className="text-lg font-black text-slate-950">{pick.price}</p>
                  <p className={`text-sm font-black ${pick.change.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>
                    {pick.change}
                  </p>
                </div>
                <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-slate-600">{pick.thesis}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({
  monthlyPick,
  pricingTableId,
  publishableKey
}: {
  monthlyPick: MonthlyPick;
  pricingTableId: string;
  publishableKey: string;
}) {
  return (
    <section id="pricing" className="bg-[#210947] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-lg font-black text-[#ffb29d]">Subscribe to StockyMonth</p>
          <h2 className="mt-3 text-3xl font-black">Get monthly picks for $1.99</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#e5d8f4]">
            Unlock {monthlyPick.ticker}, top quality ideas, detailed analysis, and pick history. Student promo codes are supported at checkout.
          </p>
          <div className="mt-8 grid gap-4">
            {["Stock of the month", "Top 6 quality stocks", "Alpha Vantage chart analysis"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-lg font-black">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff6b4a]">
                  <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-white p-6 text-[#210947] shadow-2xl md:p-10">
          {pricingTableId && publishableKey ? (
            <StripePricingTable pricingTableId={pricingTableId} publishableKey={publishableKey} />
          ) : (
            <form action="/api/checkout" method="POST" className="rounded-md border border-[#efe7f7] bg-[#fffaf7] p-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8d7ca3]">Monthly</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-black">$1.99</span>
                <span className="pb-2 text-lg font-bold text-[#6c5d7f]">/month</span>
              </div>
              <button className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#ff6b4a] text-base font-black text-white transition hover:bg-[#f45d3c]">
                Subscribe now
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function AdminPanel({
  monthlyPick,
  qualityPicks,
  onResetMonthlyPick,
  onResetQualityPicks,
  onSaveMonthlyPick,
  onSaveQualityPicks
}: {
  monthlyPick: MonthlyPick;
  qualityPicks: QualityPick[];
  onResetMonthlyPick: () => void;
  onResetQualityPicks: () => void;
  onSaveMonthlyPick: (pick: MonthlyPick) => void;
  onSaveQualityPicks: (picks: QualityPick[]) => void;
}) {
  const [monthlyDraft, setMonthlyDraft] = useState(monthlyPick);
  const [qualityDrafts, setQualityDrafts] = useState(qualityPicks);

  useEffect(() => {
    setMonthlyDraft(monthlyPick);
  }, [monthlyPick]);

  useEffect(() => {
    setQualityDrafts(qualityPicks);
  }, [qualityPicks]);

  function updateMonthlyField(field: keyof MonthlyPick, value: string) {
    setMonthlyDraft((current) => ({ ...current, [field]: value }));
  }

  function updateQualityField(index: number, field: keyof QualityPick, value: string) {
    setQualityDrafts((current) => current.map((pick, pickIndex) => (pickIndex === index ? { ...pick, [field]: value } : pick)));
  }

  return (
    <section id="admin" className="bg-[#fffaf7] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff6b4a]">Admin</p>
          <h2 className="mt-3 text-3xl font-black text-[#210947]">Manage monthly and quality picks</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-[#efe7f7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Edit3 className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#210947]">Add one stock per month</h3>
            </div>
            <div className="grid gap-4">
              <TextInput label="Ticker" value={monthlyDraft.ticker} onChange={(value) => updateMonthlyField("ticker", value.toUpperCase())} />
              <TextInput label="Company" value={monthlyDraft.name} onChange={(value) => updateMonthlyField("name", value)} />
              <TextInput label="Month" value={monthlyDraft.month} onChange={(value) => updateMonthlyField("month", value)} />
              <TextInput label="Price" value={monthlyDraft.price} onChange={(value) => updateMonthlyField("price", value)} />
              <TextInput label="Change" value={monthlyDraft.change} onChange={(value) => updateMonthlyField("change", value)} />
              <TextArea label="Investment thesis" value={monthlyDraft.thesis} onChange={(value) => updateMonthlyField("thesis", value)} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSaveMonthlyPick(monthlyDraft)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6b4a] px-5 text-sm font-black text-white"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save monthly pick
              </button>
              <button
                type="button"
                onClick={onResetMonthlyPick}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#efe7f7] px-5 text-sm font-black text-[#210947]"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-md border border-[#efe7f7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#210947]">Add or modify top 6 stocks</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {qualityDrafts.map((pick, index) => (
                <div key={`${pick.ticker}-${index}`} className="rounded-md border border-[#efe7f7] bg-[#fffaf7] p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#ff6b4a]">Quality pick {index + 1}</p>
                  <div className="grid gap-3">
                    <TextInput compact label="Ticker" value={pick.ticker} onChange={(value) => updateQualityField(index, "ticker", value.toUpperCase())} />
                    <TextInput compact label="Name" value={pick.name} onChange={(value) => updateQualityField(index, "name", value)} />
                    <TextInput compact label="Price" value={pick.price} onChange={(value) => updateQualityField(index, "price", value)} />
                    <TextInput compact label="Change" value={pick.change} onChange={(value) => updateQualityField(index, "change", value)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSaveQualityPicks(qualityDrafts)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6b4a] px-5 text-sm font-black text-white"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save top 6
              </button>
              <button
                type="button"
                onClick={onResetQualityPicks}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#efe7f7] px-5 text-sm font-black text-[#210947]"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TextInput({
  compact = false,
  label,
  onChange,
  value
}: {
  compact?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#8d7ca3]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${compact ? "h-10" : "h-12"} w-full rounded-md border border-[#efe7f7] bg-white px-3 text-sm font-bold text-[#210947] outline-none transition focus:border-[#ff6b4a]`}
      />
    </label>
  );
}

function TextArea({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#8d7ca3]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-[#efe7f7] bg-white px-3 py-3 text-sm font-bold leading-6 text-[#210947] outline-none transition focus:border-[#ff6b4a]"
      />
    </label>
  );
}

function MiniStat({
  label,
  positive,
  value
}: {
  label: string;
  positive?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-md border border-[#efe7f7] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#8d7ca3]">{label}</p>
      <p className={`mt-1 text-xl font-black ${positive === undefined ? "text-[#210947]" : positive ? "text-emerald-700" : "text-rose-600"}`}>
        {value}
      </p>
    </div>
  );
}

function CompanyLogo({ pick }: { pick: QualityPick }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white p-2">
      {failed ? (
        <span className="text-sm font-black text-[#0f172a]">{pick.ticker.slice(0, 2)}</span>
      ) : (
        <img
          src={`https://logo.clearbit.com/${pick.domain}`}
          alt={`${pick.name} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function LiveDot({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`relative flex h-2.5 w-2.5 ${dark ? "text-[#0f172a]" : "text-[#22c55e]"}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
    </span>
  );
}

function Reveal({
  as = "div",
  children,
  className = "",
  delay = 0
}: {
  as?: "article" | "div";
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const Component = as;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref as never}
      className={`${className} transform transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}

function readStoredValue<T>(key: string): T | null {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
}
