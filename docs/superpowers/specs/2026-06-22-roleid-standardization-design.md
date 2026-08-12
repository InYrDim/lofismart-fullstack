# roleId Standardization Design

**Date:** 2026-06-22
**Problem:** Inconsistent roleId access across 20+ frontend files
**Goal:** Single source of truth, zero ad-hoc role checks

## Problem

The backend login returns `role: "KSR"` (string), but the TypeScript `User` type defines:
```typescript
role?: { id: string; name: string };
```

This mismatch causes **7 different patterns** across the codebase:
- `user?.role_id`
- `user?.role_id || user?.role?.id || user?.role || ""`
- `typeof user?.role === "string" ? user.role : user?.role?.id`
- `u.role_id || u.role?.id || u.role`
- `user.role_id || user.role`
- `user.role_id === "KSR"` (inline check)

## Solution

### 1. AuthContext (already correct — no change needed)

`AuthContext.tsx` already computes `roleId` correctly at line 37:
```typescript
roleId: typeof user?.role === "string" ? user.role : (user?.role?.id || user?.role_id || null),
```

### 2. useRole hook (fix as single source of truth)

```typescript
import { useAuth } from "./useAuth";

export const useRole = () => {
  const { roleId } = useAuth();

  const hasRole = (role: string): boolean => roleId === role;

  return {
    roleId,
    hasRole,
    isAdmin: roleId === "ADMN",
    isCashier: roleId === "KSR",
    isManager: roleId === "MNGR",
    isSupervisor: roleId === "SPVR",
    isGudang: roleId === "GDNG",
    isUser: roleId === "USER",
  };
};
```

### 3. Migration pattern

Every file replaces ad-hoc checks with `useRole()`:

| Before | After |
|--------|-------|
| `const roleId = user?.role_id \|\| user?.role?.id \|\| user?.role \|\| ""` | `const { roleId } = useRole()` |
| `user.role_id === "KSR"` | `const { isCashier } = useRole()` |
| `typeof user?.role === "string" ? user.role : user?.role?.id` | `const { roleId } = useRole()` |
| `isAdminOrManager = user?.role_id === ROLES.ADMIN \|\| user?.role_id === ROLES.MANAGER` | `const { isAdmin, isManager } = useRole()` |

### 4. Files to update (~20 files)

**Hooks:**
- `hooks/useRole.ts` — rewrite implementation
- `hooks/useSetupStatus.ts` — replace inline format detection

**Routes:**
- `routes/_protected.pos.tsx`
- `routes/_protected._management.tsx`
- `routes/_protected._management.users.lazy.tsx`
- `routes/_protected._inventory_group.tsx`
- `routes/_protected.test-remote-serial.lazy.tsx`
- `routes/_guest.index.lazy.tsx`
- `routes/_guest.tsx`

**Components:**
- `components/inventory/InventoryMain.tsx`
- `components/inventory/SupervisorStockView.tsx`
- `components/ui/modals/UserFormModal.tsx`
- `components/ui/modals/SupervisorAssignModal.tsx`
- `components/markets/AdminGudangSelector.tsx`
- `components/markets/AdminOutletSelector.tsx`
- `components/Sidebar.tsx`

**Utilities:**
- `utils/payment.ts`

### 5. Non-component code (routes, utils)

Routes use `beforeLoad` which runs outside React hooks. For these:
- Import `AuthService` + call `useRole` pattern inline
- OR create a plain `getRoleId(user)` utility for non-hook contexts

**Decision:** Add a standalone `getRoleId(user)` utility to `useRole.ts` for use in route `beforeLoad` callbacks and utility functions.

```typescript
// For non-hook contexts (beforeLoad, utils)
export const getRoleId = (user: User | null): string => {
  if (!user) return "";
  return typeof user.role === "string"
    ? user.role
    : user.role?.id || user.role_id || "";
};
```

## Out of scope

- Backend changes (backend already returns role correctly)
- User type changes (keep as-is for API compatibility)
- AuthContext changes (already handles all formats)

## Testing

- All existing E2E tests should pass unchanged
- Manual test: login as KSR, verify POS page accessible
- Manual test: login as non-admin, verify Remote Serial Test button hidden
