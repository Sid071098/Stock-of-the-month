import { NextResponse } from "next/server";

type AlphaSearchMatch = {
  "1. symbol"?: string;
  "2. name"?: string;
  "3. type"?: string;
  "4. region"?: string;
  "5. marketOpen"?: string;
  "6. marketClose"?: string;
  "7. timezone"?: string;
  "8. currency"?: string;
  "9. matchScore"?: string;
};

type AlphaSearchPayload = {
  bestMatches?: AlphaSearchMatch[];
  Information?: string;
  Note?: string;
  "Error Message"?: string;
};

type AlphaQuotePayload = {
  "Global Quote"?: {
    "01. symbol"?: string;
    "05. price"?: string;
    "06. volume"?: string;
    "07. latest trading day"?: string;
    "09. change"?: string;
    "10. change percent"?: string;
  };
  Information?: string;
  Note?: string;
  "Error Message"?: string;
};

type StockSearchMatch = {
  currency: string;
  exchange: string;
  matchScore: number;
  name: string;
  region: string;
  symbol: string;
  type: string;
};

type QuoteSnapshot = {
  change: number | null;
  changePercent: number | null;
  latestTradingDay: string | null;
  price: number | null;
  volume: number | null;
};

const alphaBaseUrl = "https://www.alphavantage.co/query";
const maxResults = 6;
const quoteLimit = 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = sanitizeQuery(searchParams.get("query") ?? searchParams.get("q"));
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "alpha_vantage_key_missing",
        message: "Alpha Vantage is not configured for this deployment.",
        results: []
      },
      { status: 503 }
    );
  }

  try {
    const searchPayload = await fetchAlpha<AlphaSearchPayload>({
      apikey: apiKey,
      function: "SYMBOL_SEARCH",
      keywords: query
    });

    if (searchPayload.Note || searchPayload.Information) {
      return NextResponse.json(
        {
          error: "alpha_vantage_limited",
          message: "Alpha Vantage is temporarily rate limited. Try another search in a moment.",
          results: []
        },
        { status: 429 }
      );
    }

    if (searchPayload["Error Message"]) {
      return NextResponse.json({ error: "invalid_stock_search", results: [] }, { status: 400 });
    }

    const matches = (searchPayload.bestMatches ?? [])
      .map(normalizeMatch)
      .filter((match): match is StockSearchMatch => Boolean(match))
      .sort((a, b) => {
        const regionScore = Number(b.region === "United States") - Number(a.region === "United States");
        return regionScore || b.matchScore - a.matchScore;
      })
      .slice(0, maxResults);

    const quoteResults = await Promise.allSettled(
      matches.slice(0, quoteLimit).map((match) => fetchQuote(match.symbol, apiKey))
    );

    const quotes = new Map<string, QuoteSnapshot>();
    quoteResults.forEach((result, index) => {
      const symbol = matches[index]?.symbol;
      if (symbol && result.status === "fulfilled" && result.value) {
        quotes.set(symbol, result.value);
      }
    });

    const results = matches.map((match) => ({
      ...match,
      ...(quotes.get(match.symbol) ?? {
        change: null,
        changePercent: null,
        latestTradingDay: null,
        price: null,
        volume: null
      })
    }));

    return NextResponse.json(
      {
        asOf: new Date().toISOString(),
        results,
        source: "Alpha Vantage"
      },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=90"
        }
      }
    );
  } catch {
    return NextResponse.json(
      {
        error: "alpha_vantage_search_failed",
        message: "Stock search is unavailable right now.",
        results: []
      },
      { status: 502 }
    );
  }
}

async function fetchQuote(symbol: string, apiKey: string): Promise<QuoteSnapshot | null> {
  const payload = await fetchAlpha<AlphaQuotePayload>({
    apikey: apiKey,
    function: "GLOBAL_QUOTE",
    symbol
  });

  if (payload.Note || payload.Information || payload["Error Message"]) {
    return null;
  }

  const quote = payload["Global Quote"];
  if (!quote) {
    return null;
  }

  return {
    change: parseNumeric(quote["09. change"]),
    changePercent: parseNumeric(quote["10. change percent"]?.replace("%", "")),
    latestTradingDay: quote["07. latest trading day"] ?? null,
    price: parseNumeric(quote["05. price"]),
    volume: parseNumeric(quote["06. volume"])
  };
}

async function fetchAlpha<T>(params: Record<string, string>) {
  const url = new URL(alphaBaseUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "StockyMonth/1.0"
    }
  });

  if (!response.ok) {
    throw new Error("alpha_vantage_failed");
  }

  return (await response.json()) as T;
}

function normalizeMatch(match: AlphaSearchMatch): StockSearchMatch | null {
  const symbol = match["1. symbol"]?.trim().toUpperCase() ?? "";
  const name = match["2. name"]?.trim() ?? "";

  if (!symbol || !name || !/^[A-Z0-9.^-]{1,15}$/.test(symbol)) {
    return null;
  }

  return {
    currency: match["8. currency"]?.trim() || "USD",
    exchange: match["4. region"]?.trim() || "Market",
    matchScore: Number(match["9. matchScore"]) || 0,
    name,
    region: match["4. region"]?.trim() || "Market",
    symbol,
    type: match["3. type"]?.trim() || "Equity"
  };
}

function parseNumeric(value: string | undefined) {
  if (!value) {
    return null;
  }

  const number = Number(value.replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function sanitizeQuery(value: string | null) {
  return (value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9 .,&-]/g, "")
    .slice(0, 60);
}
