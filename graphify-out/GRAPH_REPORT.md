# Graph Report - .  (2026-06-20)

## Corpus Check
- 95 files · ~108,925 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 927 nodes · 883 edges · 87 communities (66 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Agent Orchestration System|Agent Orchestration System]]
- [[_COMMUNITY_Backend Engineer Agent|Backend Engineer Agent]]
- [[_COMMUNITY_Agent Task Runner|Agent Task Runner]]
- [[_COMMUNITY_API Docs Engineer Agent|API Docs Engineer Agent]]
- [[_COMMUNITY_Stock Management Feature|Stock Management Feature]]
- [[_COMMUNITY_E2E Testing Infrastructure|E2E Testing Infrastructure]]
- [[_COMMUNITY_Frontend Documentation|Frontend Documentation]]
- [[_COMMUNITY_Graphify Knowledge Graph|Graphify Knowledge Graph]]
- [[_COMMUNITY_Serial API  Weight Scale|Serial API / Weight Scale]]
- [[_COMMUNITY_Permissions & RBAC|Permissions & RBAC]]
- [[_COMMUNITY_Frontend Components|Frontend Components]]
- [[_COMMUNITY_ST-04 RBAC Visibility Task|ST-04 RBAC Visibility Task]]
- [[_COMMUNITY_Supervisor Stock UI|Supervisor Stock UI]]
- [[_COMMUNITY_ST-01 Gudang Outlet CRUD|ST-01 Gudang Outlet CRUD]]
- [[_COMMUNITY_ST-02 Supplier Receiving|ST-02 Supplier Receiving]]
- [[_COMMUNITY_ST-03 Stock Transfer|ST-03 Stock Transfer]]
- [[_COMMUNITY_Database Schema & Sync|Database Schema & Sync]]
- [[_COMMUNITY_Task Templates|Task Templates]]
- [[_COMMUNITY_POS Core Features|POS Core Features]]
- [[_COMMUNITY_Implementation Status|Implementation Status]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]

## God Nodes (most connected - your core abstractions)
1. `LofishMart Database Schema Specification` - 15 edges
2. `Agent: API Docs Engineer (Scalar / OpenAPI)` - 14 edges
3. `Micro-Task ST-04: Role-Based Access & Per-Location Inventory Views` - 13 edges
4. `Micro-Task ST-01: Gudang & Outlet CRUD` - 12 edges
5. `Micro-Task ST-02: Supplier → Gudang Stock Receiving` - 12 edges
6. `Micro-Task ST-03: Gudang → Outlet Stock Transfer (3-Status Flow)` - 12 edges
7. `Lofish Mart - Dokumentasi Project` - 12 edges
8. `compilerOptions` - 11 edges
9. `Task Template` - 11 edges
10. `Task: Stock Management System — Full Flow (Master Task)` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Auth Setup` --references--> `Admin Auth State`  [EXTRACTED]
  e2e/tests/auth.setup.ts → e2e/playwright/.auth/admin.json
- `Auth Setup` --references--> `Gudang Auth State`  [EXTRACTED]
  e2e/tests/auth.setup.ts → e2e/playwright/.auth/gudang.json
- `Auth Setup` --references--> `Kasir Auth State`  [EXTRACTED]
  e2e/tests/auth.setup.ts → e2e/playwright/.auth/kasir.json
- `Stock Management System Full Flow` --references--> `ST-02: Supplier to Gudang Stock Receiving`  [EXTRACTED]
  .agents/tasks/active/2026-04-30-stock-management-full-flow.md → .agents/tasks/active/2026-04-30-ST-02-supplier-receive.md
- `Stock Management System Full Flow` --references--> `ST-03: Gudang to Outlet Stock Transfer`  [EXTRACTED]
  .agents/tasks/active/2026-04-30-stock-management-full-flow.md → .agents/tasks/active/2026-04-30-ST-03-stock-transfer.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Role-Based E2E Test Suite** — e2e_playwright_config, e2e_auth_setup, e2e_dashboard_admin, e2e_management_admin, e2e_pos_kasir, e2e_products_admin, e2e_stock_gudang [EXTRACTED 1.00]
- **Stock Management Micro-Tasks** — stock_management_full_flow, st_02_supplier_receive, st_03_stock_transfer, st_04_rbac_visibility [EXTRACTED 1.00]
- **Agent Workflows** — workflows_bug_fix, workflows_code_review, workflows_db_migration, workflows_new_feature [EXTRACTED 1.00]
- **Stock Management Domain Concepts** — concept_gudang, concept_outlet, concept_stock_transfer_flow, concept_rbac_visibility, concept_profile_table [INFERRED 0.85]
- **Lofish Mart POS Core Features** — concept_lofish_mart, concept_tanstack_router, concept_file_based_routing, concept_api_client, concept_web_serial_api, concept_qris_payment, concept_voucher_system, concept_dual_sidebar, concept_state_management [EXTRACTED 1.00]
- **E2E Cash Payment Test Failure Analysis** — e2e_cash_payment_test, e2e_playwright_report_2c5c64, e2e_error_context_594f7, rationale_e2e_failure [EXTRACTED 1.00]

## Communities (87 total, 21 thin omitted)

### Community 0 - "Agent Orchestration System"
Cohesion: 0.04
Nodes (42): graphify, Common Bug Patterns in This Project, Execution Steps, Step 1 — Investigate, Step 2 — Fix, Step 3 — Verify Fix, Step 4 — Review, Step 5 — Close (+34 more)

### Community 1 - "Backend Engineer Agent"
Cohesion: 0.04
Nodes (41): Agent: Backend Engineer, Checklist Before Completing, File Templates, Mandatory Reading (Before Acting), Mounting in app.js, New Controller, New Route File, Responsibilities (+33 more)

### Community 2 - "Agent Task Runner"
Cohesion: 0.06
Nodes (34): 1. Starting a new task, 2. Running an agent, 3. Running a workflow, 🧠 Agent Role Summary, 🤖 AI Agent Orchestration — Lofish Mart, 🛠️ Best Practices, Common Issues, Example Task File: `tasks/active/2026-05-01-user-auth.md` (+26 more)

### Community 3 - "API Docs Engineer Agent"
Cohesion: 0.06
Nodes (33): Adding a new endpoint, Agent: API Docs Engineer (Scalar / OpenAPI), 🔧 Bundling & Validation, Current: Monolithic file, File Rules (Split Structure), GET with query parameters, How Scalar Works in This Project, 💬 How to Give This Agent a Task (+25 more)

### Community 4 - "Stock Management Feature"
Cohesion: 0.06
Nodes (30): 1. Pendahuluan, 2. Kondisi Sistem Saat Ini (Sebelum Implementasi), 3. Alur Transfer Stok Baru (User Flow), 6. Penempatan Supervisor per Outlet, 7. Cetak Fingerprint (Laporan Transfer), 8. Skenario Pengujian (Verification Plan), 9. Daftar File yang Diubah / Dibuat, A. Backend — Database Layer (+22 more)

### Community 5 - "E2E Testing Infrastructure"
Cohesion: 0.06
Nodes (30): author, dependencies, acorn, acorn-walk, arg, create-require, diff, make-error (+22 more)

### Community 6 - "Frontend Documentation"
Cohesion: 0.07
Nodes (29): 1. Entry Point (`main.tsx`), 2. Routing (`App.tsx`), 3. POS Flow Diagram, 4. State Management Flow, 5. Component Communication, Alur Aplikasi, Available Scripts, Catatan Pengembangan (+21 more)

### Community 7 - "Graphify Knowledge Graph"
Cohesion: 0.07
Nodes (27): Graphify Extraction Spec, Graphify Query Reference, For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules (+19 more)

### Community 8 - "Serial API / Weight Scale"
Cohesion: 0.08
Nodes (24): 1. Backend REST API — Weight Scale CRUD, 2. Web Serial API (Client-Side) — Real-time Scale Reading, 3. Bidirectional Communication — Mengirim Data ke Perangkat Serial, Alur Pembacaan & Respon Harga, Alur Pengiriman Data, Catatan, Catatan Pengiriman, Contoh Pemanggilan (+16 more)

### Community 9 - "Permissions & RBAC"
Cohesion: 0.08
Nodes (23): Admin (`ADMN`), All Permissions, Auth (no permission required), Feature Module (`/feature`), Fresh Install Checklist, Gudang (`GDNG`), How Permissions Work, How to Assign Permissions to a Role (+15 more)

### Community 10 - "Frontend Components"
Cohesion: 0.10
Nodes (22): `Brand.tsx`, `CartSidebar.tsx`, Detail Struktur Folder, File Utama:, `index.ts`, `LoadingButton.tsx`, `LoginPage.tsx`, `PaymentModal.tsx` (+14 more)

### Community 11 - "ST-04 RBAC Visibility Task"
Cohesion: 0.10
Nodes (20): Acceptance Criteria, Agent Assignments, Completion Summary, Depends On, Goal, Implementation Log, In Scope, Mandatory Reading (Before Starting) (+12 more)

### Community 12 - "Supervisor Stock UI"
Cohesion: 0.10
Nodes (20): 1. Database Fix (Already Applied), 2. New Dedicated Supervisor Stock View, 3. Route Update, Additional Features to Consider, API Flow, Common Issues, Files Changed/Created, Next Steps (+12 more)

### Community 13 - "ST-01 Gudang Outlet CRUD"
Cohesion: 0.10
Nodes (19): Acceptance Criteria, Agent Assignments, Completion Summary, Goal, Implementation Log, In Scope, Micro-Task ST-01: Gudang & Outlet CRUD, Out of Scope (+11 more)

### Community 14 - "ST-02 Supplier Receiving"
Cohesion: 0.10
Nodes (19): Acceptance Criteria, Agent Assignments, Completion Summary, Depends On, Goal, Implementation Log, In Scope, Mandatory Reading (Before Starting) (+11 more)

### Community 15 - "ST-03 Stock Transfer"
Cohesion: 0.10
Nodes (19): Acceptance Criteria, Agent Assignments, Completion Summary, Depends On, Goal, Implementation Log, In Scope, Mandatory Reading (Before Starting) (+11 more)

### Community 16 - "Database Schema & Sync"
Cohesion: 0.13
Nodes (19): Blind Receiving, Data Synchronization, Database Schema, Project Specification, Serial API Spec, Transaction Flow, Stock Management, Stock Opname (+11 more)

### Community 17 - "Task Templates"
Cohesion: 0.11
Nodes (18): Acceptance Criteria, Agent Assignments, Completion Summary, Created, Goal, Implementation Log, In Scope, Out of Scope (+10 more)

### Community 18 - "POS Core Features"
Cohesion: 0.12
Nodes (18): Centralized API Client, Dual Sidebar Layout, File-Based Routing, Lofish Mart POS System, Xendit/QRIS Digital Payment, Hybrid State Management, TanStack Router v1, Voucher Discount System (+10 more)

### Community 19 - "Implementation Status"
Cohesion: 0.12
Nodes (16): Auth (`/`), 🔧 Backend API Routes, 📦 Database Entities (35 total), Feature (`/feature`), 🗺️ Flow Summary, 🖥️ Frontend Pages (TanStack Router), 🌐 Frontend Services (API Integration), 🚧 Gaps / Not Yet Implemented (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (16): 1. Executive Summary, 2. Tech Stack & Dependencies, 3.1 File-Based Routing System, 3.2 State Management, 3.3 Centralized API Client, 3. Application Architecture & Patterns, 4. Directory Structure, 5. Core Features & Complex Domains (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (15): API Calls, Backend Conventions (`lofishmart-backend/`), Coding Conventions, Commit / Naming Conventions, Component Pattern, Controllers, Database / Migrations, File Naming (+7 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (15): 1. Project Overview, 2. Getting Started, 3. Development Conventions, API Communication, Available Scripts, Code Structure, Core Technologies, GEMINI.md: Project Context for Lofish Mart Admin Dashboard (+7 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (15): Current State Analysis, Design System Context, Files to Modify, Footer, Implementation Approach, Modernization Goals, No Breaking Changes, Plan: Modernize ItemModal Layout in kelolagudang/receive (+7 more)

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (14): Role-Based Access Control, Agent Behavior, 🟡 ALWAYS DO, Backend, Before Adding a New Route, Before Any Schema Work, Before Modifying Permissions / Roles, Database (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Created, Final Review, Goal, In Scope, Key Context References, Micro-Task Breakdown, Out of Scope (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.19
Nodes (13): Admin Auth State, Gudang Auth State, Kasir Auth State, Auth Setup, Dashboard Admin Spec, Admin Management Spec, POS Kasir Spec, Products Admin Spec (+5 more)

### Community 27 - "Community 27"
Cohesion: 0.23
Nodes (13): Gudang (Warehouse), Outlet, Profile Table (GUDANG/OUTLET types), Role-Based Access Control Visibility, stock-edit Permission, 3-Status Stock Transfer Flow, stock-transfer Permissions, 3-Status Transfer Prevents Fraud (+5 more)

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, skipLibCheck, sourceMap (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (11): Agent: Orchestrator, Decision Table: Which Agent to Use?, Mandatory Reading (Before Acting), Orchestration Protocol, Orchestrator Output Format, Role, Step 1 — Understand, Step 2 — Plan (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (11): 1. Authentication (AuthN), 2. Authorization (AuthZ) - Centralized RBAC, 3. Komponen Utama & File Terkait, 4. Hasil Audit & Status Akhir, A. Centralized Layout Guards, A. Login Flow, Analisis Flow Authentication dan Authorization (Frontend), B. Mekanisme Redirect (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.18
Nodes (11): 1. Executive Summary, 2. System Architecture Overview, 3. Frontend Architecture (`lofishmart-frontend`), 4. Backend Architecture (`lofishmart-backend`), 5. Deployment & Infrastructure, Core Domains & Data Model (35 Entities), Design Pattern, Lofish Mart - Project Specification (+3 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (11): Express.js, MySQL, React, TypeORM, Backend (`lofishmart-backend/`), Database, Frontend (`lofishmart-frontend/`), Infrastructure (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (10): Agent: Reviewer, Backend Code Review, Database Review, Frontend Code Review, General, Mandatory Reading (Before Acting), Review Checklist, Review Output Format (+2 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (10): Acceptance Criteria Verification Protocol, Agent: Tester, Backend Test Pattern, Checklist Before Completing, Frontend Test Pattern, Mandatory Reading (Before Acting), Responsibilities, Role (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (11): Authentication & Authorization, Entity Relationship Diagrams, HasPermit (`has_permit`), Inventory Flow, Multi-Branch Synchronization, Permission (`permission`), Product & Pricing Hierarchy, Role (`role`) (+3 more)

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (10): 1. Typography, 2. Color Palette, 3. Shapes & Radii, 4. UI Elements & Details, 5. Implementation Notes for AI / Code Generation, Background / Surface Colors, Brand Colors, Lofishmart Design System (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.20
Nodes (9): Appendix: Table Index by Domain, LofishMart Database Schema Specification, Organization & Branches, Profile (`profile`), Quality Control, Reject (`reject`), Schema Overview, Table of Contents (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.20
Nodes (10): Batch Tracking, Data Sync Pattern, Eager Loading, Enum Conventions, Key Patterns & Conventions, Known Typos (Preserved for Consistency), Multi-Tenancy Pattern, Permission Checking (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.20
Nodes (5): reset-and-dev.sh script, reset-and-prod.sh script, reset-db.sh script, start-dev.sh script, start-prod.sh script

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (9): CartItem (`cart_item`), CashDrawer (`cash_drawer`), Member (`member`), PeymentMethod (`payment_method`), Sales & POS, Selling (`selling`), SellingProductDetail (`selling_product_detail`), SellingServiceDetail (`selling_service_detail`) (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (8): 1. Principles, 2. Infrastructure (NTP), 3. Database (MySQL / TypeORM), 4. API (Interface), 5. Frontend (React / Client), Example, Meta, Timezone Management Best Practices

### Community 42 - "Community 42"
Cohesion: 0.25
Nodes (7): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (6): 1. Sidebar Kiri (Navigasi Utama), 2. Area Tengah (Workspace Utama), 3. Sidebar Kanan (Expandable Sidebar), A. Header, Application Layout Structure, B. Konten (Kontainer Data)

### Community 44 - "Community 44"
Cohesion: 0.29
Nodes (7): Category (`category`), Grade (`grade`), Price (`price`), Product Catalog, Product (`product`), Service (`service`), Size (`size`)

### Community 45 - "Community 45"
Cohesion: 0.29
Nodes (6): Delivery Module, LofishMart — Later / Deferred Features, Rough scope when ready, What was requested, When to revisit, Why it's deferred

### Community 46 - "Community 46"
Cohesion: 0.43
Nodes (7): Authentication, Authorization, Auth Flow, Permissions, Permissions, Role-Based Access Control, Roles

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (6): Data Synchronization, DataChange (`data_change`), DataReceive (`data_receive`), Failed_job (`failed_job`), SyncExport (`sync_export`), SyncImport (`sync_import`)

### Community 48 - "Community 48"
Cohesion: 0.40
Nodes (5): CatApp (`cat_app`), Config (`config`), Notification (`notification`), System Configuration, WeightScale (`weight_scale`)

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (5): Inventory Management, Stock (`stock`), StockOpname (`stock_opname`), StockOpnameDetail (`stock_opname_detail`), StockTransfer (`stock_transfer`)

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (4): devDependencies, eslint, @playwright/test, @types/node

### Community 51 - "Community 51"
Cohesion: 0.83
Nodes (3): run-tests.sh script, print_banner(), print_result()

### Community 52 - "Community 52"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 53 - "Community 53"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 54 - "Community 54"
Cohesion: 0.50
Nodes (3): For /graphify explain, For /graphify path, graphify reference: query, path, explain

### Community 55 - "Community 55"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (3): Purchase (`purchase`), Purchasing, Supplier (`supplier`)

## Knowledge Gaps
- **616 isolated node(s):** `@kilocode/plugin`, `name`, `version`, `description`, `main` (+611 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🤖 AI Agent Orchestration — Lofish Mart` connect `Agent Task Runner` to `Backend Engineer Agent`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `Workflow: New Full-Stack Feature` connect `Agent Orchestration System` to `Community 22`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `@kilocode/plugin`, `name`, `version` to the rest of the system?**
  _616 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Agent Orchestration System` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `Backend Engineer Agent` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Agent Task Runner` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `API Docs Engineer Agent` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._