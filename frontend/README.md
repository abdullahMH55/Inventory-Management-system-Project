# Inventory — frontend

React + Vite client for the ASP.NET Core inventory API in [`../src/InventoryManagementSystem.Api`](../src/InventoryManagementSystem.Api).

## Running it

Two terminals. The API first, because the frontend has nothing to show without it.

```bash
# 1. API  ->  http://localhost:5166  (Swagger at /swagger)
dotnet run --project src/InventoryManagementSystem.Api

# 2. Frontend  ->  http://localhost:5173
cd frontend
npm install
npm run dev
```

`npm test` runs the unit tests, `npm run build` type-checks and builds.

The dev server proxies `/api` to `http://localhost:5166`, so the API is same-origin locally and cookies need no CORS round trip. The API's own allowlist (`Cors:AllowedOrigins` in `appsettings.json`) still has to be correct for any deployment that does not proxy. To exercise that path directly, set `VITE_API_BASE_URL=http://localhost:5166/api` and reload.

Note that `npm run preview` serves on `:4173` and does **not** proxy: it needs an absolute `VITE_API_BASE_URL`, and `:4173` must be in the API's allowlist (it is, by default).

## Structure

Feature-based. Each feature owns its `api/`, `schemas/`, `hooks/`, `components/`, `pages/`, and its store if it needs one.

```
src/
  app/        providers, query client, router   (wiring only)
  shared/     api client, error normalizer, ui primitives, formatting
  layouts/    AppShell (sidebar + topbar), AuthLayout
  features/
    auth/         login, register, session, guards
    dashboard/    the homepage; lib/ holds the pure derivation functions
    products/ categories/ sales/ purchases/     read layer only, so far
```

Query keys all come from `shared/api/query-keys.ts`. The dashboard reads the same list queries the feature hooks expose, so when product CRUD lands, a mutation that invalidates `qk.products.all()` refreshes the dashboard with no cross-feature import.

## Things about this API worth knowing before you touch the code

These are not incidental; several shaped the design.

- **Auth is an HttpOnly cookie, not a bearer token.** There is nothing to read from JS, so `GET /api/Auth/me` is the only way to know whether a session is live. That is why the session is a TanStack Query and not something persisted in zustand: a user cached in localStorage against a 24h sliding cookie eventually claims a session that no longer exists.
- **`POST /api/Auth/register` signs the user in.** So the first screen every new account sees is the empty dashboard, which is why its empty state is an onboarding checklist rather than a shrug.
- **A product's `categoryName` is always `""` on `GET /api/Products`** (the repository does not `Include` the category; the by-id endpoint does). The dashboard joins it client-side.
- **`CategoryResponse.productCount` is always `0`.** Do not render it.
- **`Sale.Status` is nullable free text.** There is no cancelled or refunded concept, so no total can honestly be called revenue. The tile says "sales value, all sales ever recorded" and means it.
- **There is no reorder point in the schema**, so "low stock" is a device-local threshold, which is why the label reads `≤ N units`.
- **Dates carry no offset** (`"2026-07-14T10:30:00"`), so JS parses them as local time. Fine on one machine, wrong when the API runs on a UTC host and the user is not in UTC. That assumption is isolated in `parseApiDate`.
- **No pagination, no aggregate endpoint.** The dashboard pulls four full tables and derives every figure client-side. That is fine at demo size and will not hold at thousands of sales; the real fix is a server-side `/api/Dashboard/stats`.

## Design

The visual system ("warehouse ledger") is documented in [`../DESIGN.md`](../DESIGN.md), and who it is for in [`../PRODUCT.md`](../PRODUCT.md). The short version: warm paper surfaces, hairline rules instead of nested boxes, monospaced figures, and a plum accent kept deliberately far from red, amber, and green so those stay reserved for stock status.
