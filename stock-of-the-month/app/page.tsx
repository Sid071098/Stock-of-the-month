import Link from "next/link";
import { ArrowRight, BarChart3, Check, ShieldCheck, Sparkles } from "lucide-react";
import { defaultMonthlyPick, defaultQualityPicks } from "./lib/picks";

export default function LandingPage({
  searchParams
}: {
  searchParams?: { subscribe?: string };
}) {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <nav className="border-b border-white/10 bg-[#0f172a]/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500 text-slate-950">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-3xl font-black">Stockymonth</span>
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/dashboard" className="text-sm font-bold text-slate-200 hover:text-white">
              Dashboard
            </Link>
            <Link href="/history" className="text-sm font-bold text-slate-200 hover:text-white">
              History
            </Link>
            <form action="/api/checkout" method="POST">
              <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
                Get Monthly Picks for $1.99
              </button>
            </form>
          </div>
        </div>
      </nav>

      {searchParams?.subscribe === "required" && (
        <div className="border-b border-amber-300/20 bg-amber-300/10 px-6 py-3 text-center text-sm font-bold text-amber-100">
          Subscribe to access the dashboard, history, and analysis pages.
        </div>
      )}

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_430px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-4 py-2 text-sm font-bold text-emerald-200">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI-assisted monthly stock research
            </div>
            <h1 className="mt-6 max-w-5xl text-6xl font-black leading-tight tracking-tight md:text-7xl">
              One monthly pick, six quality stocks, and a clear thesis.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-300">
              Stockymonth combines Alpha Vantage market data with OpenAI-generated research summaries so subscribers can review the stock of the month with context, discipline, and speed.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <form action="/api/checkout" method="POST">
                <button className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 text-base font-black text-slate-950 transition hover:bg-emerald-400">
                  Get Monthly Picks for $1.99
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
              <Link
                href="/analysis/EQT"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/10 px-8 text-base font-black text-white transition hover:bg-white/15"
              >
                Preview analysis
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-200">Stock of the month</p>
            <h2 className="mt-4 text-5xl font-black">{defaultMonthlyPick.ticker}</h2>
            <p className="mt-2 text-lg font-bold text-slate-300">{defaultMonthlyPick.name}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-white p-4 text-slate-950">
                <p className="text-xs font-black uppercase text-slate-500">Price</p>
                <p className="mt-1 text-2xl font-black">{defaultMonthlyPick.price}</p>
              </div>
              <div className="rounded-md bg-white p-4 text-slate-950">
                <p className="text-xs font-black uppercase text-slate-500">Move</p>
                <p className="mt-1 text-2xl font-black text-emerald-600">{defaultMonthlyPick.change}</p>
              </div>
            </div>
            <p className="mt-6 leading-7 text-slate-200">{defaultMonthlyPick.thesis}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white px-6 py-16 text-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">Included</p>
              <h2 className="mt-3 text-4xl font-black">Stock of the month plus 6 high-quality picks</h2>
            </div>
            <ShieldCheck className="hidden h-12 w-12 text-emerald-500 md:block" aria-hidden="true" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {defaultQualityPicks.map((pick) => (
              <Link
                key={pick.ticker}
                href={`/analysis/${pick.ticker}`}
                className="rounded-md border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black">{pick.ticker}</h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                    {pick.tag}
                  </span>
                </div>
                <p className="mt-2 font-bold text-slate-600">{pick.name}</p>
                <p className="mt-4 text-sm leading-6 text-slate-500">{pick.sector}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-md border border-white/15 bg-white/10 p-8 text-center backdrop-blur-xl">
          <h2 className="text-4xl font-black">Simple recurring access</h2>
          <p className="mt-4 text-lg text-slate-300">
            $1.99/month with promotion-code support enabled in Stripe Checkout.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-200">
            {["Student discount ready", "Customer portal", "Stripe webhooks", "AI thesis generation"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
