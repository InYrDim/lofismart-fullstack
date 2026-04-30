# Micro-Task ST-01: Gudang & Outlet CRUD

## Task ID
`2026-04-30-ST-01-gudang-outlet-crud`

## Parent Task
`2026-04-30-stock-management-full-flow.md`

## Status
`[ ] Not Started`

## Priority
🔴 **Must complete first** — ST-02 and ST-03 depend on confirmed Gudang/Outlet schema

---

## Goal

Build full CRUD management for **Gudang** (warehouses) and **Outlets** so that:
- Admins can create named locations (gudang or outlet), edit them, and soft-delete them
- Each location type is clearly distinguished in the system
- The locations become selectable when receiving stock (gudang) or transferring stock (outlet)

> **Important context:** The project already has a `profile` table used for market/outlet data and a
> `warehouse` table (with CRUD permissions already seeded). Verify the current state of both via
> `DATABASE_SCHEMA.md` before deciding whether to extend existing tables or create new ones.
> Also check if `/warehouse` routes already exist in `routes/`.

---

## Mandatory Reading (Before Starting)

```
1. .agents/context/project-overview.md
2. .agents/context/tech-stack.md
3. .agents/context/conventions.md
4. .agents/context/constraints.md
5. lofishmart-backend/RULES.md
6. APP_DOCUMENTATION/PERMISSIONS.md  ← check WHSE/WHED/WHDL permissions
7. lofishmart-backend/DATABASE_SCHEMA.md  ← AFTER running: node scripts/dump_schema_to_md.js
8. lofishmart-backend/openapi.yaml  ← check existing /warehouse endpoints
```

---

## Scope

### In Scope
- **Gudang**: CRUD endpoints — list, byid, create, update, soft-delete
- **Outlet**: CRUD endpoints — list, byid, create, update, soft-delete
  - May reuse existing `profile` CRUD if profile already separates by type
  - Or extend `profile` with a `type` enum (`GUDANG` | `OUTLET`) if not already present
- Frontend management pages for Gudang and Outlet
- Supervisor assignment to outlet (field: `supervisor_id` or reuse `user.market_id`)

### Out of Scope
- Stock data (that's ST-02 and ST-03)
- Transfer flow (that's ST-03)

---

## Acceptance Criteria

- [ ] Admin can list all Gudang locations
- [ ] Admin can create a new Gudang (name, address, optional notes)
- [ ] Admin can edit a Gudang
- [ ] Admin can soft-delete a Gudang
- [ ] Admin can list all Outlets
- [ ] Admin can create a new Outlet (name, address, optional notes)
- [ ] Admin can edit an Outlet
- [ ] Admin can soft-delete an Outlet
- [ ] Admin can assign a Supervisor to an Outlet (from user list, role = SPVR)
- [ ] Gudang and Outlet are distinguishable in the system (e.g., by `type` field)
- [ ] All endpoints follow existing permission pattern (`warehouse` / `warehouse-edit` / `warehouse-delete`)

---

## Agent Assignments

| Step | Agent | Status |
|------|-------|--------|
| 1 - Investigate current DB/routes | `db-engineer` | `[ ]` |
| 2 - DB migration (if schema change needed) | `db-engineer` | `[ ]` |
| 3 - Backend CRUD endpoints | `backend-engineer` | `[ ]` |
| 4 - Frontend management pages | `frontend-engineer` | `[ ]` |
| 5 - Review | `reviewer` | `[ ]` |

---

## Implementation Log

### Step 1 — DB Investigation
**Agent**: db-engineer
**Status**: pending

```
Run: node scripts/dump_schema_to_md.js
Check:
  - Does `warehouse` table exist? What columns?
  - Does `profile` table have a `type` field?
  - Which approach: extend profile / use warehouse / create new table?
Decision: <fill in>
```

---

### Step 2 — DB Migration (if needed)
**Agent**: db-engineer
**Status**: pending

```
Migration: <fill in name>
Changes:
  - <describe what columns/tables added/modified>
```

---

### Step 3 — Backend API
**Agent**: backend-engineer
**Status**: pending

```
Files changed:
  - routes/<file>.js
  - controllers/<controller>.js
  - app.js (if new router mounted)
  - openapi.yaml

Endpoints added:
  - GET  /warehouse/list
  - GET  /warehouse/byid/:id
  - POST /warehouse/create
  - PATCH /warehouse/update/:id
  - DELETE /warehouse/soft-delete/:id
  - (similar for outlets if separate)
```

---

### Step 4 — Frontend
**Agent**: frontend-engineer
**Status**: pending

```
Files created/modified:
  - src/types/warehouse.types.ts
  - src/services/warehouse.service.ts
  - src/components/warehouse/...
  - src/routes/_protected.warehouse.lazy.tsx (or similar)
```

---

### Step 5 — Review
**Agent**: reviewer
**Status**: pending

---

## Completion Summary
*(Fill in when done)*
