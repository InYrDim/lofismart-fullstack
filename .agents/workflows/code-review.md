# Workflow: Code Review

Use this workflow to conduct a structured review of completed code before merging or marking a task as done.

---

## When to Use This

- After a feature is built and tested
- Before merging a significant refactor
- When a bug fix involves non-trivial code changes
- Periodic code quality audits

---

## Execution Steps

### Step 1 — Gather Context
**Agent**: `reviewer`

```
1. Read .agents/context/conventions.md
2. Read .agents/context/constraints.md
3. Read the task file for the feature/fix being reviewed
4. Identify all files changed for this task
```

---

### Step 2 — Review Changed Files

For each changed file, apply the appropriate checklist:

#### Backend Files
- [ ] Route is in the correct domain file
- [ ] Router mounted in `app.js`
- [ ] JWT + RBAC middleware on all protected routes
- [ ] Multer on multipart routes
- [ ] Try/catch on all async operations
- [ ] Consistent response shape `{ success, data/message }`
- [ ] No hardcoded credentials
- [ ] `openapi.yaml` updated

#### Frontend Files
- [ ] Zero `any` types
- [ ] All props interfaces defined
- [ ] All API calls through `src/utils/api.ts`
- [ ] Types in `src/types/`, services in `src/services/`
- [ ] Route follows TanStack naming convention
- [ ] `routeTree.gen.ts` not manually edited
- [ ] `cn()` used for conditional Tailwind classes

#### Database / Migration Files
- [ ] Both `up()` and `down()` implemented
- [ ] No FK violations with existing schema
- [ ] Entity definition matches migration
- [ ] Seeder not manually created

---

### Step 3 — Produce Review Report

Add to the task file:

```markdown
## Code Review — <YYYY-MM-DD>

**Status**: ✅ Approved | ⚠️ Needs Changes | ❌ Rejected

### Issues Found
| Severity | File | Issue | Action |
|----------|------|-------|--------|
| 🔴 Critical | file.js | Missing JWT auth | Must fix |
| 🟡 Warning | Component.tsx | Untyped prop | Should fix |
| 🟢 Info | hook.ts | Style suggestion | Optional |

### Decision
- **Approved**: Orchestrator can close the task.
- **Needs Changes**: Return to responsible agent with specific issues.
- **Rejected**: Re-open task for major rework.
```

---

### Step 4 — Close or Return
**Agent**: `orchestrator`

```
If Approved → Close task, move to tasks/done/
If Needs Changes → Assign findings to relevant agent, re-run from Step 2 after fixes
If Rejected → Reopen task planning phase
```
