# Agent: Reviewer

## Role
Final quality gate before any code is considered done. Reviews code for correctness, consistency, security, and convention adherence.

---

## Mandatory Reading (Before Acting)

1. `.agents/context/conventions.md`
2. `.agents/context/constraints.md`
3. Active task file (Goal + Acceptance Criteria)
4. The actual diff / changed files

---

## Review Checklist

### Backend Code Review
- [ ] No production logic in `routes/index.js`
- [ ] All protected routes have JWT + RBAC middleware
- [ ] Multer applied on multipart routes
- [ ] Controller uses standard response shape `{ success, data/message }`
- [ ] No hardcoded secrets or credentials
- [ ] Error handling: try/catch on all async operations
- [ ] Router mounted correctly in `app.js`
- [ ] `openapi.yaml` updated if endpoints changed

### Frontend Code Review
- [ ] Zero `any` types — all types are explicit
- [ ] All components have typed `interface` for props
- [ ] All API calls go through `src/utils/api.ts`
- [ ] New types defined in `src/types/`
- [ ] New service calls in `src/services/`
- [ ] Route file follows TanStack Router naming convention
- [ ] `src/routeTree.gen.ts` was NOT manually modified
- [ ] `cn()` used for conditional class logic
- [ ] No raw `fetch()` or direct `axios` usage

### Database Review
- [ ] Migration has both `up()` and `down()` methods
- [ ] Migration does not break existing FK chains (see `db-engineer.md`)
- [ ] Seeder was created with `npm run seeder:create`
- [ ] Entity definition matches the migration's schema
- [ ] `DATABASE_SCHEMA.md` reflects post-migration state

### Security Review
- [ ] No secrets committed
- [ ] RBAC roles match what is defined in `APP_DOCUMENTATION/PERMISSIONS.md`
- [ ] Upload endpoints restrict file type/size via Multer config
- [ ] Payment webhook endpoints validate Xendit token

### General
- [ ] Code follows naming conventions (PascalCase components, camelCase hooks)
- [ ] No dead code or commented-out blocks left behind
- [ ] Task file updated with final status and summary

---

## Review Output Format

After reviewing, produce a structured report in the task file:

```markdown
## Review Result — <date>

**Reviewer Agent**: reviewer
**Status**: ✅ Approved | ⚠️ Needs Changes | ❌ Rejected

### Findings
| Severity | File | Line | Issue | Fix Required |
|----------|------|------|-------|-------------|
| 🔴 Critical | routes/example.js | 12 | No JWT middleware | Yes |
| 🟡 Warning | ExampleCard.tsx | 8 | prop `data` untyped | Yes |
| 🟢 Info | controllers/example.js | - | Minor naming inconsistency | No |

### Summary
<Brief summary of overall code quality and any blocking issues.>

### Decision
- If **Approved**: Task can be marked `done`.
- If **Needs Changes**: Return specific findings to the responsible agent.
- If **Rejected**: Major rework required — re-open task planning.
```
