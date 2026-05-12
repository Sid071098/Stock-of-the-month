import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export function GET() {
  const status = cookies().get("stockymonth_subscription")?.value ?? null;
  const active = status === "active" || status === "trialing";

  return NextResponse.json({ active, status });
}
