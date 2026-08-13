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

## Architecture

- `app`: pages, layouts, API routes, and webhooks.
- `components`: reusable UI components.
- `store`: client cart state.
- `lib/domain`: storefront product, order, customer, and inventory types.
- `lib/services`: application use cases.
- `lib/repositories`: internal persistence boundaries.
- `lib/integrations/erp`: ERPNext adapter, sync queue, retry, and webhook handling.
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
| `ERP_BASE_URL` | Server-only | ERPNext/Frappe Cloud base URL for async sync. |
| `ERP_AUTH_TOKEN` | Server-only | ERP API token. Format: `token API_KEY:API_SECRET`. |
| `ERP_WEBHOOK_SECRET` | Server-only | HMAC secret used to verify ERP webhook payloads. |

Legacy `NEXT_PUBLIC_ERPNEXT_URL` and `ERPNEXT_AUTH_TOKEN` are still read as fallbacks so existing local environments do not break immediately, but new deployments should use the variables above.

## Docker

```bash
docker build -t mathuram-foods .
docker run --env-file .env.local -p 3000:3000 mathuram-foods
```

The app uses Next.js standalone output for smaller production images.
