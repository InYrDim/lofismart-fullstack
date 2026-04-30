# Workflow: Database Migration

Use this workflow for **any change to the database schema** — new tables, new columns, dropped columns, index changes, FK changes.

---

## When to Use This

- Adding a new entity/table to support a new feature
- Adding/removing/renaming a column
- Changing a column type or constraint
- Adding/removing a foreign key or index
- Creating seed data for a new table

---

## ⚠️ Critical Rules

> **Never** edit a migration file that has already been run in any environment.
> **Never** rely on entity files as the source of truth — always use `DATABASE_SCHEMA.md`.
> **Never** use `synchronize: true` in production configs.

---

## Execution Steps

### Step 1 — Capture Current State
**Agent**: `db-engineer`

```bash
cd lofishmart-backend
node scripts/dump_schema_to_md.js
```

Read `DATABASE_SCHEMA.md` carefully. Note:
- Current columns and types
- Existing foreign keys that might be affected
- Indexes that might need updating

---

### Step 2 — Plan the Change
**Agent**: `db-engineer`

Document in the task file:
- What tables/columns will be added/modified/removed
- What FKs will be added/removed
- What the rollback (`down()`) looks like
- Impact on existing data (destructive? backfill needed?)

---

### Step 3 — Create Migration
**Agent**: `db-engineer`

```bash
npx typeorm migration:create db/migrations/<DescriptiveName>
```

Implement:
- `up()` — the forward change
- `down()` — the exact rollback

---

### Step 4 — Update Entity
**Agent**: `db-engineer`

Update the TypeORM entity file to match the new schema. Make sure decorators match the column types and constraints in the migration.

---

### Step 5 — Create Seeder (if needed)
**Agent**: `db-engineer`

```bash
npm run seeder:create <SeederName>
# Fill in the up() method with INSERT statements
npm run seeder:run
```

---

### Step 6 — Run and Verify
**Agent**: `db-engineer`

```bash
npm run migration:run
node scripts/dump_schema_to_md.js
# Read DATABASE_SCHEMA.md again to confirm changes
```

---

### Step 7 — Notify Dependent Agents
**Agent**: `orchestrator`

After schema is confirmed:
- Notify `backend-engineer` if controllers need updating
- Notify `frontend-engineer` if API response types change
- Notify `tester` to update any tests that test schema-dependent behavior

---

### Step 8 — Review + Close
**Agent**: `reviewer` then `orchestrator`

```
Review: Check migration has down(), entity matches, no FK violations.
Close: Move task file to done/, record migration name and schema delta.
```
