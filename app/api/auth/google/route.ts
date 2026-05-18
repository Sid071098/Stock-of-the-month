import { NextResponse } from "next/server";
import {
  getPersistentUser,
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePersistentUser,
  type PersistentUser
} from "../../../lib/persistentStore";
import { runOnboarding } from "../../../lib/onboarding";

export async function POST(request: Request) {
  if (!isPersistentStoreConfigured()) {
    return NextResponse.json({ error: "persistent_store_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<PersistentUser>;
  const email = normalizePersistentEmail(body.email ?? "");

  if (!body.firstName || !body.lastName || !email) {
    return NextResponse.json({ error: "missing_google_profile" }, { status: 400 });
  }

  try {
    const existingUser = await getPersistentUser(email);
    if (existingUser) {
      return NextResponse.json({ user: publicUser(existingUser), existed: true });
    }

    const user = await savePersistentUser({
      createdAt: body.createdAt ?? new Date().toISOString(),
      email,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      passwordHash: body.passwordHash ?? `google:${email}`
    });

    // First-time Google signup → run the onboarding workflow. Returning Google
    // logins (existed=true above) skip this entirely.
    await runOnboarding({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      signupSource: "google"
    }).catch((err) => {
      console.error("[onboarding] google flow failed", err);
    });

    return NextResponse.json({ user: publicUser(user), existed: false });
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
