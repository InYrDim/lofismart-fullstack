# Micro-Task ST-04: Role-Based Access & Per-Location Inventory Views

## Task ID
`2026-04-30-ST-04-rbac-visibility`

## Parent Task
`2026-04-30-stock-management-full-flow.md`

## Status
`[ ] Not Started`

## Depends On
`ST-01`, `ST-02`, `ST-03` — all previous micro-tasks must be complete

---

## Goal

Enforce **role-based visibility** across the entire stock management system:

- **Admin**: Can see and operate on ALL gudangs and ALL outlets. Has a context switcher in the UI to choose which location to view.
- **Supervisor (SPVR)**: Can ONLY see their assigned outlet (the outlet stored in `user.market_id`). Cannot see other outlets or any gudang.
- **Gudang (GDNG)**: Can see their assigned gudang and can initiate transfers to any outlet. Cannot see other gudangs' inventory directly.

Additionally, each Gudang and Outlet must show its **own isolated inventory** — no cross-location stock visibility except for Admins.

---

## Mandatory Reading (Before Starting)

```
1. .agents/context/conventions.md
2. .agents/context/constraints.md
3. APP_DOCUMENTATION/PERMISSIONS.md  ← role definitions: ADMN, GDNG, SPVR
4. lofishmart-backend/DATABASE_SCHEMA.md  ← check user.market_id, user.role_id
5. lofishmart-backend/middleware/auth.js + rbac.js  ← how role checks work
6. lofishmart-backend/controllers/inventoryController.js  ← existing list/dashboard endpoints
7. APP_DOCUMENTATION/feature/stock-management.md  ← Section 6 (Supervisor assignment)
8. lofishmart-frontend/src/context/AuthProvider.tsx  ← how user data is available in FE
```

---

## Scope

### In Scope

**Backend filtering:**
- `GET /inventory/transfer-orders`: filter results by role
  - Admin → all transfers
  - GDNG → only transfers where `source_stock.market_id = user.market_id`
  - SPVR → only transfers where `target_market_id = user.market_id`
- `GET /product/stock/list`: filter by `market_id`
  - Admin → can pass any `market_id` as query param
  - GDNG/SPVR → auto-filtered to their `user.market_id`
- `GET /product/inventory/dashboard`: same scoping

**Frontend:**
- Admin gets a **location context switcher** (dropdown: "Viewing: [All | Gudang A | Outlet B]")
- SPVR sees only their outlet's inventory — no switcher
- GDNG sees their gudang inventory — can initiate transfers to any outlet
- Conditional UI: action buttons shown/hidden based on user role

**Supervisor assignment:**
- Admin can assign a Supervisor to an outlet from the User management page
- `user.market_id` field used (backend already supports this via `userUpdate`)
- Frontend form: when editing a user with role `SPVR`, show an "Assign to Outlet" dropdown

### Out of Scope
- Creating new roles (use existing: ADMN, GDNG, SPVR)
- Changing how permissions are checked at the middleware level

---

## Acceptance Criteria

- [ ] SPVR can only see their assigned outlet's stock and incoming transfers
- [ ] SPVR cannot see any other outlet or gudang data
- [ ] Admin can switch between viewing different locations
- [ ] GDNG can only see their gudang's stock and outgoing transfers
- [ ] Admin can assign/reassign a Supervisor to an outlet via the UI
- [ ] Transfer list is correctly scoped per role on the backend (not just filtered on FE)
- [ ] Attempting to access another location's data as SPVR/GDNG returns 403

---

## Agent Assignments

| Step | Agent | Status |
|------|-------|--------|
| 1 - Backend role-scoped filtering | `backend-engineer` | `[ ]` |
| 2 - Frontend context switcher (Admin) | `frontend-engineer` | `[ ]` |
| 3 - Frontend SPVR/GDNG restricted views | `frontend-engineer` | `[ ]` |
| 4 - Supervisor assignment UI | `frontend-engineer` | `[ ]` |
| 5 - End-to-end tests | `tester` | `[ ]` |
| 6 - Final review | `reviewer` | `[ ]` |

---

## Implementation Log

### Step 1 — Backend Role-Scoped Filtering
**Agent**: backend-engineer
**Status**: pending

```
Files changed:
  - controllers/inventoryController.js
    → getTransferOrders: check req.user.role_id / req.user.market_id
    → getInventoryDashboard: filter by market_id based on role
  - routes/product.js (if middleware changes needed)

Role logic:
  if role == ADMN: no filter (or use query param market_id)
  if role == GDNG: filter where source market = user.market_id
  if role == SPVR: filter where target market = user.market_id
```

---

### Step 2 & 3 — Frontend Views
**Agent**: frontend-engineer
**Status**: pending

```
Files changed:
  - src/context/AuthProvider.tsx (verify role/market_id available)
  - src/components/markets/LocationSwitcher.tsx (new — Admin only)
  - src/routes/_protected._inventory_group.markets.tsx
    → Render LocationSwitcher for Admin
    → Pass selected location context to all child views
    → Hide action buttons based on role
```

---

### Step 4 — Supervisor Assignment UI
**Agent**: frontend-engineer
**Status**: pending

```
Files changed:
  - src/routes/_protected._management.users.lazy.tsx
    → Add "Outlet" column to user table (show outlet name if assigned)
    → In create/edit form: show Outlet dropdown when role = SPVR
    → Submit sends market_id to PATCH /user/user/update/:id

Note: Backend already supports market_id in userUpdate (RULES.md confirms this).
No backend change needed for this step.
```

---

### Step 5 — End-to-End Tests
**Agent**: tester
**Status**: pending

```
Test scenarios:
  - [ ] SPVR login → can only see outlet A stock (not outlet B, not gudang)
  - [ ] GDNG login → sees only gudang stock, can create transfer to any outlet
  - [ ] Admin login → can switch to view gudang or any outlet
  - [ ] Admin assigns SPVR to outlet → SPVR now sees that outlet
  - [ ] API: SPVR calls /inventory/transfer-orders → only their incoming transfers returned
  - [ ] API: SPVR calls with forged market_id → still only their data returned

Results: <fill in>
```

---

### Step 6 — Final Review
**Agent**: reviewer
**Status**: pending

---

## Completion Summary
*(Fill in when done)*

---

## Post-Completion: Update Master Task

After this task completes, update `2026-04-30-stock-management-full-flow.md`:
- Mark all acceptance criteria as done
- Add final sign-off from reviewer
