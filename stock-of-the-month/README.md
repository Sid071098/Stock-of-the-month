# Stock of the Month

A dark financial-dashboard style Next.js + Tailwind CSS subscription site featuring Netflix (NFLX) as the current stock of the month.

## Folder Structure

```text
stock-of-the-month/
├── app/
│   ├── api/
│   │   └── checkout/
│   │       └── route.ts
│   │   └── stock-of-month/
│   │       └── route.ts
│   ├── lib/
│   │   └── stockOfMonth.ts
│   ├── cancel/
│   │   └── page.tsx
│   ├── success/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .env.example
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Environment Variables

Copy `.env.example` to `.env.local` and provide your Stripe keys:

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PRICE_ID=price_your_price_id_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_1TUwppGgdCjtxcdnqrbSE1lS
NEXT_PUBLIC_APP_URL=https://easecaseinc.com
STOCK_STORY_PICK_URL=
STOCK_STORY_API_KEY=
STOCK_STORY_AUTH_HEADER=Authorization
```

The Checkout route supports either:

- a pre-created Stripe Price ID via `STRIPE_PRICE_ID`, or
- inline `$1.99/month` `price_data` when `STRIPE_PRICE_ID` is not provided.

If `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID` is set, the homepage will embed Stripe's Pricing Table directly in the pricing section.

## Dynamic Stock of the Month

The homepage reads the featured pick from `app/lib/stockOfMonth.ts`. If `STOCK_STORY_PICK_URL` is set, the server fetches that JSON endpoint with `cache: "no-store"` and optional authentication. If the endpoint is missing or unavailable, the site falls back to the `STOCK_MONTH_*` environment values.

The expected JSON can use these canonical keys:

```json
{
  "ticker": "NFLX",
  "name": "Netflix",
  "price": 92.12,
  "change": "+18.16% 1Y",
  "rating": "Featured Pick",
  "date": "May 2026",
  "headline": "Netflix is this month's featured stock suggestion.",
  "summary": "Short thesis text.",
  "source": "StockStory",
  "asOf": "2026-05-07T00:00:00.000Z",
  "scores": [
    ["Quality", "91"],
    ["Growth", "84"],
    ["Momentum", "78"]
  ]
}
```

The normalized data is also exposed at `/api/stock-of-month`.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Key Files

- `app/page.tsx`: StockStory-inspired homepage with dynamic stock of the month, suggestions feed, and subscription CTA.
- `app/api/checkout/route.ts`: Stripe Checkout Session creation for a recurring monthly subscription.
- `app/api/stock-of-month/route.ts`: Normalized JSON endpoint for the current stock of the month.
- `app/lib/stockOfMonth.ts`: Server-side provider for StockStory/API data with environment fallbacks.
- `app/success/page.tsx`: Payment successful page.
- `app/cancel/page.tsx`: Payment cancelled page.

The NFLX displayed quote is a reference quote and should be replaced with a live market-data provider before production use.
