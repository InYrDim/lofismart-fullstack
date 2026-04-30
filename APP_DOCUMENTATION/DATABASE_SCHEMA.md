# LofishMart Database Schema Specification

**Purpose:** This document provides a complete specification of the LofishMart database schema for AI agents. It describes every table, its purpose, columns, relationships, and role in the system.

**System Type:** Retail/Fresh Market POS, Inventory Management, and Multi-Branch Administration System

**Database:** MySQL 8+ via TypeORM 0.3

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Organization & Branches](#organization--branches)
4. [Product Catalog](#product-catalog)
5. [Inventory Management](#inventory-management)
6. [Purchasing](#purchasing)
7. [Sales & POS](#sales--pos)
8. [Quality Control](#quality-control)
9. [Data Synchronization](#data-synchronization)
10. [System Configuration](#system-configuration)
11. [Entity Relationship Diagrams](#entity-relationship-diagrams)
12. [Key Patterns & Conventions](#key-patterns--conventions)

---

## Schema Overview

The database consists of **37 tables** organized into 9 functional domains:

| Domain | Tables | Purpose |
|--------|--------|---------|
| Authentication & Authorization | 5 | User management, roles, permissions, sessions |
| Organization & Branches | 2 | Multi-branch/market structure, warehouses |
| Product Catalog | 6 | Products, categories, grades, sizes, pricing, services |
| Inventory Management | 4 | Stock tracking, stock opname, transfers |
| Purchasing | 2 | Purchase orders, supplier management |
| Sales & POS | 8 | Transactions, cart, payments, vouchers, members |
| Quality Control | 1 | Product rejection/damage tracking |
| Data Synchronization | 5 | Multi-branch data sync, import/export jobs |
| System Configuration | 4 | App config, notifications, hardware integration |

---

## Authentication & Authorization

### User (`user`)

**Purpose:** Stores system user accounts with authentication credentials and branch assignment.

**Why it exists:** Core identity table for all system access. Every action in the system is attributed to a user.

**Relation to project:** Central to all operations - users create purchases, process sales, manage stock, and perform administrative functions. Market assignment enables multi-branch access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(8) | PRIMARY KEY | Unique user identifier |
| `name` | varchar(150) | NOT NULL | Full display name |
| `email` | varchar(150) | UNIQUE, NOT NULL | Email address (login credential) |
| `username` | varchar(30) | UNIQUE, NOT NULL | Username (alternative login) |
| `password` | varchar(255) | NOT NULL | Bcrypt-hashed password |
| `remember_token` | varchar(150) | NULL | Persistent login token for "remember me" |
| `permissions` | json | NULL | Direct user permissions (overrides role) |
| `image` | varchar(255) | NULL | Profile picture URL/path |
| `market_id` | varchar(12) | FK → Profile.id | Assigned branch/market location |
| `role_id` | varchar(8) | FK → Role.id | User's role for permission inheritance |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | Last modification timestamp |
| `deleted_at` | timestamp | NULL | Soft delete timestamp (NULL = active) |

**Relationships:**
- `ManyToOne → Role` via `role_id` (CASCADE update, SET NULL delete)
- `ManyToOne → Profile` via `market_id` (branch assignment)
- `OneToMany → Session` (user's active sessions)
- `OneToMany → Stock` (stock records created by user)
- `OneToMany → Purchase` (purchase orders created by user)
- `OneToMany → Selling` (sales transactions processed by user)
- `OneToMany → Reject` (rejection reports filed by user)
- `OneToMany → StockOpname` (stock takes conducted by user)

**Business Rules:**
- Users are soft-deletable (can be deactivated without data loss)
- Each user belongs to exactly one market/branch
- Permissions can be granted via role OR directly via JSON field
- Supports persistent sessions via remember_token

---

### Role (`role`)

**Purpose:** Defines user roles for role-based access control (RBAC).

**Why it exists:** Enables permission grouping - instead of assigning 50+ permissions to each user, assign a role (e.g., "Cashier", "Manager") that bundles permissions.

**Relation to project:** Roles define what users can do across the system (view products, process sales, approve stock opname, manage users, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(4) | PRIMARY KEY | Role identifier (e.g., "R01", "ADM") |
| `name` | varchar(20) | NOT NULL | Role name (e.g., "Admin", "Cashier", "Stock Manager") |
| `guard_name` | varchar(20) | NOT NULL | Auth guard identifier (e.g., "web", "api") |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → HasPermit` (role's permissions)
- `OneToMany → User` (users with this role)

**Default Roles (seeded):**
- Admin: Full system access
- Supervisor: Operational oversight, approvals
- Cashier: POS transactions only
- Stock Manager: Inventory management
- Warehouse Staff: Stock receiving, transfers

---

### Permission (`permission`)

**Purpose:** Granular access control definitions (e.g., "view_products", "create_selling", "approve_opname").

**Why it exists:** Provides fine-grained authorization checks in controllers and middleware.

**Relation to project:** Every protected API endpoint checks for specific permissions before allowing actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(4) | PRIMARY KEY | Permission identifier |
| `name` | varchar(20) | NOT NULL | Permission name (e.g., "products.view", "selling.create") |
| `guard_name` | varchar(20) | NOT NULL | Auth guard identifier |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToMany → Role` via `HasPermit` junction table

**Permission Naming Convention:**
- Format: `{domain}.{action}` (e.g., `products.create`, `stock.opname`)
- Domains: users, roles, products, stock, selling, purchase, reports, settings

---

### HasPermit (`has_permit`)

**Purpose:** Junction table for Role-Permission many-to-many relationship.

**Why it exists:** Relational databases require a junction table to model many-to-many relationships.

**Relation to project:** Defines which permissions each role has. Changing role permissions means modifying rows in this table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(8) | PRIMARY KEY | |
| `role_id` | varchar(8) | FK → Role.id, CASCADE | Parent role |
| `permission_id` | varchar(8) | FK → Permission.id, CASCADE | Permission granted |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Business Rules:**
- Cascade delete: If a role or permission is deleted, all associations are removed
- A role can have 0 to N permissions
- Same permission can be assigned to multiple roles

---

### Session (`session`)

**Purpose:** Tracks active user sessions for authentication state management.

**Why it exists:** Enables session-based authentication, concurrent session tracking, and forced logout capabilities.

**Relation to project:** Every authenticated request validates against session data. Used for "logout from all devices" functionality.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(16) | PRIMARY KEY | Session token/identifier |
| `user_id` | varchar(8) | FK → User.id, CASCADE | Session owner |
| `ip_address` | varchar(30) | NULL | Client IP at session creation |
| `user_agent` | varchar(255) | NULL | Browser/device identifier |
| `payload` | text | NOT NULL | Serialized session data (JSON) |
| `expired_at` | timestamp | NULL | Session expiration timestamp |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Business Rules:**
- Sessions are deleted on user logout
- Expired sessions are cleaned up periodically
- Payload contains user state, permissions snapshot, market context

---

## Organization & Branches

### Profile (`profile`)

**Purpose:** Represents a physical branch/market location in the multi-branch system.

**Why it exists:** LofishMart operates across multiple retail locations. This table enables data isolation per branch and branch-specific configuration.

**Relation to project:** Almost every transactional entity (Stock, Selling, Purchase, User) references a Profile. This enables:
- Branch-specific inventory tracking
- Branch-specific sales reporting
- Branch-based user assignment
- Multi-branch data synchronization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(8) | PRIMARY KEY | Branch identifier |
| `name` | varchar(60) | NOT NULL | Branch display name (e.g., "Lofish Mart - Jakarta Utara") |
| `address` | text | NULL | Full street address |
| `maps` | text | NULL | Google Maps URL/coordinates |
| `city` | varchar(20) | NULL | City name |
| `pos` | varchar(10) | NULL | POS terminal identifier/code |
| `timezone` | varchar(30) | NULL | IANA timezone (e.g., "Asia/Makassar") |
| `time_dif` | int | DEFAULT 0 | UTC offset in hours |
| `phone_number` | varchar(20) | NULL | Branch contact number |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |
| `deleted_at` | timestamp | NULL | Soft delete timestamp |

**Relationships:**
- `OneToMany → User` (users assigned to this branch)
- `OneToMany → Stock` (stock at this branch)
- `OneToMany → Selling` (sales at this branch)
- `OneToMany → StockOpname` (stock takes at this branch)
- `OneToMany → StockTransfer` (transfer destinations)
- `OneToMany → Notification` (branch notifications)
- `OneToMany → Config` (branch-specific configuration)

**Business Rules:**
- Soft deletable (branches can be closed without losing historical data)
- Each branch operates semi-autonomously with its own inventory
- Branches sync data via DataChange/DataReceive mechanism

---

### Warehouse (`warehouse`)

**Purpose:** Represents a storage facility for inventory, separate from retail branches.

**Why it exists:** Distinguishes between retail locations (Profile) and storage facilities. Enables centralized stock management and inter-warehouse transfers.

**Relation to project:** Stock is tracked per warehouse. Purchase orders receive stock into warehouses. Stock transfers move inventory between warehouses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(8) | PRIMARY KEY | Warehouse identifier |
| `name` | varchar(60) | NOT NULL | Warehouse name (e.g., "Main Distribution Center") |
| `code` | varchar(20) | UNIQUE | Short code (e.g., "WH-JKT", "WH-SBY") |
| `address` | text | NULL | Full address |
| `city` | varchar(20) | NULL | City |
| `phone_number` | varchar(20) | NULL | Contact number |
| `is_active` | boolean | DEFAULT true | Active status (false = closed/inactive) |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → Stock` (stock stored here)
- `OneToMany → Purchase` (purchase orders received here)

**Note:** Field `werehouse` (typo) is used consistently in Stock and Purchase entities instead of `warehouse`.

---

## Product Catalog

### Product (`product`)

**Purpose:** Master definition of sellable items (fish, seafood, services).

**Why it exists:** Core entity for inventory and sales. Every stock movement and sale references a product.

**Relation to project:** Central to all operations - purchasing, stock management, POS sales, reporting.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(8) | PRIMARY KEY | Product identifier |
| `name` | varchar(100) | NOT NULL | Product display name (e.g., "Red Snapper", "White Shrimp") |
| `barcode` | varchar(30) | UNIQUE | EAN/UPC barcode or internal SKU |
| `unit` | enum('1', '2') | DEFAULT '1' | Unit of measure: '1'=kilogram, '2'=item/piece |
| `is_non_stock` | enum('1', '2') | DEFAULT '1' | Stock model: '1'=tracked stock, '2'=non-stock/pre-order |
| `is_show` | enum('1', '2') | DEFAULT '1' | Visibility: '1'=visible in POS, '2'=hidden |
| `image` | text | NULL | JSON array of image URLs/paths |
| `category_id` | varchar(4) | FK → Category.id, CASCADE | Product category |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |
| `deleted_at` | timestamp | NULL | Soft delete timestamp |

**Relationships:**
- `ManyToOne → Category` (eager loading enabled)
- `OneToMany → Price` (pricing variants)
- `OneToMany → Stock` (inventory records)
- `OneToMany → Purchase` (purchase orders)
- `OneToMany → StockOpnameDetail` (stock take items)

**Business Rules:**
- Products are soft-deletable (historical sales must remain intact)
- `is_show` allows hiding products without deleting (e.g., seasonal items)
- `is_non_stock` enables hybrid model: tracked inventory + made-to-order items

---

### Category (`category`)

**Purpose:** Product categorization for organization and reporting.

**Why it exists:** Groups products logically (e.g., "Fresh Fish", "Shellfish", "Processed") for filtering, reporting, and UI organization.

**Relation to project:** Used in product listings, sales reports by category, inventory reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(4) | PRIMARY KEY | Category identifier |
| `name` | varchar(30) | NOT NULL | Category name |
| `barcode` | varchar(2) | NOT NULL | Category code (legacy/shortcut) |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Example Categories:**
- Fish (Fresh Fish)
- Shell (Shellfish)
- Cephalo (Cephalopods - squid, octopus)
- Process (Processed seafood)
- Frozen (Frozen products)

---

### Grade (`grade`)

**Purpose:** Product quality classification (e.g., Grade A, Grade B, Premium, Standard).

**Why it exists:** Seafood pricing varies significantly by quality. Grade enables same product, different quality tiers with different prices.

**Relation to project:** Combined with Size to determine final selling price via the Price table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(4) | PRIMARY KEY | Grade identifier |
| `name` | varchar(30) | NOT NULL | Grade name (e.g., "Grade A", "Premium", "KW") |
| `barcode` | varchar(2) | NOT NULL | Grade code |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → Price` (prices for this grade)

**Business Rules:**
- Grades are global (not product-specific)
- Not all products use grades (commodities may have single grade)

---

### Size (`size`)

**Purpose:** Product size classification (e.g., Small, Medium, Large, XL).

**Why it exists:** Seafood pricing varies by size. Enables same product, different sizes with different prices.

**Relation to project:** Combined with Grade to determine final selling price.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(4) | PRIMARY KEY | Size identifier |
| `name` | varchar(30) | NOT NULL | Size name (e.g., "Small (5-7)", "Large (15-20)") |
| `barcode` | varchar(2) | NOT NULL | Size code |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → Price` (prices for this size)

**Business Rules:**
- Sizes can be product-specific or generic
- Size often corresponds to weight ranges (e.g., "5-7 pcs/kg" for shrimp)

---

### Price (`price`)

**Purpose:** Stores product pricing variants based on Grade and Size combinations.

**Why it exists:** A single product can have multiple prices depending on quality grade and size. This table normalizes the pricing matrix.

**Relation to project:** POS looks up Price records to determine selling price. Stock inherits price from purchase. Sales snapshot price at transaction time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(16) | PRIMARY KEY | Price record identifier |
| `product_id` | varchar(8) | FK → Product.id, CASCADE | Product reference |
| `grade_id` | varchar(4) | FK → Grade.id, CASCADE | Quality grade |
| `size_id` | varchar(4) | FK → Size.id, CASCADE | Size classification |
| `initial` | double | DEFAULT 0 | Cost price (from supplier) |
| `selling` | double | DEFAULT 0 | Selling price (to customer) |
| `disc` | double | DEFAULT 0 | Default discount amount/percentage |
| `barcode` | varchar(10) | NULL | Variant-specific barcode |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → Product` (CASCADE delete)
- `ManyToOne → Grade` (CASCADE delete)
- `ManyToOne → Size` (CASCADE delete)
- `OneToMany → SellingProductDetail` (sales using this price)
- `OneToMany → CartItem` (cart items)

**Business Rules:**
- Each Product+Grade+Size combination should have exactly one active Price record
- Price changes create new records (historical prices preserved in sales)
- `initial` is used for margin calculation
- `selling` is the default POS price (can be overridden per transaction)

---

### Service (`service`)

**Purpose:** Non-product services offered (e.g., cleaning, scaling, packaging, delivery).

**Why it exists:** Customers may pay for additional services beyond products. Services are tracked separately from inventory items.

**Relation to project:** Services appear in POS alongside products but don't affect inventory.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(6) | PRIMARY KEY | Service identifier |
| `name` | varchar(100) | NOT NULL | Service name (e.g., "Fish Cleaning", "Vacuum Packaging") |
| `barcode` | varchar(30) | NULL | Service barcode/SKU |
| `unit` | enum('1', '2') | DEFAULT '1' | Unit: '1'=per kg, '2'=per item/service |
| `price` | double | DEFAULT 0 | Base price |
| `disc` | double | DEFAULT 0 | Default discount |
| `image` | text | NULL | Service image URL |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |
| `deleted_at` | timestamp | NULL | Soft delete timestamp |

**Relationships:**
- `OneToMany → SellingServiceDetail` (services sold in transactions)

**Business Rules:**
- Services don't have inventory tracking
- Services can be added to any transaction
- Service pricing is flat (no grade/size variants)

---

## Inventory Management

### Stock (`stock`)

**Purpose:** Tracks inventory quantities per product, warehouse, batch, and expiration date.

**Why it exists:** Core inventory table. Every purchase, sale, transfer, and adjustment updates stock records. Enables FIFO (First In, First Out) inventory management via batch tracking.

**Relation to project:** Central to inventory operations. Stock levels determine what's available for sale. Stock movements are audited via DataChange.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(16) | PRIMARY KEY | Stock record identifier |
| `product_id` | varchar(8) | FK → Product.id, CASCADE | Product |
| `user_id` | varchar(8) | FK → User.id, SET NULL | Creator (who received/created this stock) |
| `werehouse_id` | varchar(8) | FK → Warehouse.id, SET NULL | Warehouse location (note: typo "werehouse") |
| `market_id` | varchar(8) | FK → Profile.id, SET NULL | Branch/market assignment |
| `purchase_id` | varchar(16) | FK → Purchase.id, SET NULL | Source purchase order |
| `batch` | varchar(100) | NULL | Batch/lot number for tracking |
| `barcode` | varchar(30) | NULL | Scanned barcode |
| `unit` | enum('1', '2') | DEFAULT '1' | Unit: '1'=kg, '2'=item |
| `qty` | double | DEFAULT 0 | Current quantity on hand |
| `expired_at` | timestamp | NULL | Expiration date (for perishables) |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |
| `deleted_at` | timestamp | NULL | Soft delete timestamp |

**Relationships:**
- `ManyToOne → Product` (eager loading)
- `ManyToOne → User` (eager loading)
- `ManyToOne → Warehouse` (eager loading, field: `werehouse`)
- `ManyToOne → Profile` (eager loading, field: `market`)
- `ManyToOne → Purchase` (eager loading)
- `OneToMany → SellingProductDetail` (stock consumed by sales)
- `OneToMany → Reject` (rejected stock)
- `OneToMany → StockTransfer` (source of transfers)

**Business Rules:**
- Stock is tracked per batch (enables FIFO, recall tracking)
- Expiration dates enable FEFO (First Expired, First Out) picking
- Stock is soft-deletable (adjustments preserve history)
- Each market has its own stock records
- Stock qty is updated in real-time on sales/purchases/transfers

---

### StockOpname (`stock_opname`)

**Purpose:** Header table for physical stock counts (stock takes/inventory audits).

**Why it exists:** Periodic physical counts verify system accuracy. Discrepancies between system and actual stock are recorded and adjusted via this process.

**Relation to project:** Stock opname creates adjustments when physical count differs from system count. Requires approval workflow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(16) | PRIMARY KEY | Stock opname identifier |
| `user_id` | varchar(8) | FK → User.id, SET NULL | Counter/creator |
| `market_id` | varchar(8) | FK → Profile.id, SET NULL | Branch where count occurred |
| `batch` | varchar(100) | NULL | Batch being counted (if batch-specific) |
| `status` | enum('1', '2', '3') | DEFAULT '1' | Status: '1'=draft/overview, '2'=approved, '3'=pending approval |
| `approved_at` | timestamp | NULL | Approval timestamp |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → User`
- `ManyToOne → Profile` (market)
- `OneToMany → StockOpnameDetail` (line items)

**Business Rules:**
- Status workflow: draft (1) → pending (3) → approved (2)
- Approval requires supervisor+ role
- Approved opname creates stock adjustments automatically

---

### StockOpnameDetail (`stock_opname_detail`)

**Purpose:** Line items for stock opname - records actual counted quantities per product.

**Why it exists:** Stores the granular count data. Each product counted in a stock opname creates one detail record.

**Relation to project:** Variance calculations (actual vs system) drive stock adjustments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(16) | PRIMARY KEY | |
| `stock_opname_id` | varchar(16) | FK → StockOpname.id, CASCADE | Parent opname |
| `product_id` | varchar(8) | FK → Product.id, CASCADE | Product counted |
| `current_stock` | double | DEFAULT 0 | System stock at time of count |
| `actual_stock` | double | DEFAULT 0 | Physically counted quantity |
| `missing_stock` | double | DEFAULT 0 | Variance (actual - current, negative = shortage) |
| `barcode` | varchar(30) | NULL | Scanned barcode |
| `adjustment_type` | enum('1', '2', '3', '4') | DEFAULT '1' | Reason: '1'=expired, '2'=broken/damaged, '3'=shrinkage/theft, '4'=other |
| `attachment` | varchar(200) | NULL | Photo evidence URL |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → StockOpname` (CASCADE delete)
- `ManyToOne → Product` (CASCADE delete)

**Business Rules:**
- `missing_stock` = `actual_stock` - `current_stock` (negative = loss, positive = gain)
- Adjustment type categorizes the reason for variance
- Attachments provide audit trail (photos of damaged goods, etc.)

---

### StockTransfer (`stock_transfer`)

**Purpose:** Tracks inter-warehouse/inter-branch stock transfers.

**Why it exists:** Stock moves between locations (warehouse to branch, branch to branch). This table tracks the transfer workflow, quantities, and verification.

**Relation to project:** Transfer process: create transfer → deduct source stock → receive at destination → verify quantity → adjust destination stock.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(16) | PRIMARY KEY | |
| `source_stock_id` | varchar(16) | FK → Stock.id, SET NULL | Source stock record |
| `target_market_id` | varchar(8) | FK → Profile.id, SET NULL | Destination branch |
| `product_id` | varchar(8) | FK → Product.id, SET NULL | Product being transferred |
| `created_by_id` | varchar(8) | FK → User.id, SET NULL | Transfer creator |
| `verified_by_id` | varchar(8) | FK → User.id, SET NULL | Receiver/verifier |
| `qty` | double | DEFAULT 0 | Quantity sent |
| `unit` | enum('1', '2') | DEFAULT '1' | Unit: '1'=kg, '2'=item |
| `status` | enum | DEFAULT 'SENDING' | Status: 'SENDING', 'WAITING_VERIFICATION', 'DONE', 'CANCELLED' |
| `notes` | varchar(500) | NULL | Sender notes |
| `verified_qty` | double | NULL | Quantity verified by receiver |
| `verified_notes` | varchar(500) | NULL | Receiver notes |
| `sent_at` | timestamp | NULL | Send timestamp |
| `verified_at` | timestamp | NULL | Verification timestamp |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → Stock` (source)
- `ManyToOne → Profile` (target market)
- `ManyToOne → Product`
- `ManyToOne → User` (creator)
- `ManyToOne → User` (verifier)

**Business Rules:**
- Transfer workflow:
  1. Create transfer (status: SENDING)
  2. Deduct source stock
  3. Receiver verifies (status: WAITING_VERIFICATION)
  4. Receiver confirms qty (status: DONE)
- `verified_qty` may differ from `qty` (damage, loss in transit)
- Cancellation requires admin approval

---

## Purchasing

### Purchase (`purchase`)

**Purpose:** Purchase orders to suppliers for stock replenishment.

**Why it exists:** Tracks incoming stock from suppliers. Creates stock records when goods are received.

**Relation to project:** Purchase → Stock → Sale flow. Purchases increase inventory. Purchase prices inform margin calculations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(16) | PRIMARY KEY | |
| `user_id` | varchar(8) | FK → User.id, SET NULL | Purchaser |
| `product_id` | varchar(8) | FK → Product.id, SET NULL | Product |
| `werehouse_id` | varchar(8) | FK → Warehouse.id, SET NULL | Receiving warehouse (typo: "werehouse") |
| `supplier_id` | varchar(8) | FK → Supplier.id, SET NULL | Supplier |
| `batch` | varchar(100) | NULL | Batch/lot number |
| `barcode` | varchar(30) | NULL | |
| `unit` | enum('1', '2') | DEFAULT '1' | Unit: '1'=kg, '2'=item |
| `qty` | double | DEFAULT 0 | Quantity ordered/received |
| `price` | double | DEFAULT 0 | Unit cost price |
| `expired_at` | timestamp | NULL | Expiration date |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → User` (eager)
- `ManyToOne → Product` (eager)
- `ManyToOne → Warehouse` (eager)
- `ManyToOne → Supplier` (eager)
- `OneToMany → Stock` (stock created from this purchase)

**Business Rules:**
- Purchase creates corresponding Stock record on receipt
- Batch number and expiration date tracked for food safety
- Purchase price becomes the `initial` cost in Stock

---

### Supplier (`supplier`)

**Purpose:** Supplier/vendor master data.

**Why it exists:** Tracks who the business buys from. Enables supplier performance analysis, contact management, and payment processing.

**Relation to project:** Every purchase references a supplier. Supplier data used for ordering, payments, and reporting.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(8) | PRIMARY KEY | |
| `corporation` | varchar(60) | NOT NULL | Company/legal name |
| `name` | varchar(60) | NOT NULL | Contact person name |
| `email` | varchar(150) | UNIQUE | Email address |
| `phone_number` | varchar(20) | NOT NULL | Contact phone |
| `address` | text | NULL | Address |
| `city` | varchar(20) | NULL | City |
| `pos` | varchar(10) | NULL | POS code (if applicable) |
| `bank` | varchar(20) | NULL | Bank name for payments |
| `no_rek` | varchar(20) | NULL | Bank account number |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → Purchase` (purchases from this supplier)

**Business Rules:**
- Suppliers are never soft-deleted (historical purchases must remain intact)
- Bank details used for supplier payments

---

## Sales & POS

### Selling (`selling`)

**Purpose:** Sales transaction header - captures each POS transaction.

**Why it exists:** Core transaction table. Every sale creates a Selling record with totals, payment info, and customer details.

**Relation to project:** Central to revenue tracking. Links to line items (SellingProductDetail, SellingServiceDetail), payments, and inventory reduction.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(20) | PRIMARY KEY | Transaction ID (e.g., "TRX-20250124-0001") |
| `user_id` | varchar(8) | FK → User.id, SET NULL | Cashier |
| `market_id` | varchar(8) | FK → Profile.id, SET NULL | Branch |
| `member_id` | varchar(10) | FK → Member.id, SET NULL | Customer member (if applicable) |
| `payment_method_id` | varchar(4) | FK → PeymentMethod.id, SET NULL | Payment method |
| `voucher_id` | varchar(10) | FK → Voucher.id, SET NULL | Voucher used |
| `payment_id` | varchar(200) | NULL | External payment reference (Xendit, etc.) |
| `total_weight_qty` | double | DEFAULT 0 | Total weight-based items (kg) |
| `totol_pcs_qty` | double | DEFAULT 0 | Total piece-based items (pcs) (note: typo "totol") |
| `price` | double | DEFAULT 0 | Subtotal before discounts/tax |
| `per_item_disc` | double | DEFAULT 0 | Sum of item-level discounts |
| `voucher_disc` | double | DEFAULT 0 | Voucher discount amount |
| `total_disc` | double | DEFAULT 0 | Total discount (per_item_disc + voucher_disc) |
| `tax_price` | double | DEFAULT 0 | Tax amount |
| `total_price` | double | DEFAULT 0 | Final total (price - total_disc + tax_price) |
| `payed_money` | double | DEFAULT 0 | Amount tendered |
| `change_money` | double | DEFAULT 0 | Change returned |
| `is_paid` | enum('1', '2', '3', '4') | DEFAULT '1' | Payment status: '1'=unpaid, '2'=partial, '3'=paid, '4'=void |
| `online_order` | enum('1', '2', '3') | DEFAULT '1' | Channel: '1'=in-store, '2'=online, '3'=delivery |
| `note` | text | NULL | Transaction notes |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |
| `deleted_at` | timestamp | NULL | Soft delete timestamp |

**Relationships:**
- `ManyToOne → User` (cashier)
- `ManyToOne → Profile` (market)
- `ManyToOne → Member` (customer)
- `ManyToOne → PeymentMethod` (payment method)
- `ManyToOne → Voucher` (discount voucher)
- `OneToMany → SellingProductDetail` (product line items)
- `OneToMany → SellingServiceDetail` (service line items)
- `OneToMany → CashDrawer` (cash management)

**Business Rules:**
- Transaction ID is sequential per branch
- Soft deletable (for voided transactions)
- Inventory is reduced when transaction is finalized
- Payment status tracks partial payments, unpaid tab

---

### SellingProductDetail (`selling_product_detail`)

**Purpose:** Line items for products sold in a transaction.

**Why it exists:** Captures what was sold, at what price, from which stock batch. Enables detailed sales analytics and inventory追溯 (traceability).

**Relation to project:** Each product in a cart becomes a SellingProductDetail. Reduces stock qty.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(24) | PRIMARY KEY | |
| `selling_id` | varchar(20) | FK → Selling.id, CASCADE | Parent transaction |
| `price_id` | varchar(16) | FK → Price.id, SET NULL | Price snapshot (product/grade/size) |
| `stock_id` | varchar(16) | FK → Stock.id, SET NULL | Source stock record (batch tracking) |
| `qty` | int | DEFAULT 0 | Quantity sold |
| `mod_price` | double | DEFAULT 0 | Modified price (manual override, e.g., grade 3-4 pricing) |
| `total_price` | double | DEFAULT 0 | Line total (qty × price - discount) |
| `total_weight` | double | DEFAULT 0 | Total weight (for weight-based items) |
| `note` | text | NULL | Line item note (e.g., "cut into pieces") |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → Selling` (CASCADE delete)
- `ManyToOne → Price` (SET NULL)
- `ManyToOne → Stock` (SET NULL)

**Business Rules:**
- `mod_price` allows cashier override (e.g., quick discount, grade adjustment)
- Stock is reduced by qty when transaction completes
- `stock_id` enables batch追溯 (which batch was sold)

---

### SellingServiceDetail (`selling_service_detail`)

**Purpose:** Line items for services sold in a transaction.

**Why it exists:** Services (cleaning, packaging) are sold alongside products but don't affect inventory.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(24) | PRIMARY KEY | |
| `selling_id` | varchar(20) | FK → Selling.id, CASCADE | Parent transaction |
| `service_id` | varchar(6) | FK → Service.id, SET NULL | Service |
| `qty` | int | DEFAULT 0 | Quantity |
| `mod_price` | double | DEFAULT 0 | Modified price |
| `total_price` | double | DEFAULT 0 | Line total |
| `note` | text | NULL | Service note |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → Selling` (CASCADE delete)
- `ManyToOne → Service` (SET NULL)

---

### PeymentMethod (`payment_method`)

**Purpose:** Payment method definitions (Cash, QRIS, Debit Card, etc.).

**Why it exists:** Tracks how customers pay. Enables payment method reporting and reconciliation.

**Relation to project:** Every transaction references a payment method. Used for cash drawer reconciliation, digital payment tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(4) | PRIMARY KEY | |
| `name` | varchar(30) | NOT NULL | Method name (e.g., "Cash", "QRIS", "Debit Card") |
| `icon` | varchar(100) | NOT NULL | UI icon identifier |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Note:** Table name has typo "PeymentMethod" (missing 'a')

**Example Payment Methods:**
- Cash
- QRIS (GoPay, OVO, Dana)
- Debit Card
- Credit Card
- Bank Transfer

---

### Voucher (`voucher`)

**Purpose:** Discount voucher/promo code definitions.

**Why it exists:** Enables promotional discounts with rules (minimum spend, percentage vs fixed, validity periods, usage limits).

**Relation to project:** Applied at transaction level. Voucher validation checks rules before allowing discount.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(10) | PRIMARY KEY | Voucher code (scanned/entered at POS) |
| `name` | varchar(60) | NOT NULL | Voucher display name |
| `desc` | text | NULL | Description/terms |
| `is_fix_disc` | enum('1', '2') | DEFAULT '1' | Discount type: '1'=fixed amount, '2'=percentage |
| `min_price` | double | DEFAULT 0 | Minimum transaction amount required |
| `percent_disc` | double | DEFAULT 0 | Percentage discount (if is_fix_disc='2') |
| `max_disc` | double | DEFAULT 0 | Maximum discount cap (for percentage discounts) |
| `image` | varchar(100) | NOT NULL | Voucher image/promo banner |
| `qty` | int | DEFAULT 0 | Total quota (0 = unlimited) |
| `used` | int | DEFAULT 0 | Usage count |
| `status` | enum('1', '2', '3', '4') | DEFAULT '1' | Status: '1'=active, '2'=inactive, '3'=expired, '4'=out of quota |
| `started_at` | timestamp | NOT NULL | Valid from |
| `expired_at` | timestamp | NOT NULL | Valid until |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |
| `deleted_at` | timestamp | NULL | Soft delete timestamp |

**Relationships:**
- `OneToMany → Selling` (transactions using this voucher)

**Business Rules:**
- Voucher validation checks:
  - Date range (started_at ≤ now ≤ expired_at)
  - Minimum spend (transaction total ≥ min_price)
  - Quota (used < qty, or qty=0 for unlimited)
  - Status = '1' (active)
- `used` counter increments on each transaction
- Soft deletable (for cancelled promotions)

---

### Member (`member`)

**Purpose:** Customer member database for loyalty programs.

**Why it exists:** Tracks repeat customers, enables member-only pricing, purchase history, and targeted promotions.

**Relation to project:** Members can be linked to transactions for loyalty tracking and member discounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(10) | PRIMARY KEY | Member ID |
| `name` | varchar(100) | NOT NULL | Member name |
| `email` | varchar(150) | UNIQUE | Email |
| `identity_type` | enum('1', '2', '3') | DEFAULT '1' | ID type: '1'=KTP (National ID), '2'=Passport, '3'=Other |
| `identity_number` | varchar(30) | UNIQUE | Government ID number |
| `address` | text | NULL | Address |
| `maps` | text | NULL | Maps location |
| `phone_number` | varchar(20) | NOT NULL | Phone |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |
| `deleted_at` | timestamp | NULL | Soft delete timestamp |

**Relationships:**
- `OneToMany → Selling` (member's transactions)

**Business Rules:**
- Identity number is unique (prevents duplicate memberships)
- Soft deletable (GDPR compliance - can anonymize)
- Member lookup by phone number at POS

---

### CartItem (`cart_item`)

**Purpose:** Temporary shopping cart storage (for POS session).

**Why it exists:** Holds items being added to a transaction before checkout. Enables cart persistence across page refreshes.

**Relation to project:** Cart is cleared when transaction completes. Used during POS checkout flow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | |
| `price_id` | varchar(16) | FK → Price.id, CASCADE | Product variant |
| `weight_scale_id` | int | FK → WeightScale.id, CASCADE | Scale used (for weight-based items) |
| `qty` | double | DEFAULT 0 | Quantity |
| `expired_at` | timestamp | NULL | Cart expiration |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → Price` (CASCADE delete)
- `ManyToOne → WeightScale` (CASCADE delete)

**Business Rules:**
- Cart is temporary - cleared on transaction completion or timeout
- Weight scale integration captures real-time weight

---

### CashDrawer (`cash_drawer`)

**Purpose:** Cash drawer session tracking for POS terminals.

**Why it exists:** Tracks when cash drawer is opened/closed. Enables cash reconciliation and shift reporting.

**Relation to project:** Each transaction may open the cash drawer. End-of-shift reports use cash drawer data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | |
| `selling_id` | varchar(20) | FK → Selling.id, SET NULL | Linked transaction |
| `is_open` | enum('1', '2') | DEFAULT '1' | Status: '1'=open, '2'=closed |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → Selling` (SET NULL)

**Business Rules:**
- Cash drawer opens on cash transactions
- Drawer state tracked per shift
- End-of-shift reconciliation compares expected vs actual cash

---

## Quality Control

### Reject (`reject`)

**Purpose:** Records damaged/expired/unsellable stock.

**Why it exists:** Tracks inventory loss due to spoilage, damage, or quality issues. Requires approval workflow for accountability.

**Relation to project:** Rejected stock is removed from available inventory. Rejection analytics inform supplier quality, storage practices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(16) | PRIMARY KEY | |
| `user_id` | varchar(8) | FK → User.id, SET NULL | Reporter |
| `approved_by_id` | varchar(8) | FK → User.id, SET NULL | Approver (supervisor+) |
| `stock_id` | varchar(16) | FK → Stock.id, CASCADE | Source stock |
| `barcode` | varchar(30) | NULL | |
| `status` | enum('1', '2', '3', '4') | DEFAULT '1' | Reason: '1'=expired, '2'=broken/damaged, '3'=quality issue, '4'=other |
| `unit` | enum('1', '2') | DEFAULT '1' | Unit: '1'=kg, '2'=item |
| `qty` | double | DEFAULT 0 | Rejected quantity |
| `desc` | text | NULL | Detailed description |
| `approval_status` | enum | DEFAULT 'APPROVED' | Status: 'PENDING', 'APPROVED', 'REJECTED' |
| `image_proof` | text | NULL | Photo evidence (JSON array) |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → User` (reporter)
- `ManyToOne → User` (approver)
- `ManyToOne → Stock` (CASCADE delete)

**Business Rules:**
- Approval workflow: PENDING → APPROVED/REJECTED
- Approved rejection reduces stock qty
- Photo evidence required for audit
- Rejection analytics track shrinkage rates

---

## Data Synchronization

### DataChange (`data_change`)

**Purpose:** Outgoing sync queue - tracks data changes that need to be synced to other branches/central server.

**Why it exists:** Multi-branch architecture requires data synchronization. When data changes at one branch, other branches need to know. This table queues changes for sync.

**Relation to project:** Every INSERT/UPDATE/DELETE on tracked tables creates a DataChange record. Sync job processes pending records and pushes to other branches.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | |
| `branch_id` | varchar(30) | NULL | Profile.id of source branch |
| `table_name` | varchar(30) | NOT NULL | Affected table name |
| `pk_id` | varchar(30) | NULL | Primary key of changed record |
| `action` | enum | NOT NULL | Action type: 'INSERT', 'UPDATE', 'DELETE', 'SOFDEL' (soft delete), 'EDIT' |
| `attachment` | json | NULL | Additional context data |
| `sync_status` | enum | DEFAULT 'PENDING' | Status: 'PENDING', 'SENDING', 'SUCCESS', 'FAILED' |
| `payload` | json | NULL | Full change data (before/after) |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → Failed_job` (if sync fails)

**Business Rules:**
- Database triggers or application hooks create DataChange records
- Sync job runs periodically, processes PENDING records
- Failed syncs retry with exponential backoff
- After N failures, record moves to manual review

---

### DataReceive (`data_receive`)

**Purpose:** Incoming sync log - tracks data received from other branches/central server.

**Why it exists:** When this branch receives sync data from elsewhere, it's logged here for audit and conflict resolution.

**Relation to project:** Complements DataChange. DataChange = outgoing, DataReceive = incoming.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | |
| `branch_id` | varchar(30) | NULL | Source branch Profile.id |
| `table_name` | varchar(30) | NOT NULL | Table name |
| `pk_id` | varchar(30) | NULL | Record ID |
| `action` | enum | NOT NULL | Action: 'INSERT', 'UPDATE', 'DELETE', 'SOFDEL', 'EDIT' |
| `attachment` | json | NULL | |
| `sync_status` | enum | DEFAULT 'SUCCESS' | Status: 'SUCCESS', 'FAILED' |
| `payload` | json | NULL | Received data |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Business Rules:**
- Incoming sync applied to local database
- Conflicts (same record changed locally and remotely) flagged for manual resolution
- SUCCESS status = change applied, FAILED = conflict/error

---

### SyncExport (`sync_export`)

**Purpose:** Bulk data export job tracking.

**Why it exists:** Periodic full/partial data exports for backup, analytics, or inter-branch sync. Tracks export progress and errors.

**Relation to project:** Large data exports (e.g., "export all sales from last month") run asynchronously. This table tracks job status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | |
| `file_name` | varchar(200) | NOT NULL | Export file name |
| `type_job` | varchar(200) | NOT NULL | Export type/table |
| `processed_row` | int | DEFAULT 0 | Rows processed so far |
| `total_row` | int | DEFAULT 0 | Total rows to export |
| `failed_row` | int | DEFAULT 0 | Failed rows |
| `from_row` | timestamp | | Start date range |
| `to_row` | timestamp | | End date range |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → Failed_job` (export errors)

---

### SyncImport (`sync_import`)

**Purpose:** Bulk data import job tracking.

**Why it exists:** Imports initial data, recovery backups, or data from other branches. Tracks import progress and errors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | |
| `file_name` | varchar(200) | NOT NULL | Import file name |
| `type_job` | varchar(200) | NOT NULL | Import type/table |
| `processed_row` | int | DEFAULT 0 | Rows processed |
| `total_row` | int | DEFAULT 0 | Total rows |
| `failed_row` | int | DEFAULT 0 | Failed rows |
| `from_row` | timestamp | | |
| `to_row` | timestamp | | |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → Failed_job` (import errors)

---

### Failed_job (`failed_job`)

**Purpose:** Error log for failed sync export/import jobs.

**Why it exists:** When sync jobs fail, errors are logged here for debugging and manual resolution.

**Relation to project:** Failed jobs require manual intervention. Admin reviews error, fixes data, retries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | |
| `sync_export_id` | int | FK → SyncExport.id, SET NULL | Failed export job |
| `sync_import_id` | int | FK → SyncImport.id, SET NULL | Failed import job |
| `validation_error` | text | NOT NULL | Error message |
| `row_error` | int | DEFAULT 0 | Row number that failed |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → SyncExport` (SET NULL)
- `ManyToOne → SyncImport` (SET NULL)

---

## System Configuration

### Config (`config`)

**Purpose:** Application configuration settings per branch.

**Why it exists:** Different branches may have different settings (tax rates, receipt formats, integration credentials). Centralizes configuration management.

**Relation to project:** App reads Config at startup/runtime. Changes apply per branch.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | |
| `cat_app_id` | varchar(4) | FK → CatApp.id, SET NULL | Configuration category |
| `profile_id` | varchar(8) | FK → Profile.id, CASCADE | Branch this config applies to |
| `server` | text | | Server URL/endpoint |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → CatApp` (category)
- `ManyToOne → Profile` (CASCADE delete)

**Example Configurations:**
- Tax rate per branch
- Receipt header/footer text
- Xendit API credentials per branch
- Integration settings (delivery partners, etc.)

---

### CatApp (`cat_app`)

**Purpose:** Configuration categories.

**Why it exists:** Groups related settings together (e.g., "Payment", "Tax", "Receipt", "Integration").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(4) | PRIMARY KEY | |
| `name` | varchar(30) | NOT NULL | Category name |
| `data_watch` | json | NOT NULL | Watched data configuration (which tables trigger sync) |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `OneToMany → Config`

---

### Notification (`notification`)

**Purpose:** System notifications to users/branches.

**Why it exists:** Alerts users about important events (low stock, pending approvals, system updates).

**Relation to project:** Notifications appear in UI notification center. Marked as read when acknowledged.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | varchar(8) | PRIMARY KEY | |
| `profile_id` | varchar(8) | FK → Profile.id, SET NULL | Target branch |
| `type` | enum('1', '2', '3') | DEFAULT '1' | Type: '1'=info, '2'=success, '3'=warning |
| `message` | text | NULL | Notification message |
| `read_at` | timestamp | NULL | Read timestamp |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Relationships:**
- `ManyToOne → Profile` (SET NULL)

**Notification Triggers:**
- Low stock alerts
- Pending approval requests (stock opname, rejects)
- Sync failures
- System maintenance announcements

---

### WeightScale (`weight_scale`)

**Purpose:** Hardware integration - electronic weight scales connected to POS terminals.

**Why it exists:** POS integrates with physical weight scales via Web Serial API. Scale data captured directly into transactions (no manual entry).

**Relation to project:** CartItem references WeightScale. Scale provides real-time weight for pricing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | |
| `name` | varchar(30) | NOT NULL | Scale name/identifier |
| `status` | enum('1', '2', '3') | DEFAULT '1' | Status: '1'=connected, '2'=disconnected, '3'=inactive |
| `mac_ip` | varchar(30) | NULL | MAC address or IP (for network scales) |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() ON UPDATE | |

**Business Rules:**
- Scale status updated on connect/disconnect
- Multiple scales can be registered per branch
- Scale calibration data stored in Config

---

## Entity Relationship Diagrams

### Authentication & Authorization
```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │──────▶│    Role     │──────▶│  HasPermit  │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                         │
       │                                         ▼
       │                                  ┌─────────────┐
       └─────────────────────────────────▶│  Permission │
                                          └─────────────┘
```

### Product & Pricing Hierarchy
```
┌─────────────┐
│   Product   │──────┐
└─────────────┘      │
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│  Category   │  │    Price    │
└─────────────┘  └─────────────┘
                      │  │  │
                      │  │  └──────▶ Size
                      │  │
                      │  └─────────▶ Grade
                      │
                      └────────────▶ Product
```

### Inventory Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Supplier   │────▶│   Purchase  │────▶│    Stock    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
              ▼                               ▼                               ▼
     ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
     │  StockOpname    │            │ StockTransfer   │            │     Reject      │
     │    (Detail)     │            │                 │            │                 │
     └─────────────────┘            └─────────────────┘            └─────────────────┘
```

### Sales Transaction
```
┌─────────────┐     ┌─────────────┐
│   Member    │     │    User     │
└─────────────┘     └─────────────┘
       │                   │
       └───────┐      ┌────┘
               ▼      ▼
         ┌──────────────┐
         │   Selling    │
         └──────────────┘
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│SellingProductDtl │  │SellingServiceDtl │
└──────────────────┘  └──────────────────┘
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│    Price    │         │   Service   │
└─────────────┘         └─────────────┘
```

### Multi-Branch Synchronization
```
┌─────────────┐
│   Profile   │ (Branch A)
└─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DataChange │────▶│  SyncExport │────▶│  Failed_job │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐
│ DataReceive │◀────│  SyncImport │
└─────────────┘     └─────────────┘
```

---

## Key Patterns & Conventions

### Soft Deletes
The following tables use soft deletes (`deleted_at` column):
- User, Profile, Product, Member, Selling, Warehouse, Service, Voucher, Stock, Reject

**Implication:** Always filter by `deleted_at IS NULL` in queries unless explicitly including deleted records.

### Timestamps
All tables have:
- `created_at`: Record creation timestamp (auto-set on INSERT)
- `updated_at`: Last modification timestamp (auto-updated on UPDATE)

### Enum Conventions

**Unit of Measure:**
- `'1'` = kilogram (weight-based)
- `'2'` = item/piece (count-based)

**Status Patterns:**
- `'1'` = Active/Default/Ready
- `'2'` = Inactive/Pending/Pre-order
- `'3'` = Higher state (expired, approved, etc.)
- `'4'` = Terminal state (void, out of quota, etc.)

**Always check enum values in entity files - meanings are context-specific.**

### Known Typos (Preserved for Consistency)
- `werehouse` instead of `warehouse` (in Stock, Purchase entities)
- `PeymentMethod` instead of `PaymentMethod` (table name)
- `totol_pcs_qty` instead of `total_pcs_qty` (in Selling)

**Do not fix these without a full migration - they are baked into the codebase.**

### Multi-Tenancy Pattern
Most transactional entities include `market_id` (Profile reference):
- Stock, Selling, Purchase, StockOpname, User, Notification, Config

**Purpose:** Data isolation per branch. Queries should filter by `market_id` for branch-specific views.

### Batch Tracking
Stock, Purchase, and StockOpname use `batch` column:
- Enables FIFO (First In, First Out) inventory
- Supports product recalls (trace affected batches)
- Tracks expiration dates per batch

### Data Sync Pattern
- **Outgoing:** DataChange → SyncExport → (network) → SyncImport → DataReceive
- **Incoming:** DataReceive logs applied changes
- **Failures:** Failed_job captures errors for manual resolution

### Permission Checking
Controllers check permissions before actions:
```javascript
// Example pattern
if (!user.hasPermission('selling.create')) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### Eager Loading
TypeORM entities specify eager loading for frequently-accessed relations:
- Stock → Product, User, Warehouse, Profile, Purchase
- Purchase → User, Product, Warehouse, Supplier
- Product → Category

**Implication:** These relations are auto-loaded. Avoid N+1 queries for these fields.

---

## Appendix: Table Index by Domain

| Domain | Tables |
|--------|--------|
| **Auth** | User, Role, Permission, HasPermit, Session |
| **Org** | Profile, Warehouse |
| **Product** | Product, Category, Grade, Size, Price, Service |
| **Inventory** | Stock, StockOpname, StockOpnameDetail, StockTransfer |
| **Purchase** | Purchase, Supplier |
| **Sales** | Selling, SellingProductDetail, SellingServiceDetail, PeymentMethod, Voucher, Member, CartItem, CashDrawer |
| **Quality** | Reject |
| **Sync** | DataChange, DataReceive, SyncExport, SyncImport, Failed_job |
| **Config** | Config, CatApp, Notification, WeightScale |

**Total Tables: 37**
