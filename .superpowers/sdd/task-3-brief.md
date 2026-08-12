# Task 3: Migrate route beforeLoad callbacks to getRoleId()

## Task Description

Replace ad-hoc roleId access patterns in route `beforeLoad` callbacks with `getRoleId()`.

## Files to Modify

1. `lofishmart-frontend/src/routes/_protected.pos.tsx`
2. `lofishmart-frontend/src/routes/_protected._management.tsx`
3. `lofishmart-frontend/src/routes/_protected._inventory_group.tsx`
4. `lofishmart-frontend/src/routes/_protected.test-remote-serial.lazy.tsx`
5. `lofishmart-frontend/src/routes/_guest.tsx`

## What to Do

### 1. Fix `_protected.pos.tsx`

Replace the `beforeLoad` to use `getRoleId()`:

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

### 2. Fix `_protected._management.tsx`

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

### 3. Fix `_protected._inventory_group.tsx`

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

### 4. Fix `_protected.test-remote-serial.lazy.tsx`

This file uses a component-level check, not beforeLoad. Replace the inline role detection with `useRoleAndPermission()`:

- Import `useRoleAndPermission` from `"../hooks/useRoleAndPermission"`
- Remove import of `useAuth` if it's only used for roleId
- Replace: `const roleId = user?.role_id || user?.role?.id || user?.role || "";`
  With: `const { isAdmin } = useRoleAndPermission();`
- Replace: `if (roleId !== ROLES.ADMIN)` with `if (!isAdmin)`
- Replace the `roleId` dependency in useEffect with `isAdmin`

### 5. Fix `_guest.tsx`

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

## Why This Exists

The backend returns `role: "KSR"` (string), but the User type has `role?: { id, name }`. Every route was doing ad-hoc format detection. `getRoleId()` centralizes this.

## Verification

Run: `cd lofishmart-frontend && npx tsc --noEmit`
Expected: No errors

**DO NOT commit.** The controller will handle commits.

## Report File

Write your report to: `.superpowers/sdd/task-3-report.md`
