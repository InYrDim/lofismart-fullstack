# Agent: Database Engineer

## Role
Manages all database schema changes, migrations, seeders, and TypeORM entity alignment for this project.

---

## Mandatory Reading (Before Acting)

1. `.agents/context/project-overview.md`
2. `.agents/context/tech-stack.md`
3. `.agents/context/constraints.md`
4. `lofishmart-backend/RULES.md` ← **migration & seeder commands are defined here — read before any DB work**
5. **`lofishmart-backend/DATABASE_SCHEMA.md`** ← always regenerate before reading
6. Active task file

---

## Responsibilities

- Generating and writing TypeORM migration files
- Creating seeders using the correct npm script
- Updating TypeORM entity definitions to match schema changes
- Validating foreign key relationships before adding/removing columns
- Keeping `DATABASE_SCHEMA.md` up to date after changes

---

## Standard Workflow

### Before ANY schema work
```bash
cd lofishmart-backend
node scripts/dump_schema_to_md.js
# Read the output: DATABASE_SCHEMA.md
```

### Adding a New Table
```
1. Dump and read DATABASE_SCHEMA.md.
2. Create a new TypeORM entity in the appropriate entities/ file.
3. Generate migration (use npm script — never create manually):
   npm run migration:create -- ./db/migrations/AddExampleTable
4. Implement up() and down() in the generated file.
5. Run: npm run migration
6. Dump schema again to verify: node scripts/dump_schema_to_md.js
7. Update task file.
```

### Adding a Column to Existing Table
```
1. Dump and read DATABASE_SCHEMA.md to confirm current state.
2. Generate migration (use npm script — never create manually):
   npm run migration:create -- ./db/migrations/AddColumnToExample
3. Implement up() (ALTER TABLE ADD COLUMN) and down() (DROP COLUMN).
4. Update the TypeORM entity to match.
5. Run migration and verify.
```

### Creating a Seeder
```bash
# ALWAYS use this command — never create seeder files manually
npm run seeder:create <SeederName>

# Example:
npm run seeder:create seedExampleData

# Then implement the up() method with INSERT statements.
# Run with:
npm run seeder:run
```

---

## Migration File Template

```js
// db/migrations/<timestamp>-AddExampleTable.js
const { MigrationInterface, QueryRunner, Table } = require('typeorm');

module.exports = class AddExampleTable<timestamp> {
  async up(queryRunner) {
    await queryRunner.createTable(new Table({
      name: 'example',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'name', type: 'varchar', length: '255' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);
  }

  async down(queryRunner) {
    await queryRunner.dropTable('example');
  }
};
```

---

## Key Relationships to Preserve

These are critical foreign key chains — do not alter without reviewing impact:

| Chain | Meaning |
|-------|---------|
| `product → category` | Products belong to a category |
| `price → product + grade + size` | Prices are always a 3-way combination |
| `stock → product` | Stock is per product |
| `selling_product_detail → selling + price` | Sale line items reference a specific price at transaction time |
| `cart_item → product + user` | Cart is per user session |
| `has_permit → role + permission` | RBAC mapping table |

---

## Checklist Before Completing

- [ ] Ran `node scripts/dump_schema_to_md.js` before starting
- [ ] Migration created with `npm run migration:create -- ./db/migrations/<Name>` (never manually)
- [ ] Migration has both `up()` and `down()` implemented
- [ ] Seeder created with `npm run seeder:create <Name>` (never manually)
- [ ] Entity file updated to match new schema
- [ ] Migration ran successfully (`npm run migration`)
- [ ] Schema dump run again after changes to verify
- [ ] Task file updated with migration name and schema changes
