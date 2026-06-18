# Lofish Mart - Frontend Project Specification

## 1. Executive Summary
**Lofish Mart Frontend** is a modern, responsive Single Page Application (SPA) designed as the Point of Sale (POS) and Administrative Dashboard for a fish and seafood retail business. 

The application provides a comprehensive interface for managing products, tracking sales and transactions, handling dynamic grading/size-based pricing, and controlling hardware peripherals like digital weight scales. 

---

## 2. Tech Stack & Dependencies

- **Core Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Build Tooling**: [Vite](https://vitejs.dev/) utilizing the Rolldown bundler (`rolldown-vite` override) for optimal compilation performance.
- **Routing**: [TanStack Router v1](https://tanstack.com/router/latest) for declarative file-based routing and deep type safety.
- **Form Management**: [TanStack React Form](https://tanstack.com/form/latest) paired with Zod for strict schema validation (`@tanstack/zod-form-adapter`).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: `shadcn/ui` ecosystem components leveraging [Radix UI](https://www.radix-ui.com/), `class-variance-authority`, `clsx`, and `tailwind-merge`.
- **Icons**: `lucide-react`
- **Data Visualization**: `recharts` for dashboard analytics.
- **Utilities**: `date-fns` for time manipulation, `qrcode.react` for generating Xendit/QRIS dynamic payment codes.

---

## 3. Application Architecture & Patterns

### 3.1 File-Based Routing System
Routing is strictly managed by **TanStack Router**, which auto-generates a route tree (`src/routeTree.gen.ts`) based on the filesystem layout in the `src/routes` directory.
- `__root.tsx`: The absolute top-level layout encompassing global providers.
- `_guest.tsx`: Unauthenticated layout (e.g., Login).
- `_protected.tsx`: Authenticated layout enforcing session security and rendering the main navigation sidebar. Sub-routes include dashboard, POS, markets, products, transactions, and settings.

### 3.2 State Management
The project relies on a hybrid approach for state management instead of using Redux or Zustand:
- **Component State**: Standard `useState` and `useReducer` for isolated UI logic.
- **Context API**: Handles global domain states:
  - `AuthContext` (`AuthProvider`): Stores JWT tokens, handles login/logout behaviors, and manages user session data.
  - `PaymentContext` (`PaymentProvider`): Manages the global state of the checkout process, payment method selections (Cash, QRIS), and modal visibility.
  - `SerialContext` (`SerialProvider`): Unique context utilizing the browser's Web Serial API to establish, read, and interpret streaming data from physical electronic weight scales.
- **Custom Hooks**: Complex business logic is abstracted into custom hooks. E.g., `useCart.ts` acts as the definitive state engine for building orders, calculating subtotals, applying vouchers, and resolving variant pricing.

### 3.3 Centralized API Client
All HTTP communication passes through a singleton `ApiClient` class (`src/utils/api.ts`).
- Manages dynamic API Base URLs depending on the environment variables (`VITE_API_URL` or derived proxy defaults).
- Automatically attaches the Bearer token to headers via `localStorage` checks.
- Implements global response interceptors for handling unauthenticated (401) states seamlessly across the application.

---

## 4. Directory Structure

```text
lofishmart-frontend/
├── src/
│   ├── assets/        # Static imagery, SVGs, and fonts
│   ├── components/    # Reusable UI Elements
│   │   ├── payment/   # Dedicated payment logic components (e.g., QRISPayment.tsx)
│   │   ├── ui/        # shadcn/ui primitives (Buttons, Inputs, Dialogs)
│   ├── context/       # Global State Providers (Auth, Payment, Serial)
│   ├── hooks/         # Shared business logic hooks (useCart, useDebounce)
│   ├── lib/           # Utility libraries (e.g., Tailwind `cn` merger)
│   ├── routes/        # TanStack file-based routes (_guest, _protected)
│   ├── services/      # Domain-specific API fetching logic
│   ├── types/         # Global TypeScript interfaces and DTOs
│   ├── utils/         # Helper functions (api.ts, format.ts, grading-logic.ts)
│   ├── App.tsx        # Top-level RouterProvider injection
│   └── main.tsx       # React 19 root renderer
├── docs.md            # Internal Developer Documentation
├── GEMINI.md          # Architectural AI Context Document
├── components.json    # shadcn/ui configuration
├── vite.config.ts     # Vite configuration and proxy setup
└── Dockerfile         # Multi-stage containerization build file
```

---

## 5. Core Features & Complex Domains

### Point of Sale (POS) Interface
The core utility of the app, featuring a dual-sidebar layout. The left side handles navigation, the center focuses on a search/filter-heavy product grid, and the right side acts as the live transaction cart. 

### Dynamic Pricing & Cart Engine
Unlike standard e-commerce, fish retail requires dynamic pricing based on:
- **Grades (Quality)** and **Sizes**. 
- The `useCart` hook resolves the final price by intersecting the base Product model with its selected variants. It also supports real-time tax mapping and discounts.

### Hardware Integration (Web Serial API)
The application bridges the physical and web layer via the `SerialProvider`. It securely negotiates a COM/TTY port connection to digital weight scales, streams baud rates, parses the output, and automatically maps live weight data to the POS item currently being added to the cart.

### Digital Payments (Xendit/QRIS)
The checkout module interfaces with Xendit APIs (via backend orchestration). The frontend handles generating QRIS QR codes dynamically via `qrcode.react`, polling/waiting for webhook payment confirmations, and managing the cash drawer change calculation algorithm.

---

## 6. Build, Deployment & Proxy

### Development Proxy
The `vite.config.ts` handles local CORS issues by setting up a proxy. Requests mapped to `/api` are seamlessly routed to the development backend server (`http://lofish.monlab.my.id` or a local backend instance) without cross-origin pollution.

### Production Containerization
The project uses a standard multi-stage Docker build:
1. **Build Stage**: Uses `node:22-alpine` to install dependencies and execute Vite's `npm run build` command, compiling the TS/React code into static HTML/JS/CSS.
2. **Serve Stage**: Uses `nginx:alpine` to serve the static artifacts from the `/usr/share/nginx/html` directory on port 80.
