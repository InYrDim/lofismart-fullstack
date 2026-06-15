### run and create database container

> using docker

```bash
docker compose --env-file ./lofishmart-backend/.env.example up
```

---

## Testing

### Backend Integration Tests (Jest)

Requires the database to be running.

```bash
cd lofishmart-backend

# Run all backend tests
npx jest

# Run a specific test file
npx jest tests/transactionController.test.js

# Run with verbose output
npx jest --verbose tests/inventoryController.test.js
```

Test files use the `TEST*` ID prefix pattern so data is cleaned up automatically in `beforeEach`/`afterAll`.

**Coverage:**
| File | Endpoints | Tests |
|---|---|---|
| `tests/inventoryController.test.js` | `POST /inventory/receive`, `POST /inventory/receive-bulk` | 13 |
| `tests/transactionController.test.js` | `POST /transaction/selling/create`, `PATCH /transaction/selling/update/:id` | 6 |

---

### Frontend Unit Tests (Vitest)

No database needed — API calls are mocked.

```bash
cd lofishmart-frontend

# Run all tests once
npx vitest run

# Run in watch mode (re-runs on changes)
npx vitest

# Run a specific test file
npx vitest run src/test/services/transaction.service.test.ts

# Run with coverage report
npx vitest run --coverage
```

**Coverage:**
| File | What it tests | Tests |
|---|---|---|
| `src/test/services/auth.service.test.ts` | `isAuthenticated`, `getCurrentUser`, `hasPermission` | 7 |
| `src/test/services/transaction.service.test.ts` | `createTransaction`, `getTransactions`, `getSellingProductDetails` | 8 |
| `src/test/services/voucher.service.test.ts` | Voucher code lookup (ITEM10, POTONG5K, BANDENG20, GLOBAL50) | 6 |
| `src/test/services/voucher-strategy.test.ts` | PERCENTAGE, FIXED_CUT, NAME_CONTAINS_PERCENTAGE, GLOBAL_FIXED | 10 |
| `src/test/utils/format.test.ts` | `formatCurrency`, `formatCompactCurrency`, `formatNumber` | 10 |
| `src/test/utils/grading.test.ts` | `getGradingLabel`, `generateSkuCode`, grade/size arrays | 8 |
| `src/test/utils/storage.test.ts` | Token, user, marketId, persist flag, clear behavior | 14 |

---

### E2E Tests (Playwright)

Runs against the real app (backend + frontend). The Playwright config will auto-start both servers via `webServer`. Requires the database to be running.

```bash
cd e2e

# Run all E2E tests
npx playwright test

# Run a specific role group
npx playwright test --project=admin
npx playwright test --project=kasir
npx playwright test --project=gudang

# Run a specific test file
npx playwright test tests/pos.kasir.spec.ts

# Run with visible browser
npx playwright test --headed

# Run with debugger
npx playwright test --debug

# View the HTML report
npx playwright show-report
```

**Projects & Test Files:**

| Project | File | What it covers |
|---|---|---|
| `setup` | `tests/auth.setup.ts` | Login as admin, kasir, gudang (saves auth state) |
| `admin` | `tests/dashboard.admin.spec.ts` | Dashboard metrics & quick actions |
| `admin` | `tests/data-transaksi.admin.spec.ts` | Transaction data page & history |
| `admin` | `tests/management.admin.spec.ts` | Product, User, Roles, Attributes, Suppliers, Outlet, Report pages |
| `admin` | `tests/products.admin.spec.ts` | Full CRUD lifecycle: create, edit, archive, restore, delete |
| `kasir` | `tests/pos.kasir.spec.ts` | POS catalog, filters, add-to-cart, checkout, cash payment |
| `gudang` | `tests/stock.gudang.spec.ts` | Warehouse stock page with summary & table |

---

### Quick Reference

```bash
# Run ALL tests (backend + frontend + e2e) — via shell script
bash run-tests.sh

# Or manually:
cd lofishmart-backend && npx jest && cd ../lofishmart-frontend && npx vitest run && cd ../e2e && npx playwright test

# Run backend + frontend unit tests only (fast, no browser needed)
cd lofishmart-backend && npx jest && cd ../lofishmart-frontend && npx vitest run
```
