import StockExperience from "./components/StockExperience";
import { defaultMonthlyPick, defaultQualityPicks } from "./lib/picks";

const defaultPricingTableId = "prctbl_1TUwppGgdCjtxcdnqrbSE1lS";
const defaultPublishableKey =
  "pk_live_51OXc79GgdCjtxcdnXkj1Q1Ntr72QpH8DRR3FVWjsGBAz0wwzvU5xlJG0BQsqxK0ZWVnLJC19XwUHjF1FFJlRy6V500oqCRBuDX";

const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || defaultPricingTableId;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || defaultPublishableKey;

export default function Home() {
  return (
    <StockExperience
      defaultMonthlyPick={defaultMonthlyPick}
      defaultQualityPicks={defaultQualityPicks}
      pricingTableId={pricingTableId}
      publishableKey={publishableKey}
    />
  );
}
