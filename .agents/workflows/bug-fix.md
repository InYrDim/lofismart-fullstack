# Workflow: Bug Fix

Use this workflow for investigating and fixing bugs — whether they are backend API errors, frontend UI issues, or database problems.

---

## When to Use This

- Unexpected 500 errors from the API
- Frontend component rendering incorrectly
- Data inconsistency or wrong values from DB queries
- Auth/permission failures that should not happen

---

## Execution Steps

### Step 1 — Investigate
**Agent**: `orchestrator` or the most relevant specialist

```
1. Read the task file (bug description, reproduction steps, expected vs actual).
2. Identify which layer the bug lives in:
   - Backend? → Check routes/, controllers/, middleware/
   - Frontend? → Check src/components/, src/hooks/, src/services/
   - Database? → Run dump and read DATABASE_SCHEMA.md
3. Narrow down to the specific file and line.
4. Document findings in the task file under "Root Cause".
```

---

### Step 2 — Fix
**Agent**: Assign based on layer identified in Step 1

```
backend-engineer  → if bug is in routes/controllers/middleware
frontend-engineer → if bug is in components/hooks/services/types
db-engineer       → if bug is in schema/migration/entity
```

Fix must:
- Be minimal (don't refactor unrelated code)
- Preserve existing API contracts unless the contract itself is the bug
- Follow all conventions in `conventions.md`

---

### Step 3 — Verify Fix
**Agent**: `tester`

```
1. Write a regression test that reproduces the original bug.
2. Confirm the test fails on the unfixed code (if possible to revert temporarily).
3. Confirm the test passes after the fix.
4. Run the full test suite to check for regressions.
5. Document test results in the task file.
```

---

### Step 4 — Review
**Agent**: `reviewer`

```
1. Review the fix diff for correctness and convention compliance.
2. Confirm the regression test is meaningful (not trivially passing).
3. Approve or request changes.
```

---

### Step 5 — Close
**Agent**: `orchestrator`

```
1. Confirm fix is in place and tests pass.
2. Move task file to tasks/done/
3. Add root cause and fix summary to task file.
```

---

## Common Bug Patterns in This Project

| Symptom | Likely Cause | Where to Look |
|---------|-------------|---------------|
| `req.body` is empty on POST | Missing Multer middleware on multipart route | `routes/*.js` |
| 401 on valid token | JWT middleware not applied / wrong middleware order | `app.js`, `routes/*.js` |
| Wrong price calculated | Grade+Size combination not matched correctly | `controllers/price.js`, `useCart.ts` |
| TypeScript error on API response | Response type mismatch in `src/types/` | `src/types/`, `src/services/` |
| Schema mismatch error | Entity out of sync with migration | Run `dump_schema_to_md.js`, check entity |
| Route not found (404) | Router not mounted in `app.js` | `app.js` |
| Cart state lost | Context provider not wrapping the component tree | `src/context/`, root layout |
