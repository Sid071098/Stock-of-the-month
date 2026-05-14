import { NextResponse } from "next/server";
import {
  getPersistentUser,
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePersistentUser,
  type PersistentUser
} from "../../../lib/persistentStore";

export async function POST(request: Request) {
  if (!isPersistentStoreConfigured()) {
    return NextResponse.json({ error: "persistent_store_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<PersistentUser>;
  const email = normalizePersistentEmail(body.email ?? "");

  if (!body.firstName || !body.lastName || !email || !body.passwordHash) {
    return NextResponse.json({ error: "missing_registration_fields" }, { status: 400 });
  }

  try {
    const existingUser = await getPersistentUser(email);
    if (existingUser) {
      return NextResponse.json({ error: "user_already_registered" }, { status: 409 });
    }

    const user = await savePersistentUser({
      createdAt: body.createdAt ?? new Date().toISOString(),
      email,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      passwordHash: body.passwordHash
    });

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
