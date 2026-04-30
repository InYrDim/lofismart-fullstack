# Lofish Mart - Project Specification

## 1. Executive Summary
**Lofish Mart** is a modern Point of Sale (POS), inventory management, and admin dashboard system specifically designed for fish and seafood retail. The system handles end-to-end retail operations including product tracking, variable pricing based on size and grading, transactions, user/role management, and integration with physical hardware (like weight scales).

The system uses a decoupled architecture with a React-based Single Page Application (SPA) on the frontend and a Node.js RESTful API on the backend.

---

## 2. System Architecture Overview

The system operates on a client-server architecture:
- **Frontend Client**: Built with React, TypeScript, and Vite, served via Nginx in production.
- **Backend API**: Monolithic Node.js Express server handling business logic, database operations, and authentication.
- **Database**: Relational database (MySQL 8+) managed through TypeORM.
- **Hardware Integrations**: Uses Web Serial API on the frontend to communicate with physical devices (e.g., electronic weight scales).
- **External Integrations**: Xendit for digital payment processing (QRIS, etc.) via webhooks.

---

## 3. Frontend Architecture (`lofishmart-frontend`)

### Tech Stack
- **Framework**: React 19, TypeScript 5.9
- **Build Tool**: Vite (using Rolldown for optimal performance)
- **Routing**: TanStack Router v1 (File-based routing)
- **Styling**: Tailwind CSS v4, `shadcn/ui` (Radix UI, Lucide React)
- **State/Forms**: React Hooks, Context API, TanStack React Form with Zod validation.

### State Management & Data Flow
- **Local/Component State**: Managed via standard `useState` and `useReducer`.
- **Complex Logic**: Encapsulated in custom hooks (e.g., `useCart` manages cart state, variant pricing, size/grade rules, and voucher application).
- **Context API**: Used for global app states:
  - `AuthProvider`: Manages JWT tokens and session data.
  - `PaymentProvider`: Manages the state of checkout and payment modals.
  - `SerialProvider`: Manages communication with physical weight scales using the Web Serial API (connecting, reading baud rates, interpreting weight data).
- **API Client**: A centralized singleton `ApiClient` (`src/utils/api.ts`) handles base URLs, interceptors, auth token injection, and global error handling.

### Routing & Modules
The application uses a file-based routing system (`src/routes`) mapped to a generated `routeTree.gen.ts`:
- **`/_guest`**: Public routes (e.g., Login).
- **`/_protected`**: Authenticated routes. Key modules include:
  - **POS (`pos`)**: The core Point of Sale interface with dual sidebars, real-time cart subtotal, and dynamic hardware integration.
  - **Dashboard (`dashboard`)**: Analytics and overview.
  - **Products (`products`, `product-attributes`)**: Management of items, categories, grades, sizes, and stock.
  - **Transactions (`transactions`)**: History of sales and purchases.
  - **Markets/Settings**: Configuration for the physical store locations and system preferences.

---

## 4. Backend Architecture (`lofishmart-backend`)

### Tech Stack
- **Runtime & Framework**: Node.js 18+, Express.js 4.x
- **Database ORM**: TypeORM 0.3
- **Database Engine**: MySQL 8+
- **Security**: JWT for Authentication, Bcrypt for password hashing.
- **Documentation**: Swagger/OpenAPI (`openapi.yaml`).

### Design Pattern
The backend uses a standard **MVC-like Controller pattern** (CommonJS), specifically utilizing "Fat Controllers" that interact directly with TypeORM repositories. 
- Controllers (e.g., `productController.js`, `transactionController.js`) handle request parsing, business logic, and database operations simultaneously.
- Middleware handles cross-cutting concerns (JWT verification, role authorization, data change logging for audit trails, file uploads via Multer).

### Core Domains & Data Model (35 Entities)

1. **User & Access Management**
   - Entities: `User`, `Role`, `Permission`, `HasPermit`, `Session`, `Member`, `Supplier`
   - Handles multi-tier access control and session tracking.

2. **Product & Inventory**
   - Entities: `Product`, `Category`, `Grade`, `Size`, `Price`, `Stock`, `StockOpname`, `Service`, `Reject`
   - Uses a complex pricing and variant model where price depends on combining `Product`, `Grade`, and `Size`. 

3. **Transactions & Sales**
   - Entities: `Selling`, `SellingProductDetail`, `Purchase`, `CartItem`, `PaymentMethod`, `Voucher`, `CashDrawer`, `WeightScale`
   - Captures exact point-in-time state of sales, discounts applied, and the specific payment methods used.

4. **System Features & Telemetry**
   - Entities: `Config`, `Profile` (Store Profile), `Notification`, `DataChange` (Audit Logs), `SyncExport`, `SyncImport`
   - Supports offline-capable data syncing patterns and auditing.

---

## 5. Deployment & Infrastructure

- **Containerization**: The frontend application is containerized using Docker. A multi-stage build creates the Vite production assets and serves them via a lightweight `nginx:alpine` image.
- **Environment Management**: Configuration is managed via `.env` files (distinguishing between `DEV` and `PROD` URLs, defining database credentials, and Xendit webhook tokens).
- **Migrations**: TypeORM CLI is strictly used for schema management and migrations (with auto-sync disabled in production).
