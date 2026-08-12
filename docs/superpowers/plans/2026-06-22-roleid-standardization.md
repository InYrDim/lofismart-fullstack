# roleId Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all ad-hoc roleId access patterns by standardizing on `useRoleAndPermission()` hook and `getRoleId()` utility.

**Architecture:** `useRoleAndPermission.ts` already exists with convenience booleans. Add `getRoleId()` utility for non-hook contexts. Delete dead `useRole.ts`. Migrate ~15 files.

**Tech Stack:** React 19, TypeScript 5.9, TanStack Router

## Global Constraints

- Never use `any` type in TypeScript
- Use `ROLES` constants from `config/roles.ts` for comparisons
- Backend returns `role: "KSR"` (string), but User type has `role?: { id, name }`

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `hooks/useRoleAndPermission.ts` | Modify | Add `getRoleId()` utility |
| `hooks/useRole.ts` | Delete | Dead code, not imported anywhere |
| `routes/_protected.pos.tsx` | Modify | Use `getRoleId()` in beforeLoad |
| `routes/_protected._management.tsx` | Modify | Use `getRoleId()` in beforeLoad |
| `routes/_protected._inventory_group.tsx` | Modify | Use `getRoleId()` in beforeLoad |
| `routes/_protected.test-remote-serial.lazy.tsx` | Modify | Use `getRoleId()` in beforeLoad |
| `routes/_guest.tsx` | Modify | Use `getRoleId()` in beforeLoad |
| `routes/_guest.index.lazy.tsx` | Modify | Use `getRoleId()` after login |
| `hooks/useSetupStatus.ts` | Modify | Use `getRoleId()` in filter |
| `utils/payment.ts` | Modify | Use `getRoleId()` in canProcessPayment |
| `components/inventory/InventoryMain.tsx` | Modify | Remove redundant ad-hoc checks |
| `components/inventory/SupervisorStockView.tsx` | Modify | Remove redundant ad-hoc check |
| `components/ui/modals/UserFormModal.tsx` | Modify | Use `getRoleId()` for form init |
| `components/ui/modals/SupervisorAssignModal.tsx` | Modify | Use `getRoleId()` in filter |
| `components/Sidebar.tsx` | Modify | Use `useRoleAndPermission()` |
| `components/markets/AdminGudangSelector.tsx` | Modify | Use `useRoleAndPermission()` |
| `components/markets/AdminOutletSelector.tsx` | Modify | Use `useRoleAndPermission()` |

---

### Task 1: Add `getRoleId()` utility to `useRoleAndPermission.ts`

**Files:**
- Modify: `lofishmart-frontend/src/hooks/useRoleAndPermission.ts`

**Interfaces:**
- Produces: `getRoleId(user: User | null): string` — standalone function for non-hook contexts

- [ ] **Step 1: Add getRoleId utility**

Add at the top of the file (after imports, before the hook):

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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lofishmart-frontend/src/hooks/useRoleAndPermission.ts
git commit -m "feat: add getRoleId utility to useRoleAndPermission"
```

---

### Task 2: Delete dead `useRole.ts`

**Files:**
- Delete: `lofishmart-frontend/src/hooks/useRole.ts`

- [ ] **Step 1: Verify no imports exist**

Run: `cd lofishmart-frontend/src && grep -r "useRole[^A]" --include="*.ts" --include="*.tsx" .`
Expected: No matches (useRoleAndPermission is different)

- [ ] **Step 2: Delete the file**

```bash
rm lofishmart-frontend/src/hooks/useRole.ts
```

- [ ] **Step 3: Commit**

```bash
git add -A lofishmart-frontend/src/hooks/useRole.ts
git commit -m "chore: delete unused useRole.ts hook"
```

---

### Task 3: Migrate route `beforeLoad` callbacks to `getRoleId()`

**Files:**
- Modify: `routes/_protected.pos.tsx`
- Modify: `routes/_protected._management.tsx`
- Modify: `routes/_protected._inventory_group.tsx`
- Modify: `routes/_protected.test-remote-serial.lazy.tsx`
- Modify: `routes/_guest.tsx`

**Interfaces:**
- Consumes: `getRoleId(user)` from Task 1

- [ ] **Step 1: Fix `_protected.pos.tsx`**

```typescript
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthService } from "../services/auth.service";
import { ROLES } from "../config/roles";
import { getRoleId } from "../hooks/useRoleAndPermission";

const POS_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] as string[];

export const Route = createFileRoute("/_protected/pos")({
  beforeLoad: () => {
    const user = AuthService.getCurrentUser();
    const roleId = getRoleId(user);
    if (!roleId || !POS_ROLES.includes(roleId)) {
      throw redirect({ to: "/dashboard" });
    }
  },
});
```

- [ ] **Step 2: Fix `_protected._management.tsx`**

```typescript
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthService } from "../services/auth.service";
import { ROLES } from "../config/roles";
import { getRoleId } from "../hooks/useRoleAndPermission";

const MANAGEMENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.GUDANG, ROLES.SUPERVISOR] as string[];

export const Route = createFileRoute("/_protected/_management")({
  beforeLoad: () => {
    const user = AuthService.getCurrentUser();
    const roleId = getRoleId(user);
    if (!roleId || !MANAGEMENT_ROLES.includes(roleId)) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: () => <Outlet />,
});
```

- [ ] **Step 3: Fix `_protected._inventory_group.tsx`**

```typescript
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthService } from "../services/auth.service";
import { ROLES } from "../config/roles";
import { getRoleId } from "../hooks/useRoleAndPermission";

const INVENTORY_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.GUDANG] as string[];

export const Route = createFileRoute("/_protected/_inventory_group")({
  beforeLoad: () => {
    const user = AuthService.getCurrentUser();
    const roleId = getRoleId(user);
    if (!roleId || !INVENTORY_ROLES.includes(roleId)) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: () => <Outlet />,
});
```

- [ ] **Step 4: Fix `_protected.test-remote-serial.lazy.tsx`**

Replace the role check in the component:

```typescript
import { useRoleAndPermission } from "../hooks/useRoleAndPermission";

// Inside component:
const { isAdmin } = useRoleAndPermission();

useEffect(() => {
  if (!isAdmin) {
    navigate({ to: "/dashboard" });
  }
}, [isAdmin, navigate]);

if (!isAdmin) return null;
```

- [ ] **Step 5: Fix `_guest.tsx`**

```typescript
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AuthService } from '../services/auth.service';
import { getRoleId } from '../hooks/useRoleAndPermission';
import { ROLES } from '../config/roles';

export const Route = createFileRoute('/_guest')({
  beforeLoad: async () => {
    if (AuthService.isAuthenticated()) {
      const user = AuthService.getCurrentUser();
      const roleId = getRoleId(user);
      const isAdminOrManager = roleId === ROLES.ADMIN || roleId === ROLES.MANAGER;

      throw redirect({
        to: isAdminOrManager ? '/dashboard' : '/pos',
      });
    }
  },
  component: () => <Outlet />,
});
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add lofishmart-frontend/src/routes/
git commit -m "refactor: migrate route beforeLoad to use getRoleId()"
```

---

### Task 4: Migrate `_guest.index.lazy.tsx` login handler

**Files:**
- Modify: `routes/_guest.index.lazy.tsx`

**Interfaces:**
- Consumes: `getRoleId(user)` from Task 1

- [ ] **Step 1: Fix login handler**

```typescript
import { getRoleId } from "../hooks/useRoleAndPermission";

// In onSubmit handler, replace:
const roleId = user.role_id || user.role;
// With:
const roleId = getRoleId(user);
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lofishmart-frontend/src/routes/_guest.index.lazy.tsx
git commit -m "refactor: migrate login handler to use getRoleId()"
```

---

### Task 5: Migrate hooks and utilities

**Files:**
- Modify: `hooks/useSetupStatus.ts`
- Modify: `utils/payment.ts`

**Interfaces:**
- Consumes: `getRoleId(user)` from Task 1

- [ ] **Step 1: Fix `useSetupStatus.ts`**

Replace line 40:
```typescript
const roleId = u.role_id || u.role?.id || u.role;
```
With:
```typescript
import { getRoleId } from "./useRoleAndPermission";

// In the filter callback:
const roleId = getRoleId(u);
```

- [ ] **Step 2: Fix `utils/payment.ts`**

Replace `canProcessPayment` function:
```typescript
import { getRoleId } from "../hooks/useRoleAndPermission";

export function canProcessPayment(user: User | null): boolean {
  if (!user) return false;
  const allowedRoles = [ROLES.CASHIER, ROLES.ADMIN, "Kasir", "Admin"];
  const roleId = getRoleId(user);
  return allowedRoles.includes(roleId);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lofishmart-frontend/src/hooks/useSetupStatus.ts lofishmart-frontend/src/utils/payment.ts
git commit -m "refactor: migrate hooks and utils to use getRoleId()"
```

---

### Task 6: Migrate components

**Files:**
- Modify: `components/inventory/InventoryMain.tsx`
- Modify: `components/inventory/SupervisorStockView.tsx`
- Modify: `components/ui/modals/UserFormModal.tsx`
- Modify: `components/ui/modals/SupervisorAssignModal.tsx`
- Modify: `components/Sidebar.tsx`
- Modify: `components/markets/AdminGudangSelector.tsx`
- Modify: `components/markets/AdminOutletSelector.tsx`

**Interfaces:**
- Consumes: `useRoleAndPermission()` and `getRoleId()` from Task 1

- [ ] **Step 1: Fix `InventoryMain.tsx`**

Line 57-60: Replace ad-hoc checks. The component already imports `useRoleAndPermission` but also does manual checks on `userData`. Since `userData` comes from `AuthService.getCurrentUser()` (not context), use `getRoleId()`:

```typescript
import { useRoleAndPermission, getRoleId } from "../../hooks/useRoleAndPermission";

// Remove line 57:
// const userRole = typeof userData?.role === "string" ? userData.role : userData?.role?.id;
// Replace with:
const userRole = getRoleId(userData);
```

- [ ] **Step 2: Fix `SupervisorStockView.tsx`**

Line 298: Replace inline type check in debug info:
```typescript
// Before:
<p>Role: {typeof user?.role === 'object' ? (user.role as any)?.id : user?.role}</p>
// After:
import { getRoleId } from "../../hooks/useRoleAndPermission";
<p>Role: {getRoleId(user)}</p>
```

- [ ] **Step 3: Fix `UserFormModal.tsx`**

Lines 46, 103: Replace `user.role_id || user.role?.id || ""` with `getRoleId(user)`:
```typescript
import { getRoleId } from "../../hooks/useRoleAndPermission";

// In useState initializer:
const rIdVal = getRoleId(user);
```

- [ ] **Step 4: Fix `SupervisorAssignModal.tsx`**

Line 45: Replace `u.role_id === 'SPVR' || u.role?.id === 'SPVR'` with:
```typescript
import { getRoleId } from "../../hooks/useRoleAndPermission";

const isSupervisor = getRoleId(u) === 'SPVR';
```

- [ ] **Step 5: Fix `Sidebar.tsx`**

Line 50: Replace `authContext?.roleId || ""` — this already uses context, so it's fine. No change needed unless there are other ad-hoc checks.

- [ ] **Step 6: Fix `AdminGudangSelector.tsx`**

Already uses `const { roleId: userRole } = useAuth()` — acceptable pattern. No change needed.

- [ ] **Step 7: Fix `AdminOutletSelector.tsx`**

Already uses `const userRole = auth?.roleId` — acceptable pattern. No change needed.

- [ ] **Step 8: Verify TypeScript compiles**

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 9: Commit**

```bash
git add lofishmart-frontend/src/components/
git commit -m "refactor: migrate components to use useRoleAndPermission/getRoleId"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full TypeScript check**

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Lint check**

Run: `cd lofishmart-frontend && npm run lint`
Expected: No errors

- [ ] **Step 3: Verify no remaining ad-hoc patterns**

Run: `cd lofishmart-frontend/src && grep -rn "role_id\|role\.id" --include="*.ts" --include="*.tsx" . | grep -v "node_modules\|test\|\.gen\." | grep -v "getRoleId\|useRole\|role_id:" | head -20`
Expected: Only legitimate uses (UserFormModal form data, user.service types, etc.)

- [ ] **Step 4: Run frontend tests**

Run: `cd lofishmart-frontend && npm run test:run`
Expected: All tests pass

- [ ] **Step 5: Final commit if needed**

```bash
git add -A
git commit -m "refactor: complete roleId standardization migration"
```
