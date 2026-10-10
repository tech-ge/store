# Door Delivery

Global multi-vendor marketplace with USD pricing, local currency display,
crypto and local payment rails, KYC-verified accounts, and GPS-tracked delivery.

## Stack

- Next.js 14 (App Router) on Vercel
- MongoDB Atlas
- Upstash Redis
- Stripe, Flutterwave, Paystack, M-Pesa, Coinbase, Binance Pay, USDT
- Cloudflare R2 for object storage
- Ably for real-time GPS

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. `pnpm install`
3. `pnpm seed:categories && pnpm seed:countries`
4. `pnpm indexes`
5. `pnpm dev`

## Structure

- `apps/web` — Next.js storefront, seller dashboard, admin panel, API routes
- `packages/*` — shared libraries (db, redis, security, money, payments, ...)
- `database/*` — seeds and index definitions
# store
