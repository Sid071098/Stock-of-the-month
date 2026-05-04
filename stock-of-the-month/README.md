# Stock of the Month

A dark financial-dashboard style Next.js + Tailwind CSS subscription site featuring Netflix (NFLX) as the current stock of the month.

## Folder Structure

```text
stock-of-the-month/
├── app/
│   ├── api/
│   │   └── checkout/
│   │       └── route.ts
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
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_1TTSXAGgdCjtxcdnpaUHd3vI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The Checkout route supports either:

- a pre-created Stripe Price ID via `STRIPE_PRICE_ID`, or
- inline `price_data` when `STRIPE_PRICE_ID` is not provided.

If `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID` is set, the homepage will embed Stripe's Pricing Table directly in the pricing section.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Key Files

- `app/page.tsx`: Main NFLX landing page, stock chart placeholder, thesis, metrics, and subscription CTA.
- `app/api/checkout/route.ts`: Stripe Checkout Session creation for a recurring monthly subscription.
- `app/success/page.tsx`: Payment successful page.
- `app/cancel/page.tsx`: Payment cancelled page.

The NFLX displayed quote is a reference quote and should be replaced with a live market-data provider before production use.
