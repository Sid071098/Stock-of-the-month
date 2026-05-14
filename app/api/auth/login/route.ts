import { NextResponse } from "next/server";
import {
  getPersistentUser,
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  type PersistentUser
} from "../../../lib/persistentStore";

export async function POST(request: Request) {
  if (!isPersistentStoreConfigured()) {
    return NextResponse.json({ error: "persistent_store_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string; passwordHash?: string };
  const email = normalizePersistentEmail(body.email ?? "");

  if (!email || !body.passwordHash) {
    return NextResponse.json({ error: "missing_login_fields" }, { status: 400 });
  }

  try {
    const user = await getPersistentUser(email);
    if (!user) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    if (user.passwordHash !== body.passwordHash) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    return NextResponse.json({ user: publicUser(user) });
  } catch {
    return NextResponse.json({ error: "persistent_store_failed" }, { status: 500 });
  }
}

function publicUser(user: PersistentUser) {
  return {
    createdAt: user.createdAt,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    passwordHash: ""
  };
}
