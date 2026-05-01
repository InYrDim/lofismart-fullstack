# Micro-Task ST-03: Gudang → Outlet Stock Transfer (3-Status Flow)

## Task ID
`2026-04-30-ST-03-stock-transfer`

## Parent Task
`2026-04-30-stock-management-full-flow.md`

## Status
`[x] Completed`

## Depends On
`ST-01` — Gudang/Outlet schema must exist before this can reference them

---

## Goal

Replace the current **instant** stock transfer (`POST /product/inventory/transfer`) with a **3-status verified transfer flow**:

```
Gudang creates transfer  →  SENDING
    ↓ (gudang confirms dispatch)
                         →  WAITING_VERIFICATION
    ↓ (supervisor at outlet verifies receipt)
                         →  DONE  (outlet stock increases)

OR

At any SENDING state     →  CANCELLED  (gudang stock restored)
```

This prevents fraud and creates a full audit trail of all stock movements between locations.

> **Important context:** The full design for `stock_transfer` is already documented in
> `APP_DOCUMENTATION/feature/stock-management.md` — use it as the primary spec for this task.
> The current `transferToMarket` endpoint in `inventoryController.js` does this instantly
> and must be replaced/extended.

---

## Mandatory Reading (Before Starting)

```
1. .agents/context/conventions.md
2. .agents/context/constraints.md
3. lofishmart-backend/RULES.md
4. APP_DOCUMENTATION/feature/stock-management.md  ← PRIMARY SPEC for this task (sections 3–5)
5. lofishmart-backend/DATABASE_SCHEMA.md  ← after running dump
6. lofishmart-backend/controllers/inventoryController.js  ← check transferToMarket
7. APP_DOCUMENTATION/PERMISSIONS.md  ← stock-edit permission
```

---

## Scope

### In Scope

**Database:**
- Create `stock_transfer` table (per design in `stock-management.md` section 4)
- Columns: `id`, `qty`, `unit`, `status`, `notes`, `verified_qty`, `verified_notes`, `sent_at`, `verified_at`, `created_at`, `updated_at`
- FKs: `source_stock_id → stock.id`, `target_market_id → profile.id` (or warehouse table), `product_id`, `created_by_id`, `verified_by_id`

**Backend (5 new endpoints):**

| Endpoint | Who | Action |
|----------|-----|--------|
| `POST /inventory/transfer-order/create` | Admin/Gudang | Create transfer → `SENDING`, deduct gudang stock immediately |
| `GET /inventory/transfer-orders` | Admin/Gudang/SPVR | List — filtered by role |
| `PATCH /inventory/transfer-order/:id/status` | Gudang or SPVR | `SENDING→WAITING_VERIFICATION` (gudang) or `WAITING_VERIFICATION→DONE` (SPVR) |
| `POST /inventory/transfer-order/:id/cancel` | Admin/Gudang | Cancel `SENDING` → restore gudang stock |
| `GET /inventory/transfer-order/:id` | Any authorised | Detail for a single transfer |

**Frontend:**
- Transfer order creation form (select: source gudang, product, qty, unit, target outlet, notes)
- Transfer order list with status badges
  - 🚚 `SENDING` — orange
  - ⏳ `WAITING_VERIFICATION` — yellow
  - ✅ `DONE` — green
  - ❌ `CANCELLED` — grey
- Gudang view: "Confirm Sent" button (`SENDING → WAITING_VERIFICATION`)
- Outlet/SPVR view: "ACC & Receive" button with qty input (`WAITING_VERIFICATION → DONE`)
- Cancel button available at `SENDING` status

### Out of Scope
- Print reports / Surat Jalan (separate task)
- WebSocket real-time updates

---

## Acceptance Criteria

- [ ] `stock_transfer` table created via migration with all specified columns and FKs
- [ ] Creating a transfer deducts stock from gudang immediately (status: `SENDING`)
- [ ] Confirming dispatch moves status to `WAITING_VERIFICATION`
- [ ] SPVR verifying receipt adds stock to outlet and moves status to `DONE`
- [ ] Cancelling at `SENDING` restores gudang stock and sets status to `CANCELLED`
- [ ] Attempting to transfer more than available gudang stock returns an error
- [ ] Transfer list is scoped by role: Admin sees all; Gudang sees outgoing; SPVR sees incoming to their outlet
- [ ] Frontend shows correct status badges and action buttons per role and status
- [ ] All status transitions validated server-side (cannot skip states)

---

## Agent Assignments

| Step | Agent | Status |
|------|-------|--------|
| 1 - DB migration (`stock_transfer` table) | `db-engineer` | `[x]` |
| 2 - Backend 5 endpoints | `backend-engineer` | `[x]` |
| 3 - Frontend list + form + status actions | `frontend-engineer` | `[x]` |
| 4 - Tests | `tester` | `[ ]` |
| 5 - Review | `reviewer` | `[ ]` |

---

## Implementation Log

### Step 1 — DB Migration
**Agent**: db-engineer
**Status**: completed

```
Migration name: 1774100000000-AddStockTransfer.js
Tables created: stock_transfer
Entity file: db/entities/StockTransfer.js
Permissions: stock-transfer, stock-transfer-edit added.
```

---

### Step 2 — Backend
**Agent**: backend-engineer
**Status**: completed

```
Files changed:
  - controllers/inventoryController.js (implemented createTransferOrder, getTransferOrders, updateTransferStatus, cancelTransfer, getTransferReport)
  - routes/product.js (added 5 routes)

Stock logic:
  - createTransferOrder: deduct source_stock.qty by transfer.qty
  - updateStatus SENDING→WAITING_VERIFICATION: set sent_at
  - updateStatus WAITING_VERIFICATION→DONE: add verified_qty to target outlet stock
  - cancelTransfer: restore source_stock.qty
```

---

### Step 3 — Frontend
**Agent**: frontend-engineer
**Status**: completed

```
Files created/modified:
  - src/services/inventory.service.ts (TransferOrderService)
  - src/components/markets/TransferModal.tsx (Updated to 3-status flow)
  - src/components/markets/TransferOrderList.tsx (NEW)
  - src/components/inventory/InventoryMain.tsx (Integration)
  - src/components/markets/GudangView.tsx (Integration)
  - src/components/markets/OutletView.tsx (Integration)
```

---

### Step 4 — Testing
**Agent**: tester
**Status**: pending

```
Test scenarios (from stock-management.md section 8):
  - [ ] Transfer qty > gudang stock → error
  - [ ] Cancel at SENDING → gudang stock restored
  - [ ] SPVR verify with less qty → verified_qty < qty, both recorded
  - [ ] SPVR from different outlet cannot see this transfer
  - [ ] Status can only move forward (no skipping)

Results: <fill in>
```

---

### Step 5 — Review
**Agent**: reviewer
**Status**: pending

---

## Completion Summary
*(Fill in when done)*
