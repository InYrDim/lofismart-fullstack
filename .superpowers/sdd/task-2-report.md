# Task 2: Delete dead useRole.ts — COMPLETE

## Status: DONE

## What was done
1. **Verified no imports exist**: Grepped `lofishmart-frontend/src/` for `useRole` (excluding `useRoleAndPermission`). The only match was the definition itself in `useRole.ts` — zero imports from other files.
2. **Deleted the file**: Removed `lofishmart-frontend/src/hooks/useRole.ts` (12 lines, simple hook wrapping `AuthService.getCurrentUser()` with a `hasRole()` helper).
3. **Verified TypeScript compiles**: Ran `npx tsc --noEmit` in the frontend directory — clean compilation, zero errors.

## Files deleted
- `lofishmart-frontend/src/hooks/useRole.ts`
