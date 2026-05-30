# Charts

Next.js 16 TypeScript app deployed on Vercel. Shows a live BTC/USD price chart and crypto news articles with sentiment scores fetched from a Neon Postgres database.

## Commands

```bash
npm run dev      # development server at localhost:3000
npm run build    # production build
npm run start    # serve production build
```

## Stack

- **Next.js 16** — App Router, server components for DB queries
- **TypeScript 5** — strict mode
- **lightweight-charts 5** — TradingView chart library (v5 API: `addSeries(AreaSeries, opts)`, `createSeriesMarkers`)
- **@neondatabase/serverless** — Neon Postgres client
- **Vercel** — hosting, environment variables via `vercel env pull .env.local`

## Project structure

```
src/
  app/
    page.tsx          # home — fetches articles server-side, renders TabLayout
    layout.tsx        # root layout with dark background
  components/
    BTCChart.tsx      # client component, fetches CoinGecko hourly data, auto-refreshes every 61 min
    TabLayout.tsx     # client component, tab switcher (Chart | News)
  types/
    article.ts        # shared Article type
```

## Database

Neon Postgres (`neon-cinnabar-plank`). Connection via `DATABASE_URL` in `.env.local`.

```
Table: articles
  id               integer
  title            text
  content          text
  url              text
  published_date   timestamp
  source           text
  sentiment_score  real        (0–1, >=0.2 positive, >=0.1 neutral, <0.1 negative)
  crypto_mentioned text        (JSON array e.g. ["bitcoin"])
  created_at       timestamp
```

## Key implementation notes

- **Chart data**: CoinGecko free API, 30-day range without `&interval=daily` returns hourly granularity automatically.
- **Chart markers**: use `createSeriesMarkers(series, [...])` — `series.setMarkers()` was removed in lightweight-charts v5.
- **DB queries**: run server-side in Server Components; cast result with `as unknown as Article[]` due to Neon driver returning `Record<string, any>[]`.
- **Environment**: `.env.local` is git-ignored. Run `vercel env pull .env.local --yes` after connecting a new resource in the Vercel dashboard.
