export type StockScore = [label: string, value: string];

export type StockOfMonth = {
  ticker: string;
  name: string;
  price: string;
  change: string;
  rating: string;
  date: string;
  headline: string;
  summary: string;
  source: string;
  asOf: string;
  scores: StockScore[];
};

const fallbackPick: StockOfMonth = {
  ticker: process.env.STOCK_MONTH_TICKER ?? "NFLX",
  name: process.env.STOCK_MONTH_NAME ?? "Netflix",
  price: process.env.STOCK_MONTH_PRICE ?? "$92.12",
  change: process.env.STOCK_MONTH_CHANGE ?? "+18.16% 1Y",
  rating: "Featured Pick",
  date: process.env.STOCK_MONTH_DATE ?? "May 2026",
  headline:
    process.env.STOCK_MONTH_HEADLINE ??
    "Netflix is our Stock of the Month as advertising, live events, and disciplined content spending reshape the earnings story.",
  summary:
    process.env.STOCK_MONTH_SUMMARY ??
    "Our monthly research brief frames NFLX as a premium media platform with expanding monetization surfaces, stronger free cash flow, and a cleaner shareholder return profile.",
  source: "Local fallback",
  asOf: new Date().toISOString(),
  scores: [
    ["Quality", process.env.STOCK_MONTH_QUALITY_SCORE ?? "91"],
    ["Growth", process.env.STOCK_MONTH_GROWTH_SCORE ?? "84"],
    ["Momentum", process.env.STOCK_MONTH_MOMENTUM_SCORE ?? "78"]
  ]
};

type SourcePayload = Partial<
  StockOfMonth & {
    company: string;
    companyName: string;
    currentPrice: string | number;
    performance: string;
    month: string;
    thesis: string;
    qualityScore: string | number;
    growthScore: string | number;
    momentumScore: string | number;
  }
>;

export async function getStockOfMonth(): Promise<StockOfMonth> {
  const sourceUrl = normalizeUrl(process.env.STOCK_STORY_PICK_URL);

  if (!sourceUrl) {
    return fallbackPick;
  }

  try {
    const response = await fetch(sourceUrl, {
      cache: "no-store",
      headers: buildSourceHeaders()
    });

    if (!response.ok) {
      return {
        ...fallbackPick,
        source: `Fallback: source returned ${response.status}`
      };
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return {
        ...fallbackPick,
        source: "Fallback: source did not return JSON"
      };
    }

    const payload = (await response.json()) as SourcePayload;
    return normalizeSourcePayload(payload);
  } catch {
    return {
      ...fallbackPick,
      source: "Fallback: source unavailable"
    };
  }
}

function buildSourceHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  const apiKey = process.env.STOCK_STORY_API_KEY;
  const authHeader = sanitizeHeaderName(process.env.STOCK_STORY_AUTH_HEADER) ?? "Authorization";

  if (apiKey) {
    headers[authHeader] = authHeader.toLowerCase() === "authorization" ? `Bearer ${apiKey}` : apiKey;
  }

  return headers;
}

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function sanitizeHeaderName(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();
  return /^[A-Za-z0-9-]+$/.test(trimmed) ? trimmed : undefined;
}

function normalizeSourcePayload(payload: SourcePayload): StockOfMonth {
  const ticker = stringify(payload.ticker, fallbackPick.ticker).toUpperCase();
  const name = stringify(payload.name ?? payload.company ?? payload.companyName, fallbackPick.name);

  return {
    ticker,
    name,
    price: formatPrice(payload.price ?? payload.currentPrice, fallbackPick.price),
    change: stringify(payload.change ?? payload.performance, fallbackPick.change),
    rating: stringify(payload.rating, fallbackPick.rating),
    date: stringify(payload.date ?? payload.month, fallbackPick.date),
    headline: stringify(payload.headline, `${name} is this month's featured stock suggestion.`),
    summary: stringify(payload.summary ?? payload.thesis, fallbackPick.summary),
    source: stringify(payload.source, "StockStory source"),
    asOf: stringify(payload.asOf, new Date().toISOString()),
    scores: normalizeScores(payload)
  };
}

function normalizeScores(payload: SourcePayload): StockScore[] {
  if (Array.isArray(payload.scores) && payload.scores.length > 0) {
    return payload.scores
      .filter((score): score is StockScore => Array.isArray(score) && score.length === 2)
      .map(([label, value]) => [String(label), String(value)]);
  }

  return [
    ["Quality", stringify(payload.qualityScore, fallbackPick.scores[0][1])],
    ["Growth", stringify(payload.growthScore, fallbackPick.scores[1][1])],
    ["Momentum", stringify(payload.momentumScore, fallbackPick.scores[2][1])]
  ];
}

function formatPrice(value: unknown, fallback: string): string {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(value);
  }

  return stringify(value, fallback);
}

function stringify(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}
