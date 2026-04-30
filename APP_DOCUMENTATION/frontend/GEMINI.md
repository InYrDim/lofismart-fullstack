# GEMINI.md: Project Context for Lofish Mart Admin Dashboard

This document provides a comprehensive overview of the Lofish Mart admin dashboard project to guide future development and interactions.

## 1. Project Overview

**Lofish Mart** is a modern, web-based Point of Sale (POS) and admin dashboard designed for fish and seafood retail. The application provides a comprehensive interface for managing products, sales, transactions, and system settings.

### Core Technologies

*   **Framework**: React 19
*   **Language**: TypeScript
*   **Build Tool**: Vite (using Rolldown for performance)
*   **Routing**: TanStack Router v1 (with file-based routing)
*   **Styling**: Tailwind CSS v4 with `shadcn/ui` components
*   **State Management**: React Hooks, Context API, and TanStack Form/Router integration.
*   **Linting**: ESLint with TypeScript-ESLint

### Key Architectural Patterns

*   **File-Based Routing**: The project uses TanStack Router, which generates the route tree (`src/routeTree.gen.ts`) based on the file structure in the `src/routes` directory. Key layouts include:
    *   `__root.tsx`: The absolute root layout.
    *   `_protected.tsx`: A layout for routes that require authentication. It handles redirecting unauthenticated users.
    *   `_guest.tsx`: A layout for routes accessible to unauthenticated users (e.g., the login page).
*   **Centralized API Client**: All backend communication is handled by a singleton `ApiClient` class located in `src/utils/api.ts`. This client automatically manages API base URLs, attaches authentication tokens, and handles global errors like 401 (Unauthorized) and network failures.
*   **Hook-Based Logic**: Complex business logic is encapsulated in custom hooks. The most significant example is `src/hooks/useCart.ts`, which manages the entire state and complex pricing logic for the shopping cart, including product variants, grading systems, and voucher application.
*   **Component-Based UI**: The UI is built with reusable React components, leveraging `shadcn/ui` for the base component library and Tailwind CSS for utility-first styling.

## 2. Getting Started

### Prerequisites

*   Node.js (v22+ recommended)
*   An instance of the Lofish Mart backend API running and accessible.

### Setup and Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Configure Environment**: The frontend expects to connect to a backend API. The Vite configuration (`vite.config.ts`) sets up a proxy to a development server. For API requests to `/api`, it targets `http://lofish.monlab.my.id`. Ensure this is correct for your development environment or modify the proxy target.
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Available Scripts

*   `npm run dev`: Starts the Vite development server with hot module replacement.
*   `npm run build`: Compiles the TypeScript code and builds the application for production into the `dist` folder.
*   `npm run lint`: Runs ESLint to check for code quality and style issues across the project.
*   `npm run preview`: Serves the production build from the `dist` folder locally to preview the final app.

## 3. Development Conventions

### Code Structure

```
src/
├── components/   # Reusable React components (UI, layouts, features)
│   ├── ui/       # Generic UI elements from shadcn/ui
│   └── ...
├── context/      # React Context providers (Auth, Payment, etc.)
├── hooks/        # Custom hooks for business logic and state
├── lib/          # Core utility functions (e.g., cn for classnames)
├── routes/       # File-based routes for TanStack Router
├── services/     # API service definitions that use the central API client
├── types/        # TypeScript type and interface definitions
└── utils/        # Global utility functions (api.ts, format.ts)
```

### API Communication

*   **Always use the `api` client from `src/utils/api.ts` for making HTTP requests.** This ensures consistency in authentication and error handling.
*   Example: `api.get('/products')` or `api.post('/login', { username, password })`.
*   API service files in `src/services` should be created to group related API calls for a specific resource (e.g., `product.service.ts`, `auth.service.ts`).

### State Management

*   For local component state, use `useState` and `useReducer`.
*   For state shared across multiple components, use React Context created in the `src/context` directory.
*   For complex, reusable stateful logic (especially involving side effects or external data), create a custom hook in the `src/hooks` directory. The `useCart` hook is the canonical example.

### Styling

*   Use Tailwind CSS utility classes directly in your JSX.
*   Use the `cn` utility from `src/lib/utils.ts` to conditionally apply classes.
*   For new UI components, prefer composing them from the existing `shadcn/ui` components in `src/components/ui`.

### Routing

*   To add a new page/route, create a new file in the `src/routes` directory following the TanStack Router conventions (e.g., `_protected.new-page.lazy.tsx`).
*   Use the `<Link>` component from `@tanstack/react-router` for internal navigation to leverage the router's preloading capabilities.

### Linting and Formatting

*   Run `npm run lint` regularly to check your code.
*   Adhere to the existing code style, which is enforced by the ESLint configuration.
*   This project uses a modern `eslint.config.js` flat config.
