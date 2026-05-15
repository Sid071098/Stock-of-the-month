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
    const active = subscription ? Boolean(subscription.active) : cookieActive;

    return NextResponse.json({
      active,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      retentionOfferUsed: subscription?.retentionOfferUsed ?? false,
      retainedUntil: subscription?.retainedUntil ?? null,
      source: subscription ? "persistent_store" : "cookie",
      status: subscription?.status ?? status
    });
  }

  return NextResponse.json({
    active: cookieActive,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    retentionOfferUsed: false,
    retainedUntil: null,
    source: "cookie",
    status
  });
}
