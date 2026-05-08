import { NextResponse } from "next/server";
import { getStockOfMonth } from "../../lib/stockOfMonth";

export async function GET() {
  const pick = await getStockOfMonth();

  return NextResponse.json(pick, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
