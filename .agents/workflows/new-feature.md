# Workflow: New Full-Stack Feature

Use this workflow when delivering a **complete feature** that touches both the backend API and the frontend UI.

---

## When to Use This

- Adding a new module (e.g., supplier management, report export)
- Implementing a new screen end-to-end (backend → API → frontend)
- Any feature that requires new routes, controllers, DB changes, and UI

---

## Pre-requisites

- [ ] Task file created at `.agents/tasks/active/<date>-<feature-slug>.md`
- [ ] Goal and Acceptance Criteria defined in task file
- [ ] Orchestrator has reviewed and broken down the task

---

## Execution Steps

### Step 1 — Database (if schema changes needed)
**Agent**: `db-engineer`

```
1. Run: node scripts/dump_schema_to_md.js
2. Read DATABASE_SCHEMA.md
3. Create migration for new/modified tables
4. Update entity files
5. Run migration: npm run migration:run
6. Verify: run dump again
7. Update task file with migration details
```

> ⚠️ All subsequent steps depend on the final, confirmed schema from this step.

---

### Step 2 — Backend API
**Agent**: `backend-engineer`
**Depends on**: Step 1

```
1. Read task file + DATABASE_SCHEMA.md
2. Create/modify controller in controllers/
3. Create/modify route file in routes/
4. Mount router in app.js (if new file)
5. Apply JWT + RBAC middleware
6. Update openapi.yaml with new endpoints
7. Update task file with API surface (endpoint list)
```

---

### Step 3 — Frontend UI
**Agent**: `frontend-engineer`
**Depends on**: Step 2 (needs confirmed API endpoints from openapi.yaml)

```
1. Read task file + openapi.yaml (new endpoints)
2. Define/update types in src/types/
3. Create/update service in src/services/
4. Create custom hook if stateful logic is complex (src/hooks/)
5. Build components in src/components/
6. Create page route in src/routes/
7. Update task file with components and pages created
```

---

### Step 4 — Testing
**Agent**: `tester`
**Depends on**: Steps 2 and 3

```
1. Write backend endpoint tests
2. Write frontend component tests
3. Run full test suite in both packages
4. Record results in task file
```

---

### Step 5 — Code Review
**Agent**: `reviewer`
**Depends on**: Step 4 (all tests passing)

```
1. Review all changed files against conventions.md + constraints.md
2. Produce review report in task file
3. If approved: proceed to Step 6
4. If changes needed: return to responsible agent
```

---

### Step 6 — Close Task
**Agent**: `orchestrator`

```
1. Verify all checklist items are complete
2. Move task file: tasks/active/ → tasks/done/
3. Add completion summary to task file
```

---

## Parallel vs Sequential

| Steps | Can run in parallel? |
|-------|---------------------|
| Step 1 (DB) | Must come first if schema changes required |
| Steps 2 & 3 | Step 3 can start once Step 2's API contracts are defined, even before Step 2 is 100% complete |
| Step 4 | Only after both 2 and 3 are complete |
| Steps 5 & 6 | Sequential, after Step 4 |
