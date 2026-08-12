# Task 2: Delete dead useRole.ts

## Task Description

Delete the unused `useRole.ts` hook file. It is not imported anywhere in the codebase.

## Files to Delete

- `lofishmart-frontend/src/hooks/useRole.ts`

## What to Do

1. Verify no imports exist: `cd lofishmart-frontend/src && grep -r "useRole[^A]" --include="*.ts" --include="*.tsx" .`
   Expected: No matches (useRoleAndPermission is different)
2. Delete the file
3. Verify TypeScript still compiles: `cd lofishmart-frontend && npx tsc --noEmit`

**DO NOT commit.** The controller will handle commits.

## Report File

Write your report to: `.superpowers/sdd/task-2-report.md`
