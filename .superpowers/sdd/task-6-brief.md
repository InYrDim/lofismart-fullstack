# Task 6: Migrate components

## Task Description

Replace ad-hoc roleId access in components with `useRoleAndPermission()` or `getRoleId()`.

## Files to Modify

1. `lofishmart-frontend/src/components/inventory/InventoryMain.tsx`
2. `lofishmart-frontend/src/components/inventory/SupervisorStockView.tsx`
3. `lofishmart-frontend/src/components/ui/modals/UserFormModal.tsx`
4. `lofishmart-frontend/src/components/ui/modals/SupervisorAssignModal.tsx`

**No changes needed** for Sidebar.tsx, AdminGudangSelector.tsx, AdminOutletSelector.tsx (they already use context properly).

## What to Do

### 1. Fix `InventoryMain.tsx`

The component already imports `useRoleAndPermission` but also does manual checks on `userData`. Since `userData` comes from `AuthService.getCurrentUser()` (not context), use `getRoleId()`:

- Add `getRoleId` to the existing import: `import { useRoleAndPermission, getRoleId } from "../../hooks/useRoleAndPermission";`
- Replace line 57:
  ```typescript
  // Before:
  const userRole = typeof userData?.role === "string" ? userData.role : userData?.role?.id;
  // After:
  const userRole = getRoleId(userData);
  ```

### 2. Fix `SupervisorStockView.tsx`

Line 298 has an inline type check in debug info. Replace:

```typescript
// Before:
<p>Role: {typeof user?.role === 'object' ? (user.role as any)?.id : user?.role}</p>
// After:
import { getRoleId } from "../../hooks/useRoleAndPermission";
<p>Role: {getRoleId(user)}</p>
```

Add `getRoleId` to the existing import from `useRoleAndPermission`.

### 3. Fix `UserFormModal.tsx`

Lines 46 and 103 have `user.role_id || user.role?.id || ""`. Replace with `getRoleId(user)`:

- Add import: `import { getRoleId } from "../../hooks/useRoleAndPermission";`
- Replace both occurrences of the ad-hoc pattern

### 4. Fix `SupervisorAssignModal.tsx`

Line 45 has `u.role_id === 'SPVR' || u.role?.id === 'SPVR'`. Replace with:

- Add import: `import { getRoleId } from "../../hooks/useRoleAndPermission";`
- Replace: `const isSupervisor = getRoleId(u) === 'SPVR';`

## Verification

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

**DO NOT commit.** The controller will handle commits.

## Report File

Write your report to: `.superpowers/sdd/task-6-report.md`
