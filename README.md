# Shopify Marketing Helper

A public Shopify app scaffold built with Remix, TypeScript, Polaris, and the 2025 Shopify Admin API. The app detects product combination patterns and segmentation opportunities across orders/customers and exposes a Polaris dashboard plus API endpoints.

## Features
- Remix + TypeScript with @shopify/shopify-app-remix
- OAuth + App Bridge session token validation
- GraphQL Admin API (2025-01) pagination helpers
- Background cron worker for periodic scans
- Webhooks for Orders/Create and Customers/Create
- Storage abstraction (JSON today, schema provided for SQLite/Postgres)
- REST endpoints: `/api/scan`, `/api/patterns`, `/api/opportunities`
- Polaris dashboard at `/dashboard`

## Project structure
- `server/` — Shopify app bootstrap, OAuth, Express entrypoint
- `app/` — Remix routes (dashboard + API), Polaris UI wrappers
- `modules/analysis/` — pattern detection logic
- `modules/storage/` — storage helpers and types
- `modules/webhooks/` — webhook handlers
- `worker/` — cron-based background scanning
- `db/schema.sql` — suggested relational tables when moving past the JSON helper
- `ml/` — placeholder for future ML work

## Environment variables
Create a `.env` file (or environment variables in your host) with:

```
SHOPIFY_API_KEY=your-app-key
SHOPIFY_API_SECRET=your-app-secret
SHOPIFY_APP_URL=https://your-tunnel-or-host
SHOPIFY_SCOPES=read_orders,read_customers
SHOPIFY_API_VERSION=2025-01
USE_PG_STORAGE=false # set true with DATABASE_URL to prefer Postgres
DATABASE_URL=postgres://user:pass@host:5432/dbname
PORT=3000
SCAN_SHOPS=example-shop.myshopify.com # comma-separated shops to include in the cron worker
```

## Commands
- `npm install`
- `npm run dev` — start Remix dev server
- `npm run build && npm start` — production build & serve
- `npm run worker` — run background cron worker

## Notes
- Webhook endpoints are mounted under `/webhooks/orders/create` and `/webhooks/customers/create`.
- Analysis results are persisted to `db/analysis.json` by default; migrate to SQL by replacing helpers in `modules/storage/models.ts`.
- GraphQL queries are set up with cursor pagination for Shopify Admin API limits.
- Future expansion folders (`ml/`) and comments are included for clustering or email modules.
