# Project Overview — Lofish Mart

## What is this?

**Lofish Mart** is a production fullstack web application for a **fish and seafood retail store**.

It provides:
- 🛒 **Point of Sale (POS)** — real-time cashier interface with hardware scale integration
- 📦 **Inventory Management** — stock, stock opname, supplier purchases
- 👤 **User & Role Management** — multi-tier RBAC with granular permissions
- 💳 **Payment Processing** — cash, digital payments via Xendit (QRIS)
- 📊 **Admin Dashboard** — analytics, audit logs, reporting
- ⚙️ **System Configuration** — store profiles, market settings, sync/export

## Architecture

```
lofishmart-fullstack/
├── lofishmart-frontend/     # React SPA (Vite + TanStack Router)
├── lofishmart-backend/      # Node.js REST API (Express + TypeORM)
├── APP_DOCUMENTATION/       # Human-written project documentation
└── .agents/                 # AI agent orchestration (this folder)
```

## Key Business Domain Concepts

| Term | Meaning |
|------|---------|
| **Grade** | Fish quality tier (e.g., Grade A, B, C) — affects price |
| **Size** | Fish size category — affects price |
| **Price** | Derived from `Product + Grade + Size` combination |
| **Stock Opname** | Physical inventory count / reconciliation |
| **CartItem** | Item held in checkout before a `Selling` is committed |
| **Selling** | A finalized sale transaction |
| **Purchase** | A supplier stock purchase |
| **DataChange** | Audit log entry for any mutation |
| **Market** | Physical store location |
| **Voucher** | Discount code applied at checkout |

## Repository Structure Reference

- Backend source: `lofishmart-backend/` (CommonJS, MVC pattern)
- Frontend source: `lofishmart-frontend/src/` (ESM, React component pattern)
- Database schema truth: `lofishmart-backend/DATABASE_SCHEMA.md` ← always regenerate before editing schema
- API documentation: `lofishmart-backend/openapi.yaml`
- App-level docs: `APP_DOCUMENTATION/`

## Environments

| Env | Detail |
|-----|--------|
| Dev backend | `http://localhost:3000` |
| Dev frontend | `http://localhost:5173` |
| Production | Dockerized (Nginx + Express) |
