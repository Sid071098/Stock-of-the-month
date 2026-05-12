"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Check,
  ChevronDown,
  Crown,
  Edit3,
  LockKeyhole,
  LogOut,
  RefreshCcw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCircle
} from "lucide-react";
import StripePricingTable from "./StripePricingTable";
import type { MonthlyPick, QualityPick } from "../lib/picks";

const monthlyStorageKey = "stockmonth.monthlyPick";
const qualityStorageKey = "stockmonth.qualityPicks";

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
    <main className="min-h-screen bg-[#0f172a] text-white">
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
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0f172a]/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#22c55e] text-[#0f172a] shadow-sm">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">Stockymonth</span>
        </a>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#stock-of-month"
            className="rounded-full bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
          >
            Stock of the Month
          </a>
          <a
            href="#quality-picks"
            className="rounded-full px-5 py-3 text-sm font-extrabold text-slate-200 transition hover:bg-white/10"
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
        className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-white/15"
      >
        <UserCircle className="h-7 w-7 text-[#22c55e]" aria-hidden="true" />
        <span className="hidden sm:inline">Profile</span>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-md border border-orange-100 bg-white p-4 text-[#210c2c] shadow-2xl">
          <div className="flex items-start gap-3 border-b border-orange-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#210c2c] text-sm font-extrabold text-white">
              SP
            </div>
            <div>
              <p className="text-sm font-extrabold">Siddharth Patel</p>
              <p className="text-xs font-semibold text-slate-500">Admin access</p>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-orange-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold">Subscription</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                $1.99/mo
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
              Monthly pick research and quality-stock shortlist access.
            </p>
          </div>

          <div className="mt-4 grid gap-2">
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold hover:bg-orange-50">
              <Crown className="h-4 w-4 text-[#ff6b45]" aria-hidden="true" />
              Manage subscription
            </a>
            <a href="#admin" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold hover:bg-orange-50">
              <Settings className="h-4 w-4 text-[#ff6b45]" aria-hidden="true" />
              Admin editor
            </a>
            <button type="button" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-slate-500 hover:bg-orange-50">
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
    <section className="border-b border-orange-100 bg-white px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1eb] px-4 py-2 text-sm font-extrabold text-[#d94f2b]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {monthlyPick.month} Stock of the Month
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight tracking-tight text-[#210c2c] md:text-7xl">
            One monthly stock idea. Six quality names to watch.
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-[#5f5068]">
            {monthlyPick.name} ({monthlyPick.ticker}) is the current featured pick.
            Review the thesis, compare the quality shortlist, and subscribe when you want the full research flow.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#stock-of-month"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#ff6b45] px-8 text-base font-extrabold text-white shadow-sm transition hover:bg-[#f05c38]"
            >
              View stock of the month
            </a>
            <a
              href="#quality-picks"
              className="inline-flex h-14 items-center justify-center rounded-full border border-orange-200 bg-white px-8 text-base font-extrabold text-[#210c2c] transition hover:bg-orange-50"
            >
              See top 6 picks
            </a>
          </div>
        </div>

        <div className="rounded-md border border-orange-100 bg-[#fff7f2] p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d94f2b]">Current pick</p>
              <h2 className="mt-3 text-4xl font-black text-[#210c2c]">
                {monthlyPick.name} ({monthlyPick.ticker})
              </h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
              {monthlyPick.rating}
            </span>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <Metric label="Price" value={monthlyPick.price} />
            <Metric label="Move" value={monthlyPick.change} positive={monthlyPick.change.startsWith("+")} />
          </div>

          <p className="mt-6 text-base font-semibold leading-7 text-[#5f5068]">{monthlyPick.thesis}</p>
        </div>
      </div>
    </section>
  );
}

function MonthlyPickSection({ monthlyPick }: { monthlyPick: MonthlyPick }) {
  return (
    <section id="stock-of-month" className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d94f2b]">Stock of the Month</p>
          <h2 className="mt-3 text-4xl font-black text-[#210c2c]">{monthlyPick.month} Pick</h2>
        </div>

        <div className="grid overflow-hidden rounded-md border border-orange-100 bg-white shadow-sm lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex min-h-80 flex-col justify-between bg-[#ffe4d8] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#ff6b45] text-lg font-black text-white">
                {monthlyPick.ticker.slice(0, 3)}
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#d94f2b]">{monthlyPick.rating}</span>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d94f2b]">Manual monthly selection</p>
              <h3 className="mt-3 text-5xl font-black text-[#210c2c]">{monthlyPick.month}</h3>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black text-[#210c2c]">
                  {monthlyPick.name} ({monthlyPick.ticker})
                </h3>
                <p className="mt-2 text-sm font-extrabold text-[#7a687f]">{monthlyPick.sector}</p>
              </div>
              <div className="rounded-md border border-orange-100 bg-[#fffaf7] px-4 py-3 text-right">
                <p className="text-2xl font-black text-[#210c2c]">{monthlyPick.price}</p>
                <p className={`text-sm font-black ${monthlyPick.change.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>
                  {monthlyPick.change}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-md border border-orange-100 bg-[#fffaf7] p-5">
              <p className="text-xs font-black uppercase tracking-wide text-[#d94f2b]">Investment thesis</p>
              <p className="mt-3 text-lg leading-8 text-[#5f5068]">{monthlyPick.summary}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Quality", "Growth", "Timing"].map((label, index) => (
                <div key={label} className="rounded-md border border-orange-100 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#a493aa]">{label}</p>
                  <p className="mt-1 text-2xl font-black text-[#ff6b45]">{[92, 86, 81][index]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QualityPicksSection({ picks }: { picks: QualityPick[] }) {
  return (
    <section id="quality-picks" className="border-y border-orange-100 bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d94f2b]">Top 6 High Quality Picks</p>
            <h2 className="mt-3 text-4xl font-black text-[#210c2c]">Static shortlist from StockStory right now</h2>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            High Quality + Timely Buy
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picks.map((pick) => (
            <article key={pick.ticker} className="rounded-md border border-orange-100 bg-[#fffaf7] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-black text-[#ff6b45] shadow-sm">
                    {pick.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                      {pick.tag}
                    </span>
                    <h3 className="mt-3 text-2xl font-black text-[#210c2c]">
                      {pick.name} ({pick.ticker})
                    </h3>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm font-extrabold text-[#7a687f]">{pick.sector}</p>
              <div className="mt-5 flex items-center gap-3">
                <p className="text-xl font-black text-[#210c2c]">{pick.price}</p>
                <p className={`text-sm font-black ${pick.change.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>
                  {pick.change}
                </p>
              </div>
              <p className="mt-5 text-base leading-7 text-[#5f5068]">{pick.thesis}</p>
            </article>
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
    <section id="pricing" className="bg-[#210c2c] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-md border border-white/10 bg-[#2d123a] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="p-8 md:p-12">
          <p className="text-lg font-black text-orange-200">Subscribe to StockMonth</p>
          <h2 className="mt-4 text-5xl font-black leading-tight">Get the full {monthlyPick.ticker} research brief.</h2>
          <p className="mt-5 text-xl leading-8 text-purple-100">
            One simple subscription for monthly stock-of-the-month research and the quality-stock shortlist.
          </p>

          <div className="mt-10 space-y-5">
            {["$1.99 monthly subscription", "Manual monthly pick updates", "Editable high-quality stock shortlist", "Stripe-secured checkout"].map((item) => (
              <div key={item} className="flex items-center gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff6b45]">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-lg font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 text-[#210c2c] md:p-10">
          <div className="mb-8 rounded-md border border-orange-100 bg-[#fffaf7] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#7a687f]">Monthly plan</p>
                <p className="mt-2 text-4xl font-black">$1.99</p>
                <p className="mt-1 text-sm font-semibold text-[#7a687f]">per month</p>
              </div>
              <ShieldCheck className="h-12 w-12 text-[#ff6b45]" aria-hidden="true" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#7a687f]">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              Secure payment powered by Stripe
            </div>
          </div>

          <StripePricingTable pricingTableId={pricingTableId} publishableKey={publishableKey} />
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
    setQualityDrafts((current) =>
      current.map((pick, pickIndex) => (pickIndex === index ? { ...pick, [field]: value } : pick))
    );
  }

  return (
    <section id="admin" className="bg-[#fffaf7] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d94f2b]">Admin</p>
          <h2 className="mt-3 text-4xl font-black text-[#210c2c]">Manage monthly and quality picks</h2>
          <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#5f5068]">
            These admin controls save changes in this browser. For production-wide updates, connect this form to a database and protected admin login.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#ff6b45]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#210c2c]">Add one stock per month</h3>
            </div>

            <div className="grid gap-4">
              <Field label="Month" value={monthlyDraft.month} onChange={(value) => updateMonthlyField("month", value)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ticker" value={monthlyDraft.ticker} onChange={(value) => updateMonthlyField("ticker", value.toUpperCase())} />
                <Field label="Name" value={monthlyDraft.name} onChange={(value) => updateMonthlyField("name", value)} />
              </div>
              <Field label="Sector" value={monthlyDraft.sector} onChange={(value) => updateMonthlyField("sector", value)} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Price" value={monthlyDraft.price} onChange={(value) => updateMonthlyField("price", value)} />
                <Field label="Change" value={monthlyDraft.change} onChange={(value) => updateMonthlyField("change", value)} />
                <Field label="Rating" value={monthlyDraft.rating} onChange={(value) => updateMonthlyField("rating", value)} />
              </div>
              <AreaField label="Headline thesis" value={monthlyDraft.thesis} onChange={(value) => updateMonthlyField("thesis", value)} />
              <AreaField label="Summary" value={monthlyDraft.summary} onChange={(value) => updateMonthlyField("summary", value)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSaveMonthlyPick(monthlyDraft)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6b45] px-5 text-sm font-black text-white"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save monthly pick
              </button>
              <button
                type="button"
                onClick={onResetMonthlyPick}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-orange-200 px-5 text-sm font-black text-[#210c2c]"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-md border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-[#ff6b45]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#210c2c]">Add or modify top 6 stocks</h3>
            </div>

            <div className="space-y-5">
              {qualityDrafts.map((pick, index) => (
                <div key={`${pick.ticker}-${index}`} className="rounded-md border border-orange-100 bg-[#fffaf7] p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#d94f2b]">Quality pick {index + 1}</p>
                  <div className="grid gap-3 md:grid-cols-4">
                    <Field compact label="Ticker" value={pick.ticker} onChange={(value) => updateQualityField(index, "ticker", value.toUpperCase())} />
                    <Field compact label="Name" value={pick.name} onChange={(value) => updateQualityField(index, "name", value)} />
                    <Field compact label="Price" value={pick.price} onChange={(value) => updateQualityField(index, "price", value)} />
                    <Field compact label="Change" value={pick.change} onChange={(value) => updateQualityField(index, "change", value)} />
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
                    <Field compact label="Sector" value={pick.sector} onChange={(value) => updateQualityField(index, "sector", value)} />
                    <Field compact label="Thesis" value={pick.thesis} onChange={(value) => updateQualityField(index, "thesis", value)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSaveQualityPicks(qualityDrafts)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6b45] px-5 text-sm font-black text-white"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save top 6
              </button>
              <button
                type="button"
                onClick={onResetQualityPicks}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-orange-200 px-5 text-sm font-black text-[#210c2c]"
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

function Field({
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
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-[#a493aa]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${compact ? "h-10" : "h-12"} w-full rounded-md border border-orange-100 bg-white px-3 text-sm font-bold text-[#210c2c] outline-none transition focus:border-[#ff6b45]`}
      />
    </label>
  );
}

function AreaField({
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
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-[#a493aa]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-orange-100 bg-white px-3 py-3 text-sm font-bold leading-6 text-[#210c2c] outline-none transition focus:border-[#ff6b45]"
      />
    </label>
  );
}

function Metric({ label, positive, value }: { label: string; positive?: boolean; value: string }) {
  return (
    <div className="rounded-md border border-orange-100 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#a493aa]">{label}</p>
      <p className={`mt-1 text-2xl font-black ${positive === undefined ? "text-[#210c2c]" : positive ? "text-emerald-700" : "text-rose-600"}`}>
        {value}
      </p>
    </div>
  );
}

function readStoredValue<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}
