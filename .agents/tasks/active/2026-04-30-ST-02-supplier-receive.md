# Micro-Task ST-02: Supplier → Gudang Stock Receiving

## Task ID
`2026-04-30-ST-02-supplier-receive`

## Parent Task
`2026-04-30-stock-management-full-flow.md`

## Status
`[x] Completed`

## Depends On
`ST-01` — Gudang schema must be confirmed and migrated first

---

## Goal

Allow authorised users (Admin, Gudang role) to **record incoming stock from a supplier into a specific Gudang**.

The user must:
1. Select the supplier
2. Select the product
3. Enter the quantity received
4. Upload proof (photo/document of delivery receipt)
5. Select which Gudang the stock is going into

On submission, the Gudang's stock for that product increases.

> **Important context:** `POST /product/inventory/receive` (`receiveFromSupplier`) already exists in
> `controllers/inventoryController.js`. Verify what it currently does — it may already cover most of
> this but might not support choosing a specific gudang (it may default to a single market).
> The goal is to extend it to accept a `gudang_id` parameter.

---

## Mandatory Reading (Before Starting)

```
1. .agents/context/conventions.md
2. .agents/context/constraints.md
3. lofishmart-backend/RULES.md
4. lofishmart-backend/DATABASE_SCHEMA.md  ← after running dump
5. lofishmart-backend/controllers/inventoryController.js  ← check receiveFromSupplier
6. lofishmart-backend/routes/product.js  ← check existing /inventory/receive route
7. APP_DOCUMENTATION/PERMISSIONS.md  ← stock-edit + purchase-edit required
8. APP_DOCUMENTATION/feature/stock-management.md  ← Section 2 "kondisi saat ini"
```

---

## Scope

### In Scope
- Verify existing `receiveFromSupplier` backend endpoint
- Extend it to accept `gudang_id` (which Gudang receives this stock)
- Stock record is created/incremented under the chosen Gudang
- Proof upload (image) stored via Multer — `upload.single('proof')`
- Frontend form: supplier selector, product selector, qty, unit, gudang selector, proof upload
- Permission gate: `stock-edit` + `purchase-edit`

### Out of Scope
- Supplier CRUD (already exists)
- Product CRUD (already exists)
- Transfer to outlets (that's ST-03)

---

## Acceptance Criteria

- [ ] Existing `receiveFromSupplier` is verified to understand current behavior
- [ ] Backend accepts `gudang_id` in the receive payload
- [ ] Stock is correctly created/incremented for the specified gudang
- [ ] Proof image is accepted and stored
- [ ] A `Purchase` record is created (audit trail — check if this already happens)
- [ ] Frontend form allows choosing the target gudang
- [ ] Only Admin and Gudang-role users can access this form
- [ ] Submission shows clear success/error feedback

---

## Agent Assignments

| Step | Agent | Status |
|------|-------|--------|
| 1 - Verify existing endpoint | `backend-engineer` | `[x]` |
| 2 - Extend backend to support warehouse_id + proof | `backend-engineer` | `[x]` |
| 3 - Frontend form update | `frontend-engineer` | `[x]` |
| 4 - Test | `tester` | `[ ]` |
| 5 - Review | `reviewer` | `[ ]` |

---

## Implementation Log

### Step 1 — Verify Existing Endpoint
**Agent**: backend-engineer
**Status**: completed

```
File checked: controllers/inventoryController.js → receiveFromSupplier
Current behavior:
  - Accepts: supplier_id, warehouse_id (refactored from werehouse_id), product_id, purchased_qty, accepted_qty, rejected_qty, reject_reason, price, batch, unit.
  - Creates: Purchase record, Stock record (or increments), Reject record (if any).
  - Market target: Dynamic from request (warehouse_id).
Gap identified: Missing image proof upload support in the backend and frontend.
```

---

### Step 2 — Backend Extension
**Agent**: backend-engineer
**Status**: completed

```
Files changed:
  - controllers/inventoryController.js (receiveFromSupplier & receiveBulkFromSupplier extended with Multer)
  - routes/product.js (added upload.single('proof'))
  - db/entities/Purchase.js (added image_proof column)
  - db/migrations/1777587233798-AddProofToPurchase.js (NEW migration)

Changes:
  - Added `image_proof` to Purchase entity and DB schema.
  - Implemented Multer memory storage handling in controllers to save proof images to `upload/purchase/`.
  - Added JSON parsing for bulk items when sent via FormData.
```

---

### Step 3 — Frontend
**Agent**: frontend-engineer
**Status**: completed

```
Files changed:
  - src/services/inventory.service.ts (Fixed warehouse typo, added FormData support for proof)
  - src/routes/_protected._inventory_group.inventory.receive-supplier.tsx (Added Proof Upload UI, fixed API payload)
```

---

### Step 4 — Testing
**Agent**: tester
**Status**: pending

```
Test cases:
  - POST with valid gudang_id → 200, stock incremented in correct gudang
  - POST with invalid gudang_id → 400/404 error
  - POST without proof image → behavior?
  - Unauthorized role (SPVR) → 403
Results: <fill in>
```

---

### Step 5 — Review
**Agent**: reviewer
**Status**: pending

---

## Completion Summary
*(Fill in when done)*
