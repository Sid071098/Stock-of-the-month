"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
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
import StripePricingTable from "./StripePricingTable";
import type { MonthlyPick, QualityPick } from "../lib/picks";

const monthlyStorageKey = "stockymonth.monthlyPick";
const qualityStorageKey = "stockymonth.qualityPicks";

type StockExperienceProps = {
  defaultMonthlyPick: MonthlyPick;
  defaultQualityPicks: QualityPick[];
  pricingTableId: string;
  publishableKey: string;
  showAdmin?: boolean;
  showPricing?: boolean;
};

export default function StockExperience({
  defaultMonthlyPick,
  defaultQualityPicks,
  pricingTableId,
  publishableKey,
  showAdmin = false,
  showPricing = true
}: StockExperienceProps) {
  const [monthlyPick, setMonthlyPick] = useState(defaultMonthlyPick);
  const [qualityPicks, setQualityPicks] = useState(defaultQualityPicks);

  useEffect(() => {
    const savedMonthly = readStoredValue<MonthlyPick>(monthlyStorageKey);
    const savedQuality = readStoredValue<QualityPick[]>(qualityStorageKey);

    if (savedMonthly) {
      setMonthlyPick(savedMonthly);
    }

    if (Array.isArray(savedQuality) && savedQuality.length === 6) {
      setQualityPicks(savedQuality);
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

  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#210947]">
      <TopNav />
      <Hero monthlyPick={monthlyPick} />
      <MonthlyPickSection monthlyPick={monthlyPick} />
      <QualityPicksSection picks={qualityPicks} />
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

function TopNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-[#efe7f7] bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#ff6b4a] text-white">
            <BarChart3 className="h-7 w-7" aria-hidden="true" />
          </div>
          <span className="text-3xl font-black tracking-tight text-[#210947]">StockyMonth</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#stock-of-month"
            className="rounded-full bg-[#fff1ea] px-5 py-3 text-sm font-black text-[#ff6b4a] transition hover:bg-[#ffe0d4]"
          >
            Stock of the Month
          </a>
          <a
            href="#quality-picks"
            className="rounded-full px-5 py-3 text-sm font-black text-[#210947] transition hover:bg-[#fff1ea]"
          >
            Top 6 High Quality Picks
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
        className="inline-flex h-12 items-center gap-2 rounded-full border border-[#210947] bg-white px-3 text-sm font-black text-[#210947] shadow-sm transition hover:bg-[#fff1ea]"
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
              <p className="text-xs font-semibold text-[#6c5d7f]">Direct access enabled</p>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-[#fff1ea] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black">Access</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Open</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#6c5d7f]">
              Stripe subscription is paused. Monthly picks, quality ideas, history, and live ticker analysis are open.
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
    <section className="border-b border-[#efe7f7] bg-white px-6 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#fff1ea] px-4 py-2 text-sm font-black text-[#ff6b4a]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {monthlyPick.month} Stock of the Month
          </p>
          <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight text-[#210947] md:text-5xl">
            Monthly stock picks with focused data, thesis, and quality shortlist.
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-9 text-[#4d3f68]">
            {monthlyPick.name} ({monthlyPick.ticker}) is the current featured idea. Review the thesis,
            open detailed Alpha Vantage charts, and compare six high-quality stocks.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#stock-of-month"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#210947] px-8 text-base font-black text-white transition hover:bg-[#32145f]"
            >
              View stock of the month
            </a>
            <a
              href="#quality-picks"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#ff6b4a] px-8 text-base font-black text-white transition hover:bg-[#f45d3c]"
            >
              See top quality picks
            </a>
          </div>
        </div>

        <div className="rounded-md border border-[#efe7f7] bg-[#f7f0ff] p-5 shadow-xl">
          <div className="rounded-md bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#efe7f7] pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d7ca3]">Latest stock pick</p>
                <h2 className="mt-2 text-3xl font-black text-[#210947]">{monthlyPick.ticker}</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
                {monthlyPick.rating}
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Price" value={monthlyPick.price} />
              <MiniStat label="Move" value={monthlyPick.change} positive={monthlyPick.change.startsWith("+")} />
              <MiniStat label="Sector" value={monthlyPick.sector} />
            </div>
            <div className="mt-6 h-44 rounded-md bg-[#fffaf7] p-4">
              <div className="flex h-full items-end gap-2">
                {[42, 58, 49, 70, 63, 76, 68, 82, 78, 90, 84, 96].map((height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className="flex-1 rounded-t bg-[#ff6b4a]"
                    style={{ height: `${height}%`, opacity: 0.45 + index / 24 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
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
    <section id="stock-of-month" className="bg-white px-6 py-8 md:py-12">
      <div className="mx-auto max-w-[1460px]">
        <div className="mb-7 flex items-center gap-3 text-[#210947]">
          <CircleGauge className="h-6 w-6" aria-hidden="true" />
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">Our Latest Stock Pick</h2>
        </div>

        <article className="overflow-hidden rounded-md border border-[#e7e1ea] bg-white p-5 shadow-sm md:p-7">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-stretch">
            <MonthlyPickArtwork month={monthlyPick.month} />

            <div className="flex min-w-0 flex-col justify-center py-2">
              <div className="flex flex-wrap items-center gap-3">
                <EQTLogo />
                <span className="inline-flex items-center gap-2 rounded-full bg-[#21877a] px-4 py-2 text-base font-black text-white">
                  <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                  {monthlyPick.rating}
                </span>
              </div>

              <h3 className="mt-5 font-serif text-3xl font-black leading-tight text-[#210947] md:text-4xl">
                {monthlyPick.name} ({monthlyPick.ticker})
              </h3>

              <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3 text-base font-black text-[#7a6a9b]">
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5 text-[#7a6a9b]" aria-hidden="true" />
                  {monthlyPick.sector}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Database className="h-5 w-5 text-[#7a6a9b]" aria-hidden="true" />
                  {monthlyPick.price}{" "}
                  <span className={monthlyPick.change.startsWith("+") ? "text-emerald-700" : "text-[#df2d74]"}>
                    ({monthlyPick.change})
                  </span>
                </span>
              </div>

              <p className="mt-5 max-w-5xl text-xl font-bold leading-9 text-[#796b99]">{monthlyPick.summary}</p>

              <div className="mt-9">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#210947] text-[#ff7b59]">
                    <CircleDollarSign className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h4 className="text-xl font-black uppercase tracking-tight text-[#210947]">
                    Why are we backing {monthlyPick.ticker} with our own money?
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
                className="mt-9 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-[#ff6b4a] px-6 text-sm font-black text-white transition hover:bg-[#f45d3c]"
              >
                Detailed analysis
                <LineChart className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function MonthlyPickArtwork({ month }: { month: string }) {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-md bg-[#d6e9e7] p-6 sm:p-10">
      <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[#207d72]" />
      <div className="absolute left-20 -top-24 h-56 w-56 rounded-full bg-[#88beb8]" />
      <div className="absolute -left-16 top-24 h-36 w-36 rounded-[42px] bg-[#bce3df]" />
      <div className="absolute right-24 top-0 h-24 w-64 bg-[#bde2df]" />
      <div className="absolute right-12 top-0 h-24 w-28 skew-x-[-24deg] bg-[#7db4ae]" />
      <div className="absolute -right-10 top-8 h-28 w-28 rounded-[42px] bg-[#207d72] rotate-45" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#207d72]" />
      <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[150px] border-l-[150px] border-b-[#207d72] border-l-transparent" />
      <div className="absolute bottom-0 right-20 h-0 w-0 border-b-[120px] border-l-[120px] border-b-[#88beb8] border-l-transparent" />

      <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-center">
        <div className="mb-12 flex items-center justify-center gap-4">
          <span className="text-[#210947]">
            <BadgeCheck className="h-12 w-12" aria-hidden="true" />
          </span>
          <h3 className="font-serif text-4xl font-black text-[#210947] md:text-5xl">{month} Pick</h3>
        </div>

        <div className="relative rounded-md bg-white p-7 shadow-sm md:p-9">
          <div className="absolute -top-6 left-8 flex items-center">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-[#ffcfbf]">
              <div className="mx-auto mt-2 h-7 w-7 rounded-full bg-[#21104d]" />
              <div className="mx-auto mt-1 h-7 w-10 rounded-t-full bg-[#ff7b59]" />
            </div>
            <div className="-ml-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#210947] text-[#ff7b59] ring-4 ring-white">
              <CircleDollarSign className="h-8 w-8" aria-hidden="true" />
            </div>
          </div>

          <blockquote className="mt-8 font-serif text-2xl font-black leading-tight text-[#210947] md:text-[28px] md:leading-tight">
            "The components: the lowest-cost position, multiple powerful secular tailwinds, and improving business fundamentals.
            The result: the twin turbines of explosive EPS/FCF growth and a likely re-rating that will send the stock soaring over a multi-year period."
          </blockquote>
          <p className="mt-6 text-base font-black text-[#210947]">- Anthony Lee, Lead Analyst at StockyMonth</p>
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
      <p className="text-xl font-bold leading-8 text-[#210947]">{text}</p>
    </div>
  );
}

function QualityPicksSection({ picks }: { picks: QualityPick[] }) {
  return (
    <section id="quality-picks" className="border-y border-[#efe7f7] bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff6b4a]">Top 6 High Quality Picks</p>
          <h2 className="mt-3 text-4xl font-black text-[#210947]">Static shortlist you can update from admin</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picks.map((pick) => (
            <Link
              key={pick.ticker}
              href={`/analysis/${pick.ticker}`}
              className="group rounded-md border border-[#efe7f7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1ea] text-lg font-black text-[#ff6b4a]">
                  {pick.ticker.slice(0, 2)}
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{pick.tag}</span>
              </div>
              <h3 className="mt-5 text-2xl font-black text-[#210947] group-hover:text-[#ff6b4a]">
                {pick.name} ({pick.ticker})
              </h3>
              <p className="mt-1 font-bold text-[#6c5d7f]">{pick.sector}</p>
              <div className="mt-5 flex items-end justify-between">
                <p className="text-xl font-black text-[#210947]">{pick.price}</p>
                <p className={`text-sm font-black ${pick.change.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>
                  {pick.change}
                </p>
              </div>
              <p className="mt-5 line-clamp-3 leading-7 text-[#4d3f68]">{pick.thesis}</p>
            </Link>
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
          <h2 className="mt-3 text-4xl font-black">Get monthly picks for $1.99</h2>
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
                <span className="text-5xl font-black">$1.99</span>
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
          <h2 className="mt-3 text-4xl font-black text-[#210947]">Manage monthly and quality picks</h2>
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

function readStoredValue<T>(key: string): T | null {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
}
