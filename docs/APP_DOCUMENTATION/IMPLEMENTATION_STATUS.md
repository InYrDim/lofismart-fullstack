# LofishMart — Implementation Status

> Last updated: March 11, 2026

---

## 🖥️ Frontend Pages (TanStack Router)

| Route | Status | Description |
|---|---|---|
| `/` | ✅ Done | Login page (guest-only) |
| `/dashboard` | ✅ Done | Dashboard (protected) |
| `/pos` | ✅ Done | POS / Cashier screen |
| `/products` | ✅ Done | Product management |
| `/product-attributes` | ✅ Done | Category / Size / Grade master data |
| `/markets` | ✅ Done | Market/branch profile management |
| `/transactions` | ✅ Done | Transaction history & finance view |
| `/settings` | ✅ Done | App settings |
| `/design` | 🧪 Dev only | UI design playground (lazy, not in nav) |

**Auth flow**: `_protected.tsx` redirects to `/` if no token. `_guest.tsx` is the inverse. Fully implemented.

---

## 🔧 Backend API Routes

### Auth (`/`)

| Endpoint | Status |
|---|---|
| `POST /login` | ✅ |
| `POST /logout` | ✅ |

### User Management (`/user`)

| Group | Endpoints | Status |
|---|---|---|
| Users | list, byid, create, update, delete, soft-delete | ✅ |
| Members | list, byid, create, update, delete, soft-delete | ✅ |
| Suppliers | list, byid, create, update, delete, soft-delete | ✅ |
| Roles | list, byid, create, update, delete | ✅ |
| Permissions | list, byid, create, update, delete | ✅ |
| Has-Permit (Role-Permission mapping) | list, byid, edit | ✅ |
| Sessions | list (show only) | ⚠️ Read-only |

### Product Management (`/product`)

| Group | Endpoints | Status |
|---|---|---|
| Products | list, byid, create (w/image), update, delete, soft-delete | ✅ |
| Services | list, byid, create (w/image), update, delete, soft-delete | ✅ |
| Prices (variants) | list, byid, getprice, byproduct, create, update, delete | ✅ |
| Stock | list, byid, create, update, delete | ✅ |
| Reject | list, byid, create, update, delete | ✅ |
| Stock Opname | list, byid, create, update, delete | ✅ |
| SO Detail | list, byid, create (w/attachment), update, delete | ✅ |
| Grade | list, byid, create, update, delete | ✅ |
| Size | list, byid, create, update, delete | ✅ |
| Category | list, byid, create, update, delete | ✅ |
| **Inventory Flow** | `receive` (from supplier), `transfer` (to market), `dashboard` | ✅ |

### Transaction (`/transaction`)

| Group | Endpoints | Status |
|---|---|---|
| Purchase (incoming) | list, byid, create, update, delete | ✅ |
| Selling | list, byid, create (main tx), update, delete | ✅ |
| Selling Product Detail | list, create, update, delete | ✅ |
| Selling Service Detail | list, create, update, delete | ✅ |

### Feature (`/feature`)

| Group | Endpoints | Status |
|---|---|---|
| Profiles (Markets) | list, byid, create, update, delete, soft-delete | ✅ |
| CatApp | list, byid, create, update, delete | ✅ |
| Config | list, byid, create, update, delete | ✅ |
| Data Change | list only | ⚠️ Read-only |
| Data Receive | list only | ⚠️ Read-only |

### Webhooks (`/webhook`)

| Endpoint | Status |
|---|---|
| `POST /webhook/xendit` | ✅ Xendit payment callback |

---

## 🌐 Frontend Services (API Integration)

| Service | What it covers | Status |
|---|---|---|
| `auth.service` | Login, logout, `isAuthenticated()`, `hasPermission()` | ✅ Full |
| `product.service` | Products + Services CRUD, Price/variant management, Category/Size/Grade CRUD | ✅ Full |
| `transaction.service` | Selling list (with filters), product/service details, create/update transaction | ✅ Full |
| `profile.service` | Market profile CRUD | ✅ Full |
| `report.service` | Sales recap HTML generator → print | ✅ Full |
| `xendit.service` | QRIS QR code creation & polling | ✅ Full |
| `print.service` | Browser print trigger utility | ✅ Full |
| `voucher.service` | Voucher lookup | ⚠️ **Hardcoded mock data** — not connected to backend |

---

## ⚡ Real-time (WebSocket)

| Feature | Status |
|---|---|
| WS server at `/ws/transaction` | ✅ Initialized |
| JWT-based auth on connect | ✅ |
| `broadcast()` utility (filter by marketId/userId) | ✅ Built |
| Actual events being broadcast | ⚠️ **None yet** — infrastructure ready but no events wired to controllers |

---

## 📦 Database Entities (35 total)

| Entity | Purpose |
|---|---|
| `User` | Staff accounts |
| `Role` | Role definitions |
| `Permission` | Permission definitions |
| `HasPermit` | Role ↔ Permission mapping |
| `Profile` | Market/branch profiles |
| `Member` | Customer/member records |
| `Supplier` | Supplier records |
| `Product` | Physical fish products |
| `Service` | Service items (non-stock) |
| `Price` | Product price variants (by size/grade) |
| `Category` | Product categories |
| `Size` | Fish size classifications |
| `Grade` | Fish quality grades |
| `Stock` | Stock records per market |
| `Reject` | Rejected/waste stock records |
| `StockOpname` | Physical stock count sessions |
| `StockOpnameDetail` | Line items of a stock opname |
| `Selling` | Sales transaction header |
| `SellingProductDetail` | Product line items in a sale |
| `SellingServiceDetail` | Service line items in a sale |
| `Purchase` | Incoming purchase from supplier |
| `CartItem` | Cart items (entity exists, unused) |
| `CashDrawer` | Cash drawer sessions |
| `PeymentMethod` | Payment method definitions |
| `Voucher` | Discount voucher records |
| `WeightScale` | Weight scale device data |
| `Session` | Auth sessions |
| `Config` | App configuration key-values |
| `CatApp` | App categories |
| `DataChange` | Data change audit log |
| `DataReceive` | Data receive audit log |
| `SyncExport` | Data sync export records |
| `SyncImport` | Data sync import records |
| `Notification` | Notification records |
| `Failed_job` | Failed background job queue |

---

## 🚧 Gaps / Not Yet Implemented

| Area | Gap | Priority |
|---|---|---|
| **Vouchers** | Frontend uses hardcoded mock DB — not connected to backend voucher routes | 🔴 High |
| **WebSocket events** | No events are broadcast from controllers yet (infrastructure is ready) | 🔴 High |
| **Cash Drawer** | Entity + routes exist in old `index.js` but **not** in the new structured `transaction.js` router | 🟡 Medium |
| **Payment Methods** | Same as above — routes only in old `index.js` | 🟡 Medium |
| **Weight Scale** | Routes in old `index.js` only, no frontend integration | 🟡 Medium |
| **Stock Opname UI** | ✅ Integrated into `/stock-opname` | 🟢 Done |
| **Inventory Dashboard** | ✅ Integrated into `/markets` & `/inventory-dashboard` | 🟢 Done |

| **Session Management UI** | Sessions have a list endpoint only — no create/close UI for cashier shift sessions | 🟡 Medium |
| **Cart Persistence** | `CartItem` entity exists but unused — POS cart is frontend-only (in-memory) | 🟢 Low |
| **Notifications UI** | Entity + routes exist, no frontend UI at all | 🟢 Low |
| **Data Sync UI** | `SyncExport`/`SyncImport` entities + routes exist but no frontend | 🟢 Low |
| **Reports / Analytics** | Only print-based sales recap — no charts or analytics dashboard | 🟢 Low |

---

## 🗺️ Flow Summary

```
Supplier → Purchase (incoming) → Stock → Selling (POS) → Transaction Record
                                    ↓
                              Stock Opname (reconciliation)
                                    ↓
                              Reject (waste/loss)
```

### POS Transaction Flow (implemented)
1. Cashier opens POS (`/pos`)
2. Scans/searches products → adds to in-memory cart
3. Applies voucher (mock only) and discount
4. Selects payment method → QRIS generates via Xendit if needed
5. Confirms → `POST /transaction/selling/create` called
6. Receipt print triggered via `PrintService`

### Product Creation Flow (implemented)
1. Admin goes to `/products`
2. Creates product with image, category, size/grade variants
3. `POST /product/product/create` → then `POST /product/price/create` per variant
4. Stock managed separately via `/product/stock/*`
