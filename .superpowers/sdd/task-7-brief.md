# Task 7: Final verification

## Task Description

Run full verification to ensure all changes compile and no ad-hoc roleId patterns remain.

## What to Do

### 1. Full TypeScript check

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

### 2. Lint check

Run: `cd lofishmart-frontend && npm run lint`
Expected: No errors (or only pre-existing warnings)

### 3. Verify no remaining ad-hoc patterns

Run: `cd lofishmart-frontend/src && grep -rn "role_id\|role\.id" --include="*.ts" --include="*.tsx" . | grep -v "node_modules\|test\|\.gen\." | grep -v "getRoleId\|useRole\|role_id:" | head -20`

Expected: Only legitimate uses remain (UserFormModal form data fields, user.service types, etc.)

### 4. Run frontend tests

Run: `cd lofishmart-frontend && npm run test:run`
Expected: All tests pass

**DO NOT commit.** The controller will handle commits.

## Report File

Write your report to: `.superpowers/sdd/task-7-report.md`
