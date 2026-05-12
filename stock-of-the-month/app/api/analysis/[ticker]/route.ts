import { NextResponse } from "next/server";
import { getAIAnalysis, getStockSnapshot } from "../../../lib/marketData";

export async function GET(
  _request: Request,
  { params }: { params: { ticker: string } }
) {
  const snapshot = await getStockSnapshot(params.ticker);
  const analysis = await getAIAnalysis(snapshot);

  return NextResponse.json(
    {
      analysis,
      snapshot,
      asOf: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "s-maxage=120, stale-while-revalidate=300"
      }
    }
  );
}
