"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#0f766e] px-6 text-base font-extrabold text-white shadow-lg shadow-teal-900/10 transition hover:bg-[#115e59]"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-[#4285f4]">
        G
      </span>
      Continue with Google
    </button>
  );
}
