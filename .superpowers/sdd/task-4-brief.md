# Task 4: Migrate _guest.index.lazy.tsx login handler

## Task Description

Replace ad-hoc roleId access in the login handler with `getRoleId()`.

## Files to Modify

- `lofishmart-frontend/src/routes/_guest.index.lazy.tsx`

## What to Do

1. Add import for `getRoleId`: `import { getRoleId } from "../hooks/useRoleAndPermission";`
2. In the `onSubmit` handler, replace:
   ```typescript
   const roleId = user.role_id || user.role;
   ```
   With:
   ```typescript
   const roleId = getRoleId(user);
   ```
3. The `ROLES` import is still needed for the comparison below it.

## Verification

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

**DO NOT commit.** The controller will handle commits.

## Report File

Write your report to: `.superpowers/sdd/task-4-report.md`
