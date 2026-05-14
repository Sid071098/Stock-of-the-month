"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Gauge } from "lucide-react";

type RegisteredUser = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export default function SuccessPage({
  searchParams
}: {
  searchParams?: { session_id?: string };
}) {
  const [status, setStatus] = useState("Verifying subscription...");

  useEffect(() => {
    function unlockPremiumAccess() {
      // Get the current user from localStorage
      const currentUserJson = window.localStorage.getItem("stockymonth.currentUser");
      const currentUser = currentUserJson ? JSON.parse(currentUserJson) as RegisteredUser : null;
      
      if (currentUser) {
        // Store subscription per user using their email
        const userSubscriptionKey = `stockymonth.subscription.${currentUser.email}`;
        window.localStorage.setItem(userSubscriptionKey, "true");
        void fetch("/api/subscription/mark-active", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: currentUser.email,
            status: "active"
          })
        }).catch(() => undefined);
      }
    }

    if (!searchParams?.session_id) {
      unlockPremiumAccess();
      setStatus("Payment completed. Premium sections are unlocked on this device.");
      return;
    }

    void fetch("/api/subscription/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sessionId: searchParams.session_id })
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.status === "active" || payload.status === "trialing") {
          unlockPremiumAccess();
        }

        setStatus(
          payload.status
            ? `Subscription ${payload.status}. Stock of the Month, Top High Quality Stocks, and All Picks are unlocked.`
            : "Subscription verified. Premium sections are unlocked."
        );
      })
      .catch(() => {
        unlockPremiumAccess();
        setStatus("Payment completed. If dashboard access is delayed, refresh in a moment.");
      });
  }, [searchParams?.session_id]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 text-[#0f1729]">
      <section className="w-full max-w-2xl rounded-md border border-[#e2e8f0] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Payment Successful</p>
        <h1 className="mt-3 text-4xl font-black">Welcome to StockyMonth</h1>
        <p className="mt-4 leading-7 text-[#4d3f68]">{status}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <FileText className="mb-3 h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
            <p className="text-sm font-black">Premium research unlocked</p>
            <p className="mt-1 text-sm text-[#475569]">Stock of the Month and detailed analysis</p>
          </div>
          <div className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <Gauge className="mb-3 h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
            <p className="text-sm font-black">All sections available</p>
            <p className="mt-1 text-sm text-[#475569]">Top High Quality Stocks and All Picks archive</p>
          </div>
        </div>
        <Link
          href="/stock-of-the-month"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#ff6b4a] px-5 text-sm font-black text-white transition hover:bg-[#f45d3c]"
        >
          Open StockyMonth
        </Link>
      </section>
    </main>
  );
}
