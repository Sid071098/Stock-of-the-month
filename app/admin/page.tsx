import StockExperience from "../components/StockExperience";
import { allPicks, defaultMonthlyPick, defaultQualityPicks } from "../lib/picks";

const defaultPricingTableId = "prctbl_1TUwppGgdCjtxcdnqrbSE1lS";
const defaultPublishableKey =
  "pk_live_51OXc79GgdCjtxcdnXkj1Q1Ntr72QpH8DRR3FVWjsGBAz0wwzvU5xlJG0BQsqxK0ZWVnLJC19XwUHjF1FFJlRy6V500oqCRBuDX";

export default function AdminPage() {
  return (
    <StockExperience
      archivePicks={allPicks}
      defaultMonthlyPick={defaultMonthlyPick}
      defaultQualityPicks={defaultQualityPicks}
      pricingTableId={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || defaultPricingTableId}
      publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || defaultPublishableKey}
      showAdmin
      showPricing={false}
    />
  );
}
