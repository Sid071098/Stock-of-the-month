import StockExperience from "../components/StockExperience";
import { allPicks, defaultMonthlyPick, defaultQualityPicks } from "../lib/picks";

const defaultPricingTableId = "prctbl_1TUwppGgdCjtxcdnqrbSE1lS";
const defaultPublishableKey =
  "pk_live_51OXc79GgdCjtxcdnXkj1Q1Ntr72QpH8DRR3FVWjsGBAz0wwzvU5xlJG0BQsqxK0ZWVnLJC19XwUHjF1FFJlRy6V500oqCRBuDX";

type SubscriptionFeature = "monthly" | "quality" | "all-picks";

function normalizeFeature(feature: string | string[] | undefined): SubscriptionFeature {
  const value = Array.isArray(feature) ? feature[0] : feature;

  if (value === "quality" || value === "all-picks") {
    return value;
  }

  return "monthly";
}

export default function SubscriptionPage({
  searchParams
}: {
  searchParams?: { feature?: string | string[] };
}) {
  return (
    <StockExperience
      archivePicks={allPicks}
      defaultMonthlyPick={defaultMonthlyPick}
      defaultQualityPicks={defaultQualityPicks}
      subscriptionContext={normalizeFeature(searchParams?.feature)}
      pricingTableId={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || defaultPricingTableId}
      publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || defaultPublishableKey}
      showAdmin={false}
      showPricing={false}
      view="subscription"
    />
  );
}
