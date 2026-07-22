# Mathuram Foods — Storefront

A headless e-commerce storefront for Mathuram Foods (papadam, vadam, appalam
and South Indian snacks), built on Next.js 16 (App Router) and backed by an
ERPNext (Frappe) server.

## Stack

- Next.js 16 · App Router · TypeScript
- Tailwind CSS v4 (utility classes only, no component CSS files)
- Zustand for cart state (persisted to localStorage)
- Framer Motion for the cart drawer and hero entrance
- lucide-react for icons

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your ERPNext URL + token
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable                     | Where it's used                  | Secret? |
| ----------------------------- | --------------------------------- | ------- |
| `NEXT_PUBLIC_ERPNEXT_URL`     | Server (API calls) + client (image URLs) | No |
| `ERPNEXT_AUTH_TOKEN`          | Server only, via `lib/erpnext.ts` | **Yes** |

`ERPNEXT_AUTH_TOKEN` is deliberately **not** prefixed with `NEXT_PUBLIC_`.
`lib/erpnext.ts` is marked with the `server-only` package so it can never be
imported into a Client Component — the build fails loudly if that's ever
attempted by mistake, instead of silently leaking your API secret.

## How data flows

- **Products (GET):** fetched server-side in `app/page.tsx`, a Server
  Component, via `getProducts()`. Revalidated at most once an hour (ISR).
  If ERPNext is unreachable, the page renders an empty-state message
  instead of crashing.
- **Orders (POST):** the checkout page is a Client Component, so it can't
  hold the ERPNext secret. It posts to `app/api/orders/route.ts`, a Route
  Handler that runs server-side and is the only place `createSalesOrder()`
  is actually called.

## Known extension points

- **Individual product pages.** There's no `/products/[slug]` route yet —
  everything lives on one page. For long-tail SEO (e.g. "buy jeera vadam
  online"), consider adding dynamic product pages with their own
  `generateMetadata` and Product JSON-LD; extend `app/sitemap.ts` to list
  them once you do.
- **Customer address on the Sales Order.** The ERPNext payload sent here
  matches your specified `{ customer, items }` shape plus best-effort
  `customer_name` / `contact_email`. Standard Sales Order doesn't have a
  free-text delivery address field — in production you'd typically create
  or look up a `Customer` + `Address` record first and link it. See the
  comment in `lib/erpnext.ts`.
- **`SITE_URL`** in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts`
  is a placeholder (`https://www.mathuramfoods.com`) — update it to your
  real domain before deploying.
