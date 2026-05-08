import {
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  Grid2X2,
  LockKeyhole,
  MoreHorizontal,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserCircle2
} from "lucide-react";
import StripePricingTable from "./components/StripePricingTable";
import { getStockOfMonth, type StockOfMonth } from "./lib/stockOfMonth";

const defaultPricingTableId = "prctbl_1TUwppGgdCjtxcdnqrbSE1lS";
const defaultPublishableKey =
  "pk_live_51OXc79GgdCjtxcdnXkj1Q1Ntr72QpH8DRR3FVWjsGBAz0wwzvU5xlJG0BQsqxK0ZWVnLJC19XwUHjF1FFJlRy6V500oqCRBuDX";

const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || defaultPricingTableId;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || defaultPublishableKey;

export const revalidate = 3600;

const winningPicks = [
  {
    ticker: "FTAI",
    name: "FTAI Aviation",
    picked: "July 2024",
    returnText: "187%",
    color: "bg-cyan-600"
  },
  {
    ticker: "NET",
    name: "Cloudflare",
    picked: "September 2024",
    returnText: "160%",
    color: "bg-orange-500"
  },
  {
    ticker: "HWM",
    name: "Howmet",
    picked: "January 2025",
    returnText: "120%",
    color: "bg-teal-600"
  },
  {
    ticker: "CRWD",
    name: "CrowdStrike",
    picked: "August 2024",
    returnText: "96%",
    color: "bg-rose-600"
  }
];

const differentiators = [
  {
    number: "1.",
    title: "Focused monthly stock selection",
    copy: "One primary idea each month keeps the research process clear, disciplined, and easy to follow."
  },
  {
    number: "2.",
    title: "Analyst-style thesis and risk notes",
    copy: "Each pick includes the story, catalysts, valuation context, and the risks that could break the thesis."
  },
  {
    number: "3.",
    title: "Built for investors who want signal",
    copy: "No noisy alert stream. You get a concise research brief and a practical checklist for your own due diligence."
  }
];

const included = [
  "Monthly stock-of-the-month suggestion",
  "Research notes and catalyst checklist",
  "Risk markers and sell-discipline prompts",
  "Supporting watchlist ideas",
  "Stripe-secured subscription access"
];

function getFallbackPick(): StockOfMonth {
  return {
    ticker: "NFLX",
    name: "Netflix",
    price: "$92.12",
    change: "+18.16% 1Y",
    rating: "Featured Pick",
    date: "May 2026",
    headline:
      "Netflix is our Stock of the Month as advertising, live events, and disciplined content spending reshape the earnings story.",
    summary:
      "Our monthly research brief frames NFLX as a premium media platform with expanding monetization surfaces, stronger free cash flow, and a cleaner shareholder return profile.",
    source: "Page fallback",
    asOf: new Date().toISOString(),
    scores: [
      ["Quality", "91"],
      ["Growth", "84"],
      ["Momentum", "78"]
    ]
  };
}

export default async function Home() {
  const featuredPick = await getStockOfMonth().catch(getFallbackPick);

  return (
    <main className="min-h-screen bg-white text-[#21005d]">
      <TopNav />
      <OfferBar />
      <Hero featuredPick={featuredPick} />
      <Differentiators />
      <CheckoutSection featuredPick={featuredPick} />
    </main>
  );
}

function TopNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#ff765f] text-white">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="text-3xl font-bold text-[#21005d]">StockMonth</span>
        </a>

        <div className="hidden items-center gap-8 text-base font-bold text-[#21005d] lg:flex">
          <a href="#latest" className="inline-flex items-center gap-2">
            <Newspaper className="h-5 w-5" aria-hidden="true" />
            Newsfeed
          </a>
          <a href="#different" className="inline-flex items-center gap-2">
            <Grid2X2 className="h-5 w-5" aria-hidden="true" />
            Discover
          </a>
          <a href="#pricing" className="inline-flex items-center gap-2">
            <Star className="h-5 w-5" aria-hidden="true" />
            Watchlist
          </a>
          <a href="#pricing" className="inline-flex items-center gap-2">
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            More
          </a>
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          <div className="flex h-12 w-72 items-center gap-3 rounded-full border border-slate-200 px-4 text-slate-400">
            <Search className="h-5 w-5" aria-hidden="true" />
            <span className="text-base font-semibold">Search for stocks...</span>
          </div>
          <a
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-md bg-[#ff765f] px-5 text-center text-sm font-extrabold leading-tight text-white transition hover:bg-[#f25f48]"
          >
            Unlock Monthly Pick
          </a>
          <UserCircle2 className="h-8 w-8 text-[#21005d]" aria-hidden="true" />
        </div>
      </div>
    </nav>
  );
}

function OfferBar() {
  return (
    <div className="sticky top-20 z-20 border-b border-[#ffd8cf] bg-[#ffe0d8] px-4 py-3 text-center font-bold text-[#21005d] shadow-sm">
      <span className="mr-3">Offer expires in:</span>
      <CountdownValue value="28" label="hours" />
      <CountdownValue value="52" label="minutes" />
      <CountdownValue value="43" label="seconds" />
    </div>
  );
}

function CountdownValue({ value, label }: { value: string; label: string }) {
  return (
    <span className="mx-1 inline-flex items-center gap-2">
      <span className="rounded-md bg-[#ff765f] px-3 py-1 text-xl font-extrabold text-white">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function Hero({ featuredPick }: { featuredPick: StockOfMonth }) {
  return (
    <section className="overflow-hidden bg-[#21005d] text-white">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-9">
        <div className="mx-auto max-w-2xl space-y-4">
          <PlanRow label="Monthly" oldPrice="$9.99" price="$1.99" />
          <PlanRow label="Featured" oldPrice="$49.99" price="$1.99" highlight="This month" />
        </div>

        <div className="mx-auto mt-14 max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#ffdcd3]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {featuredPick.date} Stock of the Month
          </div>
          <h1 className="text-5xl font-extrabold leading-tight md:text-7xl">
            Unlock this month&apos;s stock pick
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-xl leading-8 text-[#ded1ff]">
            {featuredPick.name} ({featuredPick.ticker}) is this month&apos;s featured idea.
            Subscribe for the research thesis, catalysts, and risk checklist.
          </p>
          <a
            href="#pricing"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[#ff765f] px-10 text-base font-extrabold text-white transition hover:bg-[#f25f48]"
          >
            Unlock this month&apos;s picks
          </a>
        </div>

        <section id="latest" className="mt-16">
          <h2 className="text-center text-4xl font-extrabold text-white">Recent Winning Picks</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {winningPicks.map((pick) => (
              <WinningPickCard key={pick.ticker} pick={pick} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function PlanRow({
  label,
  oldPrice,
  price,
  highlight
}: {
  label: string;
  oldPrice: string;
  price: string;
  highlight?: string;
}) {
  return (
    <div className="grid items-center gap-4 rounded-md bg-white/12 px-5 py-5 shadow-lg md:grid-cols-[1fr_auto_auto]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/25 px-4 py-2 text-sm font-extrabold text-white">{label}</span>
        {highlight && (
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white">
            {highlight}
          </span>
        )}
      </div>
      <div className="text-3xl font-extrabold">
        <span className="mr-2 text-2xl text-white/35 line-through">{oldPrice}</span>
        {price}
      </div>
      <a
        href="#pricing"
        className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-extrabold uppercase text-[#21005d]"
      >
        Sign up now
      </a>
    </div>
  );
}

function WinningPickCard({
  pick
}: {
  pick: {
    ticker: string;
    name: string;
    picked: string;
    returnText: string;
    color: string;
  };
}) {
  return (
    <article className="rounded-md bg-white p-6 text-[#21005d] shadow-xl">
      <div className="flex items-start gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${pick.color} text-xl font-extrabold text-white`}>
          {pick.ticker.slice(0, 1)}
        </div>
        <div>
          <h3 className="text-2xl font-extrabold leading-tight">
            {pick.name} ({pick.ticker})
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#7766a4]">Picked: {pick.picked}</p>
          <p className="text-sm font-semibold text-[#7766a4]">Returns as of: December 2025</p>
        </div>
      </div>
      <div className="mt-7 rounded-md bg-emerald-100 px-4 py-4 text-center text-xl font-extrabold text-emerald-800">
        Total Return {pick.returnText}
      </div>
    </article>
  );
}

function Differentiators() {
  return (
    <section id="different" className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-5xl font-extrabold leading-tight text-[#21005d]">
          What Makes StockMonth Different?
        </h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {differentiators.slice(0, 2).map((item) => (
            <DifferentiatorCard key={item.number} item={item} />
          ))}
          <div className="lg:col-span-2">
            <DifferentiatorCard item={differentiators[2]} wide />
          </div>
        </div>
      </div>
    </section>
  );
}

function DifferentiatorCard({
  item,
  wide = false
}: {
  item: { number: string; title: string; copy: string };
  wide?: boolean;
}) {
  return (
    <article className={`rounded-md border border-slate-200 bg-white p-8 shadow-sm ${wide ? "lg:grid lg:grid-cols-[1fr_260px] lg:items-center lg:gap-10" : ""}`}>
      <div>
        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-[#e4d8ff] text-2xl font-extrabold text-[#21005d]">
          {item.number}
        </div>
        <h3 className="text-2xl font-extrabold text-[#21005d]">{item.title}</h3>
        <p className="mt-4 text-xl leading-8 text-[#21005d]">{item.copy}</p>
      </div>
      {wide && (
        <div className="mt-8 rounded-md bg-[#e4d8ff] p-6 text-center lg:mt-0">
          <Trophy className="mx-auto h-16 w-16 text-[#ff765f]" aria-hidden="true" />
          <p className="mt-4 text-lg font-extrabold text-[#21005d]">Simple, focused, monthly</p>
        </div>
      )}
    </article>
  );
}

function CheckoutSection({ featuredPick }: { featuredPick: StockOfMonth }) {
  return (
    <section id="pricing" className="bg-[#21005d] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-md border border-white/10 bg-[#21005d] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="p-8 md:p-12">
          <p className="text-lg font-extrabold text-[#ffb7a9]">Try StockMonth Edge today</p>
          <h2 className="mt-4 text-5xl font-extrabold leading-tight">Subscribe for detailed analysis.</h2>
          <p className="mt-5 text-xl leading-8 text-[#ded1ff]">
            Get the full {featuredPick.ticker} research brief plus the monthly watchlist,
            risk notes, and catalysts to monitor.
          </p>

          <h3 className="mt-12 text-2xl font-extrabold">What you get</h3>
          <div className="mt-6 space-y-5">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-lg font-bold">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-3 text-lg font-bold text-white">
            <p>Questions? Contact support through your Stripe receipt email.</p>
            <p className="underline">How does StockMonth research work? Read the brief after subscribing.</p>
          </div>
        </div>

        <div className="bg-white p-6 text-slate-950 md:p-10">
          <div className="mb-8 rounded-md border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Subscribe to StockMonth</p>
                <p className="mt-2 text-4xl font-extrabold text-slate-950">$1.99</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">per month</p>
              </div>
              <ShieldCheck className="h-12 w-12 text-emerald-600" aria-hidden="true" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
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
