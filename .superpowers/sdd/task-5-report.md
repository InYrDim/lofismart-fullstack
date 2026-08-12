# Task 5: Migrate hooks and utilities - Report

## Status: PASSED

## Changes Made

### 1. `lofishmart-frontend/src/hooks/useSetupStatus.ts`

- Added `import { getRoleId } from "./useRoleAndPermission";` at the top of the file
- Replaced ad-hoc roleId extraction: `const roleId = u.role_id || u.role?.id || u.role;` with `const roleId = getRoleId(u);`

### 2. `lofishmart-frontend/src/utils/payment.ts`

- Added `import { getRoleId } from "../hooks/useRoleAndPermission";` at the top of the file
- Refactored `canProcessPayment` function to use `getRoleId(user)` instead of inline role detection logic
- Removed old `roleName` variable and dual-check logic (`roles.includes(roleId ?? "") || roles.includes(roleName ?? "")`)
- Simplified to single `allowedRoles.includes(roleId)` check

## Verification

- TypeScript compile (`npx tsc --noEmit`): **PASSED** - zero errors
- No commits made per task instructions
