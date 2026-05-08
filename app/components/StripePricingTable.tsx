"use client";

import { useEffect, useMemo } from "react";

export default function StripePricingTable({
  pricingTableId,
  publishableKey
}: {
  pricingTableId: string;
  publishableKey: string;
}) {
  useEffect(() => {
    if (!pricingTableId || !publishableKey) {
      return;
    }

    const existing = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);
  }, [pricingTableId, publishableKey]);

  const markup = useMemo(() => {
    if (!pricingTableId || !publishableKey) {
      return "";
    }

    return `<stripe-pricing-table pricing-table-id="${pricingTableId}" publishable-key="${publishableKey}"></stripe-pricing-table>`;
  }, [pricingTableId, publishableKey]);

  if (!markup) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
