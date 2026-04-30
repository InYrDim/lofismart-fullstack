# Tech Stack Reference

This is the **exact** technology inventory for this project. Do not assume versions — use what is listed here.

---

## Frontend (`lofishmart-frontend/`)

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Framework | React | 19 |
| Language | TypeScript | 5.9 (strict mode) |
| Build tool | Vite (Rolldown) | Latest |
| Routing | TanStack Router v1 | File-based, `src/routes/` |
| Styling | Tailwind CSS | v4 |
| UI Components | shadcn/ui | Radix UI + Lucide React |
| Forms | TanStack Form + Zod | Validation enforced |
| HTTP Client | Custom `ApiClient` | `src/utils/api.ts` — **always use this** |
| Global State | React Context API | `src/context/` |
| Business Logic | Custom Hooks | `src/hooks/` |
| Hardware | Web Serial API | Weight scale communication (`SerialProvider`) |

### Key Files — Frontend

```
src/
├── utils/api.ts           ← Singleton HTTP client (auth + error handling)
├── hooks/useCart.ts       ← Master cart logic (pricing, variants, vouchers)
├── context/
│   ├── AuthProvider.tsx   ← JWT session management
│   ├── PaymentProvider.tsx
│   └── SerialProvider.tsx ← Hardware scale communication
├── routes/                ← TanStack Router file-based pages
├── services/              ← API call groupings per resource
└── types/                 ← All TypeScript interfaces/types
```

---

## Backend (`lofishmart-backend/`)

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Runtime | Node.js | 18+ |
| Framework | Express.js | 4.x |
| Language | JavaScript | CommonJS (not ESM) |
| ORM | TypeORM | 0.3 |
| Database | MySQL | 8+ |
| Auth | JWT + Bcrypt | Token-based sessions |
| File Uploads | Multer | Required for `multipart/form-data` routes |
| API Docs | Swagger / OpenAPI | `openapi.yaml` |
| Payment | Xendit | QRIS via webhooks |
| Testing | Vitest | `vitest.config.ts` |

### Key Files — Backend

```
app.js                     ← Express app entry, route mounting
routes/                    ← Route files per domain (never use routes/index.js for prod)
controllers/               ← Fat controllers (business logic + DB)
middleware/                ← JWT, RBAC, audit log, multer
config/
├── typeorm-cli.js         ← Main TypeORM config
└── typeorm-seeder-cli.js  ← Seeder-specific config (separate seeders table)
db/
├── migrations/            ← Schema migrations
└── seeder/                ← Seed data
scripts/
└── dump_schema_to_md.js   ← Regenerates DATABASE_SCHEMA.md ← ALWAYS run before schema work
```

---

## Database

- **Engine**: MySQL 8+
- **ORM**: TypeORM 0.3
- **Schema source of truth**: Run `node scripts/dump_schema_to_md.js`, then read `DATABASE_SCHEMA.md`
- **35 entities** — do not guess relationships from code alone
- **Migrations**: Managed by TypeORM CLI; auto-sync is **disabled** in production

---

## Infrastructure

| Component | Detail |
|-----------|--------|
| Containerization | Docker (frontend = Nginx + Vite build) |
| Environment | `.env` files (separate DEV/PROD values) |
| Schema management | TypeORM CLI migrations only |
| Dev start | Root `start-dev.js` or `npm run dev` in each sub-package |
