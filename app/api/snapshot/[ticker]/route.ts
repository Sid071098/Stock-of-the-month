import { NextResponse } from "next/server";
import { getStockSnapshot } from "../../../lib/marketData";

export async function GET(
  _request: Request,
  { params }: { params: { ticker: string } }
) {
  const snapshot = await getStockSnapshot(params.ticker);

  return NextResponse.json(
    {
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
