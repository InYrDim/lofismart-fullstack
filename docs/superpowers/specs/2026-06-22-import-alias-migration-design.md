# Import Alias Migration Design

**Date:** 2026-06-22
**Problem:** 618 relative imports (`../`) across 173 frontend files
**Goal:** Convert all to `@/` alias for cleaner, shorter imports

## Problem

Every import uses relative paths like `../../hooks/useAuth` which are verbose and break when files move.

## Solution

Convert all `from "../"` and `from "../../"` patterns to `from "@/..."`.

**Before:**
```typescript
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../components/ui/button";
```

**After:**
```typescript
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
```

## Rules

1. Only convert `from "../` patterns — leave `./` (same-directory) imports as-is
2. Calculate the correct `@/` path based on the file's depth
3. Preserve all other import syntax (type imports, named imports, default imports)
4. Do NOT touch test files' mock paths unless they use `../`
5. Do NOT touch `@tanstack/react-router` or other package imports

## Scope

- 618 occurrences across 173 files
- All under `lofishmart-frontend/src/`
- Vite and TypeScript configs already have `@` alias configured

## Out of scope

- Adding new aliases (e.g., `@components`, `@hooks`)
- Restructuring the directory layout
- Backend changes
