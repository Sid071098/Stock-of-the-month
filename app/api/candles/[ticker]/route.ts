import { NextResponse } from "next/server";
import { getCandles, type CandleRange } from "../../../lib/marketData";

const validRanges: CandleRange[] = ["5D", "1M", "6M", "1Y"];

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("range") as CandleRange | null;
  const range: CandleRange = rangeParam && validRanges.includes(rangeParam) ? rangeParam : "1M";

  const candles = await getCandles(params.ticker, range);

  return NextResponse.json(
    {
      candles,
      range,
      ticker: params.ticker.toUpperCase(),
      asOf: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300"
      }
    }
  );
}
