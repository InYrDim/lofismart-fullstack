# Task 5: Migrate hooks and utilities

## Task Description

Replace ad-hoc roleId access in hooks and utility files with `getRoleId()`.

## Files to Modify

1. `lofishmart-frontend/src/hooks/useSetupStatus.ts`
2. `lofishmart-frontend/src/utils/payment.ts`

## What to Do

### 1. Fix `useSetupStatus.ts`

At line 40, replace:
```typescript
const roleId = u.role_id || u.role?.id || u.role;
```
With:
```typescript
import { getRoleId } from "./useRoleAndPermission";
// ...
const roleId = getRoleId(u);
```

Note: Add the import at the top of the file.

### 2. Fix `utils/payment.ts`

Replace the `canProcessPayment` function (lines 15-26):

```typescript
import { getRoleId } from "../hooks/useRoleAndPermission";

export function canProcessPayment(user: User | null): boolean {
  if (!user) return false;
  const allowedRoles = [ROLES.CASHIER, ROLES.ADMIN, "Kasir", "Admin"];
  const roleId = getRoleId(user);
  return allowedRoles.includes(roleId);
}
```

Remove the old `roleName` variable and inline type check.

## Verification

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

**DO NOT commit.** The controller will handle commits.

## Report File

Write your report to: `.superpowers/sdd/task-5-report.md`
