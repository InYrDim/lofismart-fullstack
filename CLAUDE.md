# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LofishMart is a multi-branch fish/seafood retail POS and inventory management system. It consists of:

- **Backend** (`lofishmart-backend/`): Express.js REST API with TypeORM + MySQL 8, JWT auth, RBAC, WebSocket
- **Frontend** (`lofishmart-frontend/`): React 19 SPA with TypeScript, Vite (Rolldown), Tailwind CSS 4, TanStack Router
- **E2E** (`e2e/`): Playwright test suite with role-based auth states (admin/kasir/gudang)

## Commands

### Development

```bash
# Start full dev environment (Docker DB + Backend + Frontend)
bash start-dev.sh

# Or start services individually:
cd lofishmart-backend && npm start          # Backend on :3000
cd lofishmart-frontend && npm run dev        # Frontend on :5173
docker compose -f docker-compose.dev.yml up  # MySQL + phpMyAdmin
```

### Database

```bash
cd lofishmart-backend
npm run migration              # Run pending migrations
npm run migration:generate     # Generate migration from entities
npm run migration:revert       # Revert last migration
npm run migration:create -- ./db/migrations/DescriptiveName  # Create new migration (never create files manually)
npm run seeder:create <Name>   # Create new seeder (never create files manually)
npm run seeder:run             # Run seeders

# Before any schema work, regenerate schema docs:
node scripts/dump_schema_to_md.js  # Then read DATABASE_SCHEMA.md
```

### Testing

```bash
# Run all tests (backend + frontend + e2e)
bash run-tests.sh

# Backend integration tests (requires running MySQL)
cd lofishmart-backend && npm test                          # All tests
cd lofishmart-backend && npx jest tests/inventoryController.test.js   # Single file
cd lofishmart-backend && npm run test:coverage             # With coverage

# Frontend unit tests (API calls mocked, no DB needed)
cd lofishmart-frontend && npm run test:run     # All tests once
cd lofishmart-frontend && npm run test         # Watch mode
cd lofishmart-frontend && npx vitest run src/test/services/auth.service.test.ts  # Single file

# E2E tests (requires Backend + Frontend + DB running)
cd e2e && npx playwright test                              # All projects
cd e2e && npx playwright test --project=admin              # Single role
cd e2e && npx playwright test tests/pos.kasir.spec.ts      # Single file
cd e2e && npx playwright test --headed                     # Visible browser
cd e2e && npx playwright show-report                       # View HTML report
```

### Lint & Build

```bash
cd lofishmart-frontend && npm run lint     # ESLint
cd lofishmart-frontend && npm run build    # TypeScript check + Vite build
```

## Architecture

### Backend (`lofishmart-backend/`)

**Stack:** Express 4 + TypeORM 0.3 + MySQL 8 + JWT + Winston

**Route pattern:** All API routes are under `/api` with a naming convention of `{resource}-{action}` (e.g. `/api/product-list`, `/api/selling-create`, `/api/user-create`). Routes are defined in `routes/index.js` for most resources, with specialized routes in `routes/product.js`, `routes/transaction.js`, `routes/user.js`, etc.

**Important:** Backend uses CommonJS (`require`/`module.exports`) — no ESM. Routes in `routes/index.js` are test/legacy only; production routes go in separate files (e.g., `routes/product.js`). Any route receiving `multipart/form-data` **must** include Multer middleware.

**Controllers** (`controllers/`): Business logic for each domain:
- `authController` — login/logout/me, session management
- `featureController` — profiles, configs, sync (DataChange/DataReceive), notifications
- `inventoryController` — stock receiving (single/bulk), inventory queries
- `productController` — products, prices, grades, sizes, categories, stock, stock opname, rejects, services
- `transactionController` — selling, purchases, vouchers, cart, payment methods, cash drawer
- `userController` — users, roles, permissions, members, suppliers, sessions
- `warehouseController`, `outletController`, `webhookController`

**Middleware:**
- `middleware/auth.js` — JWT verification + RBAC permission checking. Accepts a permission array; Super Admin role (`ADMN`) bypasses all checks. Refreshes user data from DB on each request.
- `middleware/uploadFile.js` — Multer-based file upload (images, attachment proofs)
- `middleware/errorHandler.js` — Global error handler with JSON/HTML responses
- `middleware/generateId.js` — Custom ID generation utilities
- `middleware/dataChange.js` — Tracks data changes for multi-branch sync

**Entities** (`db/entities/`): 34 TypeORM entity files defining 37 database tables.

**Auth flow:** Login returns a JWT which is stored in a Session record. On each request, the auth middleware looks up the session by token, verifies the JWT, fetches fresh user + permissions from DB, then checks required permissions.

**WebSocket** (`websocket/`): Real-time transaction updates.

### Frontend (`lofishmart-frontend/`)

**Stack:** React 19 + TypeScript 5.9 + Vite (Rolldown) + Tailwind CSS 4 + TanStack Router + Radix UI/shadcn

**Routing:** File-based routing via TanStack Router. Route files in `src/routes/` use an underscore prefix convention:
- `__root.tsx` — root layout
- `_guest.tsx` / `_guest.index.lazy.tsx` — public/unauthenticated routes (login)
- `_protected.tsx` — authenticated layout wrapper
- `_protected._inventory_group/` — inventory routes (stock management, opname, markets)
- `_protected._management/` — admin routes (products, users, roles, suppliers, attributes, outlets)
- `_protected.kelolagudang/` — warehouse management (purchases, receives, transfers, stock, rejects)
- `_protected.kelolaoutlet/` — outlet management
- `_protected.pos.tsx` — POS terminal
- `_protected.dashboard.lazy.tsx` — dashboard

**API calls:** Services in `src/services/` use a custom `ApiClient` class (`src/utils/api.ts`) that wraps `fetch()`, automatically attaches JWT tokens from storage, and redirects to login on 401.

**State/Context:**
- `AuthContext` — user authentication state
- `PaymentContext` — POS payment flow state
- `SerialContext` / `SerialProvider` — weight scale hardware integration via Web Serial API

**Key design system** (documented in `DESIGN.md`):
- Typeface: Work Sans
- Icons: lucide-react
- Components: shadcn/ui on radix-ui primitives
- Colors: OKLCH-based, full dark mode support
- Border radius: 0.625rem base

### Database

37 tables across 9 domains:
| Domain | Key Tables |
|--------|-----------|
| Auth | User, Role, Permission, HasPermit, Session |
| Organization | Profile (branches), Warehouse |
| Product Catalog | Product, Category, Grade, Size, Price, Service |
| Inventory | Stock, StockOpname, StockOpnameDetail, StockTransfer |
| Purchasing | Purchase, Supplier |
| Sales/POS | Selling, SellingProductDetail, SellingServiceDetail, Voucher, Member, CartItem |
| Quality | Reject |
| Sync | DataChange, DataReceive, SyncExport, SyncImport |
| Config | Config, Notification, WeightScale |

**Key patterns:**
- Soft deletes via `deleted_at` on most entities
- Multi-branch isolation via `market_id` FK on transactional tables
- Batch/expiration tracking for perishable inventory (FIFO/FEFO)
- Known typos preserved: `werehouse` (not warehouse), `PeymentMethod` (not PaymentMethod), `totol_pcs_qty` (not total)
- Enum values use string-based status patterns

### Testing Strategy

| Layer | Tool | Requirements |
|-------|------|-------------|
| Backend integration | Jest + supertest | Running MySQL database |
| Frontend unit | Vitest + jsdom + React Testing Library | None (API mocked) |
| E2E | Playwright with role-based projects | Running DB + servers |

E2E projects: `setup` (auth state), `admin`, `kasir`, `gudang`. Admin tests cover dashboard, transactions, products (CRUD), management pages. Kasir tests cover POS flow. Gudang tests cover warehouse stock.

### E2E Structure (`e2e/`)

- `tests/auth.setup.ts` — logs in as admin/kasir/gudang, saves auth state to `playwright/.auth/`
- `playwright/auth/` — pre-saved authentication states per role (admin.json, kasir.json, gudang.json)
- `playwright.config.ts` — defines projects with authenticated storage states
- Uses `webServer` config to auto-start backend + frontend servers

### Design System (`src/components/ui/`)

Custom shadcn/ui components in `src/components/ui/` using `class-variance-authority` for variants and `tailwind-merge` for class merging. Uses the `cn()` utility from `src/lib/utils.ts`.

### TypeScript Rules

- No `any` type — use proper interfaces/types or `unknown` with narrowing
- Always type `useState` generics explicitly when inference is insufficient
- Components in `src/components/` subfolders named after route path
- PascalCase for components, camelCase for hooks/utilities
- Never modify `src/routeTree.gen.ts` manually — it is auto-generated by TanStack Router
- Always use `api` from `src/utils/api.ts` for HTTP calls — never raw `fetch()` or `axios`

## Hard Constraints

**Database:**
- Never use `synchronize: true` in TypeORM config for anything other than local scratch testing
- Never edit a migration file that has already been executed in any environment
- Never drop a column or table without a corresponding rollback `down()` migration
- Always run `node scripts/dump_schema_to_md.js` before schema work, then read `DATABASE_SCHEMA.md`

**Backend:**
- Never place production business logic inside `routes/index.js`
- Never bypass JWT middleware on authenticated endpoints
- Never skip Multer middleware on `multipart/form-data` routes — `req.body` will be empty
- Never commit secrets (passwords, API keys, JWT secret) to source code

**Frontend:**
- Never use `any` in TypeScript — it breaks strict mode and hides runtime bugs
- Never use raw `fetch()` or `axios` directly — always use `api` from `src/utils/api.ts`
- Never skip prop interface definitions for components

## Environment

- **Node.js**: v22+
- **MySQL**: 8.0 (Docker)
- **Key env files**: `.env.dev` / `.env.prod` at root, with copies in each subproject
- **Additional docs**: `APP_DOCUMENTATION/` folder, `lofishmart-backend/docs/`, `lofishmart-backend/DATABASE_SCHEMA.md`
