# Task: Stock Management System — Full Flow (Master Task)

## Task ID
`2026-04-30-stock-management-full-flow`

## Status
`[/] In Progress`

## Created
`2026-04-30`

## Workflow
`workflows/new-feature.md`

---

## Goal

Implement a complete, multi-location stock management system for Lofish Mart that models the physical stock flow:

```
Supplier → Gudang (chosen warehouse) → Outlet (chosen destination)
```

Each **Gudang** (warehouse) and each **Outlet** have their own independent inventory. Stock moves between them via a tracked transfer system. An Admin can oversee all locations; a Supervisor only sees and operates within their assigned outlet.

This feature also requires proper **CRUD management of Gudang and Outlets** (create, view, update, soft-delete), since currently these are managed via the `profile` table with no dedicated management UI for type-separated entries.

> **Note:** The project already has partial groundwork for this:
> - `warehouse` permissions exist (`WHSE`, `WHED`, `WHDL`) in the DB
> - `stock_transfer` table design is documented in `APP_DOCUMENTATION/feature/stock-management.md`
> - The `receiveFromSupplier` backend endpoint already exists at `POST /product/inventory/receive`
> - The instant (non-verified) `transferToMarket` endpoint exists but needs replacing with the 3-status transfer flow

---

## Scope

### In Scope
- Gudang CRUD (create, list, update, soft-delete) — backend + frontend
- Outlet CRUD (create, list, update, soft-delete) — backend + frontend (may already partially exist via `profile`)
- Supplier → Gudang stock receiving with proof (already partially built; verify and extend)
- Gudang → Outlet stock transfer with 3-status flow: `SENDING → WAITING_VERIFICATION → DONE`
- Stock cancel flow: `SENDING → CANCELLED` (returns stock to Gudang)
- Role-based visibility: Admin sees all; Supervisor sees only their assigned outlet
- Supervisor assignment to outlet (admin can assign supervisor to a specific outlet)
- Per-location inventory view (each Gudang and Outlet shows its own stock)

### Out of Scope
- Print reports (Surat Jalan, Bukti Terima) — deferred to a separate print task
- Outlet-to-outlet transfers (not requested)
- Gudang-to-Gudang transfers (not requested)
- Real-time WebSocket updates (infrastructure exists but not in scope here)

---

## Acceptance Criteria

A task is complete when:
- [ ] Admin can create, edit, and soft-delete Gudang locations
- [ ] Admin can create, edit, and soft-delete Outlet locations
- [ ] Admin can assign a Supervisor to an outlet
- [ ] Stock can be received from a supplier into a chosen Gudang (with proof upload)
- [ ] Stock can be transferred from Gudang → Outlet via the 3-status flow
- [ ] Supervisor can verify (ACC) or the transfer can be cancelled
- [ ] Each Gudang and Outlet shows only its own stock in the inventory view
- [ ] Admin UI allows switching context between outlets/gudangs
- [ ] Supervisor can only see their assigned outlet
- [ ] All above passes tests

---

## Micro-Task Breakdown

This master task is split into 4 micro-tasks, each in their own file:

| # | Micro-Task File | Scope | Agent |
|---|----------------|-------|-------|
| 1 | `2026-04-30-ST-01-gudang-outlet-crud.md` | Gudang & Outlet CRUD (BE + FE) | db-engineer → backend-engineer → frontend-engineer |
| 2 | `2026-04-30-ST-02-supplier-receive.md` | Supplier → Gudang receive flow | backend-engineer → frontend-engineer |
| 3 | `2026-04-30-ST-03-stock-transfer.md` | Gudang → Outlet 3-status transfer | db-engineer → backend-engineer → frontend-engineer |
| 4 | `2026-04-30-ST-04-rbac-visibility.md` | Role-based access & inventory views | backend-engineer → frontend-engineer → tester |

**Execution order:** ST-01 → (ST-02 and ST-03 in parallel after ST-01 DB is done) → ST-04 → final review

---

## Key Context References

- Existing design doc: `APP_DOCUMENTATION/feature/stock-management.md`
- Permissions reference: `APP_DOCUMENTATION/PERMISSIONS.md`
- Existing warehouse perms: `WHSE` (view), `WHED` (edit), `WHDL` (soft-delete)
- Existing inventory controller: `lofishmart-backend/controllers/inventoryController.js`
- Existing inventory routes: `lofishmart-backend/routes/product.js`
- Profile table (outlets already use this): `feature/profile` endpoints
- DB schema truth: run `node scripts/dump_schema_to_md.js` first

---

## Final Review
**Agent**: reviewer → orchestrator
**Status**: `[ ]` pending all micro-tasks
