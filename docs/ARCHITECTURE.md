# Architecture

## Current Frameworks

- Frontend framework: Next.js 16 App Router with React 19, TypeScript, and Tailwind CSS v4.
- Backend framework: Next.js Route Handlers running on the Node.js runtime. There is no separate backend service in this repository yet.
- ERP system: ERPNext/Frappe Cloud is an external integration for inventory, finance, customer records, purchase orders, sales orders, and accounting. It is not the storefront backend.

## Dependency Inventory

Runtime dependencies:

- `next`: web framework, routing, rendering, server route handlers, image optimization.
- `react`: UI component runtime.
- `react-dom`: React DOM renderer used by Next.js.
- `framer-motion`: cart drawer and checkout success animations.
- `lucide-react`: UI icons.
- `zustand`: client-side cart state and localStorage persistence.
- `server-only`: guards server modules from accidental client imports.

Development dependencies:

- `typescript`: static typing.
- `eslint`: lint runner.
- `eslint-config-next`: Next.js ESLint rules.
- `tailwindcss`: utility CSS framework.
- `@tailwindcss/postcss`: Tailwind v4 PostCSS integration.
- `@types/node`: Node.js TypeScript types.
- `@types/react`: React TypeScript types.
- `@types/react-dom`: React DOM TypeScript types.

Missing production infrastructure:

- Durable database for products, inventory, customers, and orders.
- Durable background job queue for ERP sync retries across process restarts.
- Observability sink for structured logs and alerts.
- Payment provider integration.
- Authentication/admin tooling for catalog and order operations.

No new npm package is required for the current refactor. Validation is implemented with local TypeScript functions to keep the build self-contained.

## Module Layout

- `app`: Next.js routes, pages, metadata, API entry points, and webhooks.
- `components`: presentational UI components.
- `store`: browser-only cart state.
- `lib/domain`: storefront domain types such as products, orders, inventory, and customers.
- `lib/services`: application use cases such as listing products and creating orders.
- `lib/repositories`: internal persistence boundaries. Current adapters are file/in-memory placeholders.
- `lib/integrations/erp`: ERP integration boundary. ERPNext-specific HTTP and mapping code stays here.
- `lib/api`: reusable browser API helpers.
- `lib/validation`: request/webhook validation.
- `lib/utils`: shared logging and retry utilities.
- `data`: internal catalog seed/snapshot data.
- `docs`: architecture documentation.

## Improvements Made

### Storefront Independence

Before, the homepage imported `lib/erpnext.ts` and treated ERPNext as the product source. The catalog now goes through `lib/services/catalog-service.ts`, which reads the storefront catalog repository. This keeps the site available even when ERPNext is unavailable.

Why recommended: the e-commerce site should own its customer-facing availability. ERP outages should delay reconciliation, not break browsing.

### Dedicated ERP Integration Layer

ERPNext HTTP calls, ERP payload mapping, webhook security, and sync job handling now live under `lib/integrations/erp`.

Why recommended: this isolates vendor-specific API details and makes it possible to replace ERPNext or add another ERP without changing UI components.

### UI No Longer Calls ERP

Client components import domain types or frontend API services only. They do not import ERP modules or know ERPNext URLs/tokens.

Why recommended: this prevents secret leakage, keeps UI code portable, and enforces a clear security boundary.

### Reusable API Services

Checkout now uses `lib/api/orders.ts`, backed by a generic `postJson` helper in `lib/api/http.ts`.

Why recommended: browser-side API behavior such as JSON parsing and error handling is centralized instead of repeated in components.

### Async ERP Synchronization

`POST /api/orders` validates and accepts the storefront order first, then queues ERP synchronization in `lib/integrations/erp/sync-queue.ts`.

Why recommended: customers should not see checkout failure just because ERPNext is temporarily slow or offline.

### Retry Logic And Structured Logging

ERP HTTP operations use `withRetry`, and important events are logged as structured JSON through `logger`.

Why recommended: sync problems become diagnosable, and transient ERP/network errors can recover without customer-facing impact.

### Webhook Support

`POST /api/webhooks/erpnext` accepts signed webhook events for `product`, `inventory`, `customer`, and `order` entities. Events are validated and queued for internal synchronization.

Why recommended: ERP-originated changes can flow back into the storefront through a single controlled endpoint.

### Validation And Types

Order and webhook payloads are validated before use. Shared domain interfaces live outside integration code.

Why recommended: route handlers fail clearly on invalid input, and TypeScript types are reusable across services, repositories, and UI.

### Environment Variables

Public URL/image settings use `NEXT_PUBLIC_*`. ERP URL, token, and webhook secret use server-only variables.

Why recommended: secrets never need to be exposed to browser bundles.

### Docker Deployment

The project now has a `Dockerfile`, `.dockerignore`, and Next standalone output.

Why recommended: deployment artifacts are smaller and production startup is a simple `node server.js`.

## Operational Notes

The current repository adapters are intentionally lightweight:

- Products come from `data/products.json`.
- Orders are stored in memory during the process lifetime.
- ERP sync jobs are processed in memory.

For production, replace those adapters with a database and durable queue while keeping the same service/integration boundaries. The UI and route handlers should not need to change.
