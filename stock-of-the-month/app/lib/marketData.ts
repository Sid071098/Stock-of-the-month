import { defaultMonthlyPick, defaultQualityPicks } from "./picks";

export type SparklinePoint = {
  date: string;
  close: number;
};

export type StockSnapshot = {
  change: string;
  changePercent: string;
  high52: string;
  low52: string;
  marketCap: string;
  name: string;
  peRatio: string;
  price: string;
  sector: string;
  sparkline: SparklinePoint[];
  ticker: string;
};

export type AIAnalysis = {
  health: string;
  opportunity: string;
  risk: string;
  thesis: string;
};

const alphaBaseUrl = "https://www.alphavantage.co/query";

export async function getStockSnapshot(ticker: string): Promise<StockSnapshot> {
  const symbol = sanitizeTicker(ticker);
  const fallback = buildFallbackSnapshot(symbol);
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  if (!apiKey) {
    return fallback;
  }

  try {
    const [quote, overview, daily] = await Promise.all([
      fetchAlpha<Record<string, string>>({ function: "GLOBAL_QUOTE", symbol, apikey: apiKey }),
      fetchAlpha<Record<string, string>>({ function: "OVERVIEW", symbol, apikey: apiKey }),
      fetchAlpha<Record<string, Record<string, Record<string, string>>>>({
        function: "TIME_SERIES_DAILY",
        outputsize: "compact",
        symbol,
        apikey: apiKey
      })
    ]);

    const globalQuote = quote["Global Quote"] as unknown as Record<string, string> | undefined;
    const sparkline = parseSparkline(daily["Time Series (Daily)"]);

    return {
      ticker: symbol,
      name: overview.Name || fallback.name,
      sector: overview.Sector || fallback.sector,
      price: formatCurrency(globalQuote?.["05. price"] ?? fallback.price),
      change: formatSigned(globalQuote?.["09. change"] ?? fallback.change),
      changePercent: globalQuote?.["10. change percent"]?.replace("%", "") ?? fallback.changePercent,
      peRatio: overview.PERatio && overview.PERatio !== "None" ? overview.PERatio : fallback.peRatio,
      high52: formatCurrency(overview["52WeekHigh"] ?? fallback.high52),
      low52: formatCurrency(overview["52WeekLow"] ?? fallback.low52),
      marketCap: formatMarketCap(overview.MarketCapitalization) ?? fallback.marketCap,
      sparkline: sparkline.length > 0 ? sparkline : fallback.sparkline
    };
  } catch {
    return fallback;
  }
}

export async function getAIAnalysis(snapshot: StockSnapshot): Promise<AIAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  const fallback = buildFallbackAnalysis(snapshot);

  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a financial research assistant. Do not provide personalized financial advice. Return only compact JSON with keys thesis, opportunity, health, risk."
          },
          {
            role: "user",
            content: `Create a concise analysis for ${snapshot.name} (${snapshot.ticker}). Price ${snapshot.price}, change ${snapshot.changePercent}%, sector ${snapshot.sector}, P/E ${snapshot.peRatio}, market cap ${snapshot.marketCap}, 52-week range ${snapshot.low52}-${snapshot.high52}. Thesis must be exactly 3 sentences. Opportunity, health, and risk should each be one sentence.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      })
    });

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return fallback;
    }

    const parsed = JSON.parse(content) as Partial<AIAnalysis>;
    return {
      thesis: parsed.thesis || fallback.thesis,
      opportunity: parsed.opportunity || fallback.opportunity,
      health: parsed.health || fallback.health,
      risk: parsed.risk || fallback.risk
    };
  } catch {
    return fallback;
  }
}

function sanitizeTicker(ticker: string) {
  const symbol = ticker.trim().toUpperCase();
  return /^[A-Z0-9.-]{1,12}$/.test(symbol) ? symbol : defaultMonthlyPick.ticker;
}

async function fetchAlpha<T>(params: Record<string, string>) {
  const url = new URL(alphaBaseUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("alpha_vantage_failed");
  }

  return (await response.json()) as T;
}

function buildFallbackSnapshot(ticker: string): StockSnapshot {
  const allPicks = [defaultMonthlyPick, ...defaultQualityPicks];
  const pick = allPicks.find((item) => item.ticker === ticker) ?? defaultMonthlyPick;
  const priceNumber = Number(pick.price.replace(/[$,]/g, "")) || 100;

  return {
    ticker,
    name: pick.name,
    sector: pick.sector,
    price: pick.price,
    change: pick.change,
    changePercent: pick.change.replace("%", ""),
    peRatio: "N/A",
    high52: formatCurrency(priceNumber * 1.22),
    low52: formatCurrency(priceNumber * 0.78),
    marketCap: "N/A",
    sparkline: Array.from({ length: 30 }, (_, index) => ({
      date: `Day ${index + 1}`,
      close: Number((priceNumber * (0.94 + index * 0.004 + Math.sin(index / 3) * 0.025)).toFixed(2))
    }))
  };
}

function buildFallbackAnalysis(snapshot: StockSnapshot): AIAnalysis {
  return {
    thesis: `${snapshot.name} is being reviewed as a high-quality monthly stock idea in the ${snapshot.sector} sector. The current setup combines business quality, price action, and valuation context into a focused research candidate. Investors should still validate the fundamentals and position sizing before making any decision.`,
    opportunity: `${snapshot.name} may benefit if execution stays strong and investor sentiment toward ${snapshot.sector} improves.`,
    health: `The available technical profile shows ${snapshot.price} current pricing with a 52-week range of ${snapshot.low52} to ${snapshot.high52}.`,
    risk: `The key risk is that valuation, competition, or macro conditions could weaken the thesis before the expected catalyst plays out.`
  };
}

function parseSparkline(series: Record<string, Record<string, string>> | undefined): SparklinePoint[] {
  if (!series) {
    return [];
  }

  return Object.entries(series)
    .slice(0, 30)
    .reverse()
    .map(([date, values]) => ({
      date,
      close: Number(Number(values["4. close"]).toFixed(2))
    }))
    .filter((point) => Number.isFinite(point.close));
}

function formatCurrency(value: string | number | undefined) {
  const numericValue = typeof value === "number" ? value : Number(String(value ?? "").replace(/[$,]/g, ""));

  if (!Number.isFinite(numericValue)) {
    return String(value ?? "N/A");
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency"
  }).format(numericValue);
}

function formatSigned(value: string | undefined) {
  const numericValue = Number(String(value ?? "").replace(/[$,%+]/g, ""));
  if (!Number.isFinite(numericValue)) {
    return value ?? "N/A";
  }

  return `${numericValue >= 0 ? "+" : ""}${numericValue.toFixed(2)}`;
}

function formatMarketCap(value: string | undefined) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    notation: "compact"
  }).format(numericValue);
}
