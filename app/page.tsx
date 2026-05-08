import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Crown,
  LockKeyhole,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from "lucide-react";
import StripePricingTable from "./components/StripePricingTable";
import { getStockOfMonth, type StockOfMonth } from "./lib/stockOfMonth";

const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const dynamic = "force-dynamic";

function buildMonthlyIdeas(featuredPick: StockOfMonth) {
  return [
    {
      ticker: featuredPick.ticker,
      name: featuredPick.name,
      label: "Stock of the Month",
      date: featuredPick.date,
      title: `Why ${featuredPick.ticker} is the desk's highest-conviction idea this month`,
      summary: featuredPick.summary,
      score: "A",
      tone: "Bullish"
    },
    {
      ticker: "GOOGL",
      name: "Alphabet",
      label: "Watchlist",
      date: "May 07, 2026",
      title: "Search durability meets AI infrastructure optionality",
      summary:
        "Alphabet screens well for cash generation, ecosystem reach, and AI investment capacity, but sentiment remains catalyst-driven.",
      score: "B+",
      tone: "Constructive"
    },
    {
      ticker: "TSM",
      name: "Taiwan Semiconductor",
      label: "Semiconductor Pick",
      date: "May 06, 2026",
      title: "The manufacturing backbone behind the AI capex cycle",
      summary:
        "TSM remains a clean way to underwrite advanced-node demand without choosing a single end-device winner.",
      score: "A-",
      tone: "Bullish"
    },
    {
      ticker: "COST",
      name: "Costco",
      label: "Defensive Growth",
      date: "May 05, 2026",
      title: "Membership economics continue to compound quietly",
      summary:
        "Costco's renewal rates, traffic consistency, and merchandising trust keep it relevant when investors want quality at scale.",
      score: "B+",
      tone: "Steady"
    }
  ];
}

const framework = [
  "Business quality and competitive durability",
  "Revenue growth, margin expansion, and cash conversion",
  "Valuation versus forward catalysts and downside risk",
  "Clear monthly action framework for your own due diligence"
];

const stats = [
  ["1", "stock of the month"],
  ["4", "supporting watchlist ideas"],
  ["12", "research issues per year"],
  ["$199", "monthly subscription"]
];

export default async function Home() {
  const featuredPick = await getStockOfMonth();
  const monthlyIdeas = buildMonthlyIdeas(featuredPick);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <TopNav />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_430px] lg:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {featuredPick.date} Stock of the Month
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.03] tracking-normal text-slate-950 md:text-7xl">
              Stock ideas with the story behind the signal.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              A StockStory-inspired research page focused on one premium monthly
              suggestion, supported by a concise watchlist of high-quality companies
              worth tracking.
            </p>

            <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-2">
              <Search className="ml-2 h-5 w-5 text-slate-400" aria-hidden="true" />
              <div className="min-w-0 flex-1 text-sm font-medium text-slate-500">
                {featuredPick.ticker}, GOOGL, TSM, COST
              </div>
              <a
                href="#latest"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Browse Picks
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-semibold text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <FeaturedCard featuredPick={featuredPick} />
        </div>
      </section>

      <section id="latest" className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Latest Suggestions</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Monthly stock research feed</h2>
            </div>
            <Newspaper className="hidden h-8 w-8 text-slate-300 sm:block" aria-hidden="true" />
          </div>

          <div className="divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            {monthlyIdeas.map((idea) => (
              <article key={idea.ticker} className="grid gap-4 p-5 transition hover:bg-slate-50 md:grid-cols-[86px_1fr_96px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-950 text-xl font-bold text-white">
                  {idea.ticker}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>{idea.label}</span>
                    <span className="text-slate-300">/</span>
                    <span>{idea.date}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold leading-snug text-slate-950">{idea.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{idea.summary}</p>
                  <a
                    href={idea.ticker === featuredPick.ticker ? "#featured" : "#pricing"}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
                  >
                    Read suggestion
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
                <div className="flex items-start justify-between gap-3 md:block md:text-right">
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Score</p>
                    <p className="text-lg font-semibold text-slate-950">{idea.score}</p>
                  </div>
                  <p className="mt-0 rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 md:mt-3">
                    {idea.tone}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <Crown className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-slate-950">This Month's Pick</p>
                <p className="text-sm text-slate-500">{featuredPick.name} ({featuredPick.ticker})</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Unlock the full monthly brief with thesis, valuation notes, catalyst
              map, and risk checklist.
            </p>
            <form action="/api/checkout" method="POST" className="mt-5">
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-500"
              >
                Subscribe Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              Secure checkout powered by Stripe
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Research Framework</p>
            <div className="mt-5 space-y-4">
              {framework.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section id="featured" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Featured Analysis</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-slate-950">
              {featuredPick.ticker} earns the premium spot for {featuredPick.date}.
            </h2>
            <p className="mt-4 text-slate-600">
              The public page gives readers a clear summary. Subscribers get the
              full recommendation memo, valuation context, and sell discipline.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AnalysisTile
              icon={<BookOpenText className="h-5 w-5" />}
              title="Story"
              copy="Streaming scale is becoming a broader monetization platform across paid sharing, ads, and live programming."
            />
            <AnalysisTile
              icon={<TrendingUp className="h-5 w-5" />}
              title="Catalysts"
              copy="Ad-tier growth, content efficiency, and buyback cadence are the key signals to watch over the next few quarters."
            />
            <AnalysisTile
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Risks"
              copy="Valuation sensitivity, content competition, and subscriber growth normalization keep position sizing important."
            />
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[1fr_430px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Premium Access</p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-950">Get the full Stock of the Month brief.</h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Built for investors who want a focused monthly idea, not an endless
            stream of alerts. Every issue includes the suggestion, evidence, valuation
            notes, catalysts, risks, and a practical monitoring checklist.
          </p>
          <p id="risk" className="mt-5 max-w-2xl text-xs leading-5 text-slate-500">
            Research is educational and not financial advice. Investing involves
            risk, including possible loss of principal.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Monthly membership</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-semibold text-slate-950">$199</span>
            <span className="pb-2 text-sm text-slate-500">/ month</span>
          </div>

          {pricingTableId ? (
            <div className="mt-6">
              <StripePricingTable
                pricingTableId={pricingTableId}
                publishableKey={publishableKey ?? ""}
              />
            </div>
          ) : (
            <form action="/api/checkout" method="POST" className="mt-6">
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Subscribe Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function TopNav() {
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-emerald-300">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-950">StockMonth</p>
            <p className="text-xs text-slate-500">One premium pick at a time</p>
          </div>
        </a>
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#latest" className="hover:text-slate-950">Latest Suggestions</a>
          <a href="#featured" className="hover:text-slate-950">Featured Pick</a>
          <a href="#pricing" className="hover:text-slate-950">Subscribe</a>
        </div>
      </div>
    </nav>
  );
}

function FeaturedCard({ featuredPick }: { featuredPick: StockOfMonth }) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-300">{featuredPick.rating}</p>
          <h2 className="mt-2 text-4xl font-semibold">{featuredPick.ticker}</h2>
          <p className="mt-1 text-slate-300">{featuredPick.name}</p>
        </div>
        <div className="rounded-md bg-emerald-400 px-3 py-2 text-sm font-bold text-slate-950">
          {featuredPick.change}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-300">Reference price</p>
          <p className="text-2xl font-semibold">{featuredPick.price}</p>
        </div>
        <div className="h-28 rounded-md bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(16,185,129,0)),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:100%_100%,44px_44px,44px_44px]" />
      </div>

      <h3 className="mt-6 text-xl font-semibold leading-snug">{featuredPick.headline}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{featuredPick.summary}</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {featuredPick.scores.map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">{value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function AnalysisTile({
  icon,
  title,
  copy
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-white text-emerald-700 shadow-sm">
        {icon}
      </div>
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
    </div>
  );
}
