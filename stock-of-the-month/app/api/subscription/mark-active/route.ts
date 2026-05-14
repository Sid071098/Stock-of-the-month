import { NextResponse } from "next/server";
import {
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePersistentSubscription
} from "../../../lib/persistentStore";

export async function POST(request: Request) {
  if (!isPersistentStoreConfigured()) {
    return NextResponse.json({ error: "persistent_store_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    customerId?: string;
    email?: string;
    status?: string;
    subscriptionId?: string;
  };
  const email = normalizePersistentEmail(body.email ?? "");

  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }

  const subscription = await savePersistentSubscription({
    customerId: body.customerId,
    email,
    status: body.status ?? "active",
    subscriptionId: body.subscriptionId
  }).catch(() => null);

  if (!subscription) {
    return NextResponse.json({ error: "persistent_store_failed" }, { status: 500 });
  }

  return NextResponse.json({ active: subscription.active, status: subscription.status });
}
