import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getPersistentSubscription,
  isPersistentStoreConfigured,
  normalizePersistentEmail
} from "../../../lib/persistentStore";

export async function GET(request: Request) {
  const status = cookies().get("stockymonth_subscription")?.value ?? null;
  const cookieActive = status === "active" || status === "trialing";
  const email = normalizePersistentEmail(new URL(request.url).searchParams.get("email") ?? "");

  if (email && isPersistentStoreConfigured()) {
    const subscription = await getPersistentSubscription(email).catch(() => null);
    const active = Boolean(subscription?.active) || cookieActive;

    return NextResponse.json({
      active,
      source: subscription ? "persistent_store" : "cookie",
      status: subscription?.status ?? status
    });
  }

  return NextResponse.json({ active: cookieActive, source: "cookie", status });
}
