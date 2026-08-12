# Task 1: Add getRoleId() utility to useRoleAndPermission.ts

## Task Description

Add a standalone `getRoleId(user)` function to `useRoleAndPermission.ts` for use in non-hook contexts (beforeLoad, utils, callbacks).

## Files to Modify

- `lofishmart-frontend/src/hooks/useRoleAndPermission.ts`

## What to Do

1. Add import for User type at the top of the file
2. Add `getRoleId()` function BEFORE the hook (after imports)

## Code to Add

```typescript
import type { User } from "../types";

/**
 * Extract roleId from a User object, handling all backend response formats.
 * Use this in non-hook contexts (beforeLoad, utils, callbacks).
 */
export const getRoleId = (user: User | null): string => {
  if (!user) return "";
  if (typeof user.role === "string") return user.role;
  return user.role?.id || user.role_id || "";
};
```

## Why This Exists

The backend returns `role: "KSR"` (string), but the User type has `role?: { id, name }`. Every file was doing ad-hoc format detection. This utility centralizes that logic.

## Verification

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

**DO NOT commit.** The controller will handle commits.

## Report File

Write your report to: `.superpowers/sdd/task-1-report.md`
