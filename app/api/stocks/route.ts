import { NextResponse } from "next/server";

type YahooQuote = {
  currency?: string;
  displayName?: string;
  exchange?: string;
  fullExchangeName?: string;
  longName?: string;
  marketCap?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPrice?: number;
  regularMarketTime?: number;
  regularMarketVolume?: number;
  shortName?: string;
  symbol?: string;
};

const defaultSymbols = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "NFLX", "TSLA", "META"];
const knownNames: Record<string, string> = {
  AAPL: "Apple Inc.",
  AMZN: "Amazon.com, Inc.",
  CRWD: "CrowdStrike Holdings, Inc.",
  FTAI: "FTAI Aviation Ltd.",
  GOOGL: "Alphabet Inc.",
  HWM: "Howmet Aerospace Inc.",
  META: "Meta Platforms, Inc.",
  MSFT: "Microsoft Corporation",
  NET: "Cloudflare, Inc.",
  NFLX: "Netflix, Inc.",
  NVDA: "NVIDIA Corporation",
  TSLA: "Tesla, Inc."
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = sanitizeSymbols(searchParams.get("symbols"));

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  const url = new URL("https://query1.finance.yahoo.com/v7/finance/quote");
  url.searchParams.set("symbols", symbols.join(","));

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "StockMonth/1.0"
      }
    });

    if (!response.ok) {
      return fetchStooqQuotes(symbols);
    }

    const payload = (await response.json()) as {
      quoteResponse?: { result?: YahooQuote[] };
    };

    const quotes = (payload.quoteResponse?.result ?? []).map((quote) => ({
      change: quote.regularMarketChange ?? null,
      changePercent: quote.regularMarketChangePercent ?? null,
      currency: quote.currency ?? "USD",
      exchange: quote.fullExchangeName ?? quote.exchange ?? "Market",
      marketCap: quote.marketCap ?? null,
      name: quote.longName ?? quote.shortName ?? quote.displayName ?? quote.symbol ?? "Unknown",
      price: quote.regularMarketPrice ?? null,
      quoteTime: quote.regularMarketTime ? quote.regularMarketTime * 1000 : null,
      symbol: quote.symbol ?? "",
      volume: quote.regularMarketVolume ?? null
    }));

    return NextResponse.json(
      { quotes, source: "Yahoo Finance", asOf: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60"
        }
      }
    );
  } catch {
    return fetchStooqQuotes(symbols);
  }
}

function sanitizeSymbols(value: string | null) {
  const rawSymbols = value
    ? value.split(",")
    : defaultSymbols;

  return Array.from(
    new Set(
      rawSymbols
        .map((symbol) => symbol.trim().toUpperCase())
        .filter((symbol) => /^[A-Z0-9.^-]{1,12}$/.test(symbol))
    )
  ).slice(0, 24);
}

async function fetchStooqQuotes(symbols: string[]) {
  const stooqSymbols = symbols.map(toStooqSymbol);
  const url = new URL("https://stooq.com/q/l/");
  url.searchParams.set("s", stooqSymbols.join(" "));
  url.searchParams.set("f", "sd2t2ohlcv");
  url.searchParams.set("h", "");
  url.searchParams.set("e", "csv");

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
        "User-Agent": "StockMonth/1.0"
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "quote_source_unavailable", quotes: [] },
        { status: 502 }
      );
    }

    const csv = await response.text();
    const quotes = parseStooqCsv(csv);

    return NextResponse.json(
      { quotes, source: "Stooq", asOf: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60"
        }
      }
    );
  } catch {
    return NextResponse.json(
      { error: "quote_fetch_failed", quotes: [] },
      { status: 502 }
    );
  }
}

function toStooqSymbol(symbol: string) {
  if (symbol.includes(".") || symbol.startsWith("^")) {
    return symbol.toLowerCase();
  }

  return `${symbol.toLowerCase()}.us`;
}

function parseStooqCsv(csv: string) {
  const [, ...rows] = csv.trim().split(/\r?\n/);

  return rows
    .map((row) => row.split(","))
    .filter((columns) => columns.length >= 8 && columns[1] !== "N/D")
    .map(([rawSymbol, date, time, open, , , close, volume]) => {
      const symbol = rawSymbol.replace(/\.US$/i, "").toUpperCase();
      const openValue = Number(open);
      const closeValue = Number(close);
      const change = Number.isFinite(openValue) && Number.isFinite(closeValue) ? closeValue - openValue : null;
      const changePercent =
        change !== null && openValue !== 0 ? (change / openValue) * 100 : null;
      const quoteTime = date && time ? new Date(`${date}T${time}Z`).getTime() : null;

      return {
        change,
        changePercent,
        currency: "USD",
        exchange: "Stooq delayed quote",
        marketCap: null,
        name: knownNames[symbol] ?? symbol,
        price: Number.isFinite(closeValue) ? closeValue : null,
        quoteTime,
        symbol,
        volume: Number.isFinite(Number(volume)) ? Number(volume) : null
      };
    });
}
