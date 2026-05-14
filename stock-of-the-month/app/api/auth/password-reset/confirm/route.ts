import { NextResponse } from "next/server";
import {
  deletePasswordResetToken,
  getPasswordResetToken,
  isPersistentStoreConfigured,
  updatePersistentUserPassword
} from "../../../../lib/persistentStore";

export async function POST(request: Request) {
  if (!isPersistentStoreConfigured()) {
    return NextResponse.json({ error: "persistent_store_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    passwordHash?: string;
    token?: string;
  };
  const token = body.token?.trim() ?? "";

  if (!token || !body.passwordHash) {
    return NextResponse.json({ error: "missing_reset_fields" }, { status: 400 });
  }

  const resetToken = await getPasswordResetToken(token).catch(() => null);
  if (!resetToken) {
    return NextResponse.json({ error: "invalid_or_expired_token" }, { status: 400 });
  }

  const updatedUser = await updatePersistentUserPassword(resetToken.email, body.passwordHash).catch(() => null);
  if (!updatedUser) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  await deletePasswordResetToken(token).catch(() => undefined);

  return NextResponse.json({
    email: updatedUser.email,
    ok: true
  });
}
