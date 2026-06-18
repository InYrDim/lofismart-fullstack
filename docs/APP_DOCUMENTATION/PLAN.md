# LofishMart — Development Plan

> Created: March 11, 2026
> Status: Active

---

## How to use this file

After each feature is done, update the status and note what actually happened vs what was planned. This is a living document — if the plan changes, update it here with a reason.

---

## Phase 1 — Close the Open Loop

**Goal**: Connect the full cycle: Gudang → Outlet → POS → Transaction
**Branch**: `feat/inventory-ui`
**Estimated effort**: 1-2 days

The backend for inventory flow already exists (`inventoryController` with `receiveFromSupplier` + `transferToMarket` + `getInventoryDashboard`). The Markets page is currently an empty placeholder. This phase turns it into a real inventory management UI.

### Tasks

- [ ] Inventory dashboard — stock levels per outlet, summary view
- [ ] Receive stock from supplier form (calls `POST /product/inventory/receive`)
- [ ] Transfer stock from Gudang to Outlet form (calls `POST /product/inventory/transfer`)
- [ ] Stock per outlet view — list current stock with qty, product, grade, size
- [ ] Wire into the `/markets` route (currently shows `Hello "/_protected/markets"!`)

### Done when

- Gudang manager can log incoming fish from supplier
- Gudang manager can transfer stock to an outlet
- Each outlet can see its own current stock
- Stock numbers in the DB actually reflect the physical flow

---

## Phase 2 — Client Revision Items

**Goal**: Implement features from the owner meeting
**One branch per feature**
**Estimated effort**: ~1 week total

### 2.1 — Reject Stock Approval Flow (DONE)
**Branch**: `feat/reject-stock-approval`
**Status**: [x] Completed

Incoming stock from supplier can be accepted or rejected. Only Supervisor can approve/reject. If rejected, a reason must be given.

- [x] Add `approval_status`, `approved_by`, `image_proof` to Reject entity (migration)
- [x] Backend: Add `POST /reject-request` for SPVR
- [x] Backend: Add `POST /reject-approve/:id` for Admin with transactional DB update
- [x] Frontend: Add "Barang Rusak" tab in Inventory UI
- [x] Frontend: SPVR sees request form, Admin sees approval buttons
- [x] Test end-to-end: SPVR submits dummy image + data, Admin approves and stock reduces.

### 2.1.5 — Two-Phase Transfer / Blind Receiving (NEW - Anti Fraud)
**Branch**: `feat/two-phase-transfer`
**Status**: [ ] Not started

Currently transfer is instant (Gudang -> Outlet directly updates stock). This is a fraud risk. Need to change to a 2-step process with "Blind Receiving".

- [ ] Backend: Create `TransferOrder` and `TransferDetail` entities (status: PENDING, SHIPPED, RECEIVED, DISCREPANCY)
- [ ] Backend: `POST /transfer/send` (Gudang) -> Deduct gudang stock, create SHIPPED order.
- [ ] Backend: `POST /transfer/receive` (Outlet SPVR) -> Input actual physical qty received (Blind Receiving).
- [ ] Backend: If qty matches -> APPROVED -> Add outlet stock. If mismatch -> DISCREPANCY -> Admin must resolve.
- [ ] Frontend: Update Transfer UI to support dispatch (Gudang) and receive (Outlet).

### 2.2 — Report Per Item
**Branch**: `feat/report-per-item`
**Status**: [ ] Not started

Currently reports are per transaction total only. Need breakdown per product.

- [ ] Backend: add query to `sellingProductDetailList` grouped by product
- [ ] Frontend: new report view — product name, total qty sold, total weight, total revenue
- [ ] Filter by date range, outlet
- [ ] Printable

### 2.3 — Two Receipts (Service vs Product)
**Branch**: `feat/dual-receipt`
**Status**: [ ] Not started

Currently one combined receipt. Owner wants two: one for services, one for products.

- [ ] Split `PrintService` to handle two receipt templates
- [ ] Receipt 1: product items only (fish, physical goods)
- [ ] Receipt 2: service items only
- [ ] Both triggered after successful payment
- [ ] If transaction has only one type, print only that receipt

### 2.4 — Services Pay Upfront
**Branch**: `feat/service-pay-upfront`
**Status**: [ ] Not started

Services (non-physical items) must be paid before being processed.

- [ ] Add `pay_upfront` flag to Service entity (or handle via type)
- [ ] In POS, when a service item is in cart, block checkout unless payment for service is confirmed first
- [ ] Backend: validate service payment status on transaction create

### 2.5 — New Role: Penimbang
**Branch**: `feat/role-penimbang`
**Status**: [ ] Not started

Penimbang = weigher. New role that can only record incoming stock weight and submit for supervisor approval.

- [ ] Add Penimbang role to roles table (migration)
- [ ] Add permissions: can submit incoming stock, cannot approve, cannot sell
- [ ] Gate inventory receive form behind Penimbang + Supervisor permissions
- [ ] Add to `config/roles.ts` in frontend

### 2.6 — Priority Customer Flag
**Branch**: `feat/priority-customer`
**Status**: [ ] Not started

Frequent buyers should be flagged and prioritized somehow.

- [ ] Add `is_priority` flag to Member entity
- [ ] Supervisor/Admin can toggle priority on a member
- [ ] In POS member lookup, show priority badge
- [ ] (Optional) Priority members shown first in member search results

---

## Phase 3 — Voucher Real Backend

**Branch**: `fix/voucher-real-backend`
**Status**: [ ] Not started
**Estimated effort**: Half a day

Currently `voucher.service.ts` uses a hardcoded mock array. Backend voucher routes and Voucher entity already exist.

- [ ] Check Voucher entity schema (fields: code, type, value, expiry, etc.)
- [ ] Update `voucher.service.ts` to call `GET /transaction/voucher/list` + lookup by code
- [ ] Add voucher management UI in Settings or a dedicated page (create, edit, delete)
- [ ] Validate expiry date on apply
- [ ] Test end-to-end: create voucher in backend, apply in POS

---

## Parked / Not Now

These are acknowledged but intentionally deferred.

| Item | Reason parked |
|---|---|
| Comments & code refactor | Doing this after phase 1+2 when feature shape is stable |
| Settings page | Unknown scope — needs investigation before planning |
| Stock Opname UI | Backend done, lower priority than inventory flow |
| Cash Drawer / Shift UI | Infrastructure exists, not blocking anything currently |
| WebSocket events | Infra ready, no pressing need yet |
| Notifications UI | Nice to have, not core |
| Data Sync UI | Not understood by team yet |

---

## Delivery Module — See LATER.md

Deferred entirely. See `LATER.md` for scope.

---

## Completion Log

> Fill this in as phases are completed.

| Date | Item | Notes |
|---|---|---|
| 2026-03-11 | Phase 1: Inventory UI | Markets page built with Dashboard, Receive Stock, Transfer, Stock List views. Backend already had the API endpoints. |

> Fill this in as phases are completed.

| Date | Item | Notes |
|---|---|---|
| — | — | — |
