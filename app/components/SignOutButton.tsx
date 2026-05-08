"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
    >
      Sign out
    </button>
  );
}
