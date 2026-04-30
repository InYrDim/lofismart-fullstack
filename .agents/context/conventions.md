# Coding Conventions

These conventions apply to **all agents** working on this project. They reflect what is already established in the codebase and must be maintained.

---

## Global Rules

- Never guess — always read source files before modifying.
- Always check `DATABASE_SCHEMA.md` (after running `node scripts/dump_schema_to_md.js`) before touching any DB-related code.
- Do not create production routes inside `routes/index.js` — it is test/legacy only.
- Every code change that is non-trivial must be documented in the active task file.

---

## Backend Conventions (`lofishmart-backend/`)

### Language
- CommonJS only (`require`/`module.exports`) — no ESM in backend.

### Routing
```
✅ routes/product.js     ← production route
✅ routes/selling.js     ← production route
❌ routes/index.js       ← TEST / LEGACY ONLY
```
- All routers are mounted **under `/api`** in `app.js` (e.g., `app.use('/api/product', productRouter)`).
- Route files define paths **without** the `/api` prefix — it is applied only at the mount point.
- Full rule: `lofishmart-backend/API_RULES.md`
- Any route receiving `multipart/form-data` **must** include Multer middleware.

### Controllers
- Pattern: Fat Controller — request parsing + business logic + DB all in the controller.
- Use TypeORM repositories directly (e.g., `AppDataSource.getRepository(Product)`).

### Database / Migrations
```bash
# Creating a migration (ALWAYS use this — never create the file manually)
npm run migration:create -- ./db/migrations/DescriptiveName

# Running migrations
npm run migration

# Reverting the last migration
npm run migration:revert

# Creating a seeder (ALWAYS use this — never create the file manually)
npm run seeder:create <SeederName>

# Running seeders
npm run seeder:run
```
- **Never** edit migration files after they have been run in any environment.
- Seeders are tracked separately in the `seeders` table, not `migrations`.
- Full rules: `lofishmart-backend/RULES.md`

### Middleware
- JWT verification is applied via `middleware/auth.js`.
- Role checks via `middleware/rbac.js` — always check `PERMISSIONS.md` in `APP_DOCUMENTATION/`.
- Audit log middleware auto-captures mutations via `middleware/dataChange.js`.

---

## Frontend Conventions (`lofishmart-frontend/`)

### Language
- TypeScript 5.9 in **strict mode**.
- `any` is **forbidden** — use `unknown` + type narrowing if dynamic.
- Every component must have a typed `interface` for its props.

### Component Pattern
```tsx
// ✅ Correct pattern
interface ProductCardProps {
  product: Product;
  onSelect: (id: number) => void;
}
export function ProductCard({ product, onSelect }: ProductCardProps) { ... }

// ❌ Wrong — no any, no untyped props
export function ProductCard({ product, onSelect }: any) { ... }
```

### File Naming
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase + `use` prefix | `useCart.ts` |
| Services | camelCase + `.service.ts` | `product.service.ts` |
| Types | camelCase + `.types.ts` | `product.types.ts` |
| Routes | TanStack Router convention | `_protected.products.lazy.tsx` |

### API Calls
```ts
// ✅ Always use the centralized client
import { api } from '@/utils/api';
const products = await api.get('/products');

// ❌ Never use raw fetch or axios directly
const products = await fetch('/api/products');
```

### Routing
- Add pages by creating files in `src/routes/` — TanStack Router auto-discovers them.
- `_protected.*` = authenticated pages
- `_guest.*` = public pages (login etc.)
- Use `<Link>` from `@tanstack/react-router` for all internal navigation.

### State Management
| Scope | Solution |
|-------|---------|
| Local component | `useState`, `useReducer` |
| Shared UI state | React Context in `src/context/` |
| Complex/reusable logic | Custom hook in `src/hooks/` |
| Server state | Direct `api` calls inside hooks or effects |

### Styling
- Tailwind CSS v4 utility classes in JSX.
- Use `cn()` from `src/lib/utils.ts` for conditional class merging.
- Prefer existing `shadcn/ui` components over building raw HTML.

---

## Commit / Naming Conventions

```
feat(backend): add stock opname endpoint
fix(frontend): resolve cart total calculation bug
refactor(db): normalize price table migration
docs(agents): update task log for feature-X
```
