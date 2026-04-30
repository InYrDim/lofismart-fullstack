# Task Template

Copy this file to `.agents/tasks/active/<YYYY-MM-DD>-<feature-slug>.md` to start a new task.

---

## Task ID
`<YYYY-MM-DD>-<feature-slug>`

## Status
`[ ] Planning` | `[/] In Progress` | `[x] Done` | `[!] Blocked`

## Created
`<YYYY-MM-DD>`

## Workflow
Which workflow applies? (choose one)
- [ ] `workflows/new-feature.md`
- [ ] `workflows/bug-fix.md`
- [ ] `workflows/db-migration.md`
- [ ] `workflows/code-review.md`
- [ ] Ad-hoc (describe below)

---

## Goal

> What are we building or fixing? Write 2–5 sentences describing the outcome.

---

## Scope

### In Scope
- 

### Out of Scope
- 

---

## Acceptance Criteria

A task is complete when:
- [ ] 
- [ ] 
- [ ] 

---

## Agent Assignments

| Step | Agent | Status |
|------|-------|--------|
| 1 - DB changes | `db-engineer` | `[ ]` |
| 2 - Backend API | `backend-engineer` | `[ ]` |
| 3 - Frontend UI | `frontend-engineer` | `[ ]` |
| 4 - Testing | `tester` | `[ ]` |
| 5 - Review | `reviewer` | `[ ]` |

*(Remove steps that don't apply to this task)*

---

## Implementation Log

### Step 1 — DB Changes
**Agent**: db-engineer  
**Status**: pending

```
- Migration created: <migration name>
- Tables affected: 
- Schema changes: 
```

---

### Step 2 — Backend API
**Agent**: backend-engineer  
**Status**: pending

```
Files changed:
- routes/xxx.js (new/modified)
- controllers/xxxController.js (new/modified)
- app.js (router mounted at /api/xxx)
- openapi.yaml (endpoints added/modified)

Endpoints:
- GET  /api/xxx        → description
- POST /api/xxx        → description
```

---

### Step 3 — Frontend UI
**Agent**: frontend-engineer  
**Status**: pending

```
Files created/modified:
- src/types/xxx.types.ts
- src/services/xxx.service.ts
- src/hooks/useXxx.ts (if needed)
- src/components/XxxCard.tsx
- src/routes/_protected.xxx.lazy.tsx
```

---

### Step 4 — Testing
**Agent**: tester  
**Status**: pending

```
Tests written:
- tests/xxx.test.js (backend)
- src/components/__tests__/XxxCard.test.tsx (frontend)

Results:
- Backend: X/X passing
- Frontend: X/X passing
- Regressions: none / list any
```

---

### Step 5 — Code Review
**Agent**: reviewer  
**Status**: pending

```
Review Result: Approved / Needs Changes / Rejected
Issues: (see review report above)
```

---

## Completion Summary

*(Fill in when task is marked done)*

```
Completed: <YYYY-MM-DD>
What was built/fixed: 
Files changed: 
Migration applied: 
Tests added: 
```
