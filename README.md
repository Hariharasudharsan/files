# Mathuram Foods Storefront

Independent e-commerce storefront for Mathuram Foods, built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and Next.js Route Handlers.

ERPNext/Frappe Cloud is an external ERP integration only. It is used for inventory, finance, customer records, purchase orders, sales orders, and accounting sync. It is not the website backend, and the storefront is designed to keep browsing and checkout available when ERPNext is temporarily unavailable.

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

On Windows PowerShell, use `npm.cmd run dev` if script execution policy blocks `npm`.

**Note:** The first admin user must be promoted manually via `npx prisma studio` (by assigning the ADMIN role to their user record) after they log in for the first time via Google.

## Architecture

- `app`: pages, layouts, API routes, and webhooks.
- `components`: reusable UI components.
- `store`: client cart state.
- `lib/core/domain`: core domain entities, schemas, and events.
- `lib/core/application`: application services and use cases (e.g. OrderService, CatalogService).
- `lib/infrastructure`: adapters, caching, database config, ERP integration, events, queues, and background workers.
- `lib/api`: browser API service helpers.
- `lib/validation`: request validation.
- `data`: Postgres database via Prisma (requires live DB and NextAuth secret to run).

See [src/lib/ARCHITECTURE.md](src/lib/ARCHITECTURE.md) for the full analysis, dependency inventory, missing production infrastructure, and the reason behind each architectural improvement.

## Data Flow

- Products are read through the storefront catalog service, not directly from ERPNext.
- Checkout posts to the storefront API route at `/api/v1/orders/init-payment`.
- The order API validates the request, accepts a storefront order, and queues ERP sync asynchronously.
- ERP webhook events post to `/api/webhooks/erpnext` and are queued for internal synchronization.

## Environment Variables

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical storefront URL for metadata, sitemap, and robots. |
| `NEXT_PUBLIC_IMAGE_HOST` | Public | Optional host for externally stored product images. |
| `DATABASE_URL` | Server-only | Postgres database connection URL. |
| `REDIS_URL` | Server-only | Local Redis URL for queue and caching. |
| `UPSTASH_REDIS_REST_URL` | Server-only | Upstash Redis REST URL (if using Upstash). |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only | Upstash Redis REST token (if using Upstash). |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Server-only | Secret for NextAuth.js session encryption. |
| `ERPNEXT_URL` | Server-only | ERPNext instance base URL for async sync. |
| `ERPNEXT_API_KEY` | Server-only | ERP API key. |
| `ERPNEXT_API_SECRET` | Server-only | ERP API secret. |
| `ERPNEXT_WEBHOOK_SECRET` | Server-only | HMAC secret used to verify ERP webhook payloads. |
| `RAZORPAY_KEY_ID` | Server-only | Razorpay Key ID for initializing payments. |
| `RAZORPAY_KEY_SECRET` | Server-only | Razorpay Key Secret. |
| `RAZORPAY_WEBHOOK_SECRET` | Server-only | Webhook secret for verifying Razorpay payment events. |

Legacy variables are still read as fallbacks so existing local environments do not break immediately, but new deployments should use the variables above.

## Docker

```bash
docker build -t mathuram-foods .
docker run --env-file .env.local -p 3000:3000 mathuram-foods
```

The app uses Next.js standalone output for smaller production images.
