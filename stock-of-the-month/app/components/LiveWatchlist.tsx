"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCcw, Search, TrendingDown, TrendingUp } from "lucide-react";

type Quote = {
  change: number | null;
  changePercent: number | null;
  currency: string;
  exchange: string;
  marketCap: number | null;
  name: string;
  price: number | null;
  quoteTime: number | null;
  symbol: string;
  volume: number | null;
};

const initialSymbols = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "NFLX", "TSLA", "META"];

export default function LiveWatchlist() {
  const [symbols, setSymbols] = useState(initialSymbols);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [asOf, setAsOf] = useState("");

  const symbolKey = useMemo(() => symbols.join(","), [symbols]);

  async function loadQuotes(activeSymbols = symbols) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/stocks?symbols=${encodeURIComponent(activeSymbols.join(","))}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as {
        asOf?: string;
        error?: string;
        quotes?: Quote[];
      };

      if (!response.ok || payload.error) {
        setError("Live quotes are temporarily unavailable. Try refreshing in a moment.");
      }

      setQuotes(payload.quotes ?? []);
      setAsOf(payload.asOf ?? new Date().toISOString());
    } catch {
      setError("Live quotes are temporarily unavailable. Try refreshing in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadQuotes(symbols);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolKey]);

  function addSymbol() {
    const nextSymbol = query.trim().toUpperCase();

    if (!/^[A-Z0-9.^-]{1,12}$/.test(nextSymbol)) {
      setError("Enter a valid ticker symbol, for example AAPL, MSFT, BRK-B, or ^GSPC.");
      return;
    }

    setSymbols((current) => [nextSymbol, ...current.filter((symbol) => symbol !== nextSymbol)].slice(0, 24));
    setQuery("");
  }

  return (
    <section id="watchlist" className="border-y border-slate-200 bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_520px] lg:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#0f766e]">Live Watchlist</p>
            <h2 className="mt-3 text-4xl font-extrabold text-slate-950">Search any stock and track live market data</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Add tickers to the watchlist and compare live quote data across price,
              daily move, volume, market cap, exchange, and quote time.
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-slate-200 bg-white px-4">
                <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addSymbol();
                    }
                  }}
                  placeholder="Search ticker, e.g. AAPL"
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm font-bold uppercase text-slate-900 outline-none placeholder:normal-case placeholder:text-slate-400"
                />
              </label>
              <button
                type="button"
                onClick={addSymbol}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-5 text-sm font-extrabold text-white transition hover:bg-[#115e59]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
              <button
                type="button"
                onClick={() => loadQuotes(symbols)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500 max-lg:hidden">
            <span>Stock</span>
            <span>Price</span>
            <span>Day move</span>
            <span>Volume</span>
            <span>Market cap</span>
          </div>

          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Loading live quotes...
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {quotes.map((quote) => (
                <QuoteRow key={quote.symbol} quote={quote} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Quote source: Yahoo Finance. Market data may be delayed depending on exchange rules.</p>
          {asOf && <p>Last refreshed: {new Date(asOf).toLocaleString()}</p>}
        </div>
      </div>
    </section>
  );
}

function QuoteRow({ quote }: { quote: Quote }) {
  const isPositive = (quote.change ?? 0) >= 0;

  return (
    <article className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_0.9fr] lg:items-center">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#07111f] text-sm font-extrabold text-cyan-200">
            {quote.symbol.slice(0, 3)}
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-950">{quote.symbol}</p>
            <p className="line-clamp-1 text-sm font-semibold text-slate-500">{quote.name}</p>
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-400 lg:hidden">{quote.exchange}</p>
      </div>

      <Metric label="Price" value={formatCurrency(quote.price, quote.currency)} />

      <div>
        <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-slate-400 lg:hidden">Day move</p>
        <div className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {formatSigned(quote.change)} ({formatPercent(quote.changePercent)})
        </div>
      </div>

      <Metric label="Volume" value={formatCompact(quote.volume)} />
      <Metric label="Market cap" value={formatCompact(quote.marketCap)} />
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-slate-400 lg:hidden">{label}</p>
      <p className="text-base font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function formatCurrency(value: number | null, currency: string) {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 2,
    style: "currency"
  }).format(value);
}

function formatSigned(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatCompact(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    notation: "compact"
  }).format(value);
}
