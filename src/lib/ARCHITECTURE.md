# Backend Architecture Guidelines

This document outlines the strict boundaries and architectural patterns used in the backend of this Next.js ecommerce platform. We follow a pragmatic **Hexagonal / Clean Architecture** approach to ensure the system is maintainable, scalable, and independent of specific frameworks.

## Directory Structure

- `src/lib/domain/`
  - **Core Entities & Events:** Contains raw interfaces and data models (e.g., `StorefrontOrder`, `ProductVariant`).
  - **Rules:** Must NOT depend on Next.js, Prisma, or external integrations. Only raw TypeScript types and pure business rules.

- `src/lib/core/`
  - **Application Services & Use Cases:** Contains the orchestration logic (e.g., `OrderService.ts`, `PricingService.ts`).
  - **Rules:** Connects domain rules with infrastructure. May use Repositories and EventBuses. Must NOT depend on HTTP request/response objects directly.

- `src/lib/repositories/`
  - **Data Access Layer:** Abstracts database access (e.g., `catalog-repository.ts`).
  - **Rules:** The only layer permitted to directly import and use `@prisma/client`.

- `src/lib/infrastructure/`
  - **External Adapters:** Integrations with 3rd-party services (Redis, BullMQ, Pino, Stripe, Razorpay).
  - **Rules:** Implements interfaces defined in the core. Must be easily swappable without affecting application services.

- `src/app/api/`
  - **Delivery Mechanism (Controllers):** Next.js App Router endpoints.
  - **Rules:** Must only parse requests, validate input schemas (Zod), invoke application services, and format responses. Business logic belongs in `src/lib/core`.

## Important Patterns

1. **Transactional Outbox:** Always use `EventBus.publishWithinTransaction` when publishing domain events that accompany database state changes.
2. **Error Handling:** Use `ApiError` and `withErrorHandler` for API routes instead of manual `try/catch` with raw NextResponses.
3. **Logging:** Use the `Logger` facade (backed by Pino) for all logging instead of `console.log`.
