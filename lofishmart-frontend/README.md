# Lofish Mart - Point of Sale (POS) System

Lofish Mart is a modern web-based Point of Sale (POS) application designed for fish and seafood retail. Built with performance and user experience in mind, it leverages the latest React ecosystem technologies.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) (Rolldown)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Routing**: [React Router DOM 7](https://reactrouter.com/)
- **Backend**: Go (Golang) - Acts as Monolith Server (Static + Reverse Proxy)
- **Icons**: [Lucide React](https://lucide.dev/)

## Key Features

- **Modern POS Interface**: Clean, responsive layout with dual sidebars for navigation and cart management.
- **Dynamic Cart System**:
  - Support for legacy product variants.
  - **New Grading System**: Custom pricing logic based on Size and Quality criteria.
  - Real-time subtotal, discount, and tax calculations.
- **Voucher System**:
  - Supports item-level discounts (e.g., specific product types).
  - Global cart discounts.
- **Product Management**:
  - Search and filter capabilities.
  - Inventory tracking (Stock & Non-stock items).
  - Categorization (Product vs. Service).
- **Payment Processing**:
  - Cash payment with automatic change calculation.
  - QRIS support (UI ready, integrated via Xendit).

## Project Structure

```
src/
├── assets/          # Static assets (fonts, images)
├── components/      # Reusable React components
│   ├── payment/     # Payment modals (QRISPayment.tsx)
│   ├── ui/          # Generic UI elements (Buttons, Cards, Modals)
│   └── ...          # Feature-specific components
├── hooks/           # Custom hooks (useCart, usePayment)
├── pages/           # Route components (LoginPage, POSPage)
├── services/        # API and Business Logic services
├── types/           # TypeScript definitions
└── utils/           # Helper functions (currency formatting, grading)

server/              # Go Backend Server
└── main.go          # Monolith Entrypoint (Static Files + Proxy + WebSocket)
```

## Getting Started

### 1. Prerequisites

- Node.js (v22+)
- Go (v1.21+)

### 2. Installation

```bash
git clone <repository-url>
cd lofish-mart
npm install
```

### 3. Local Development (Monolith Mode)

To run both the Frontend (Vite) and Backend (Go) concurrently:

```bash
npm run dev:monolith
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080 (Proxies API & WebSocket)

> **Note**: The frontend is configured to automatically connect to the local backend on port 8080.

## Deployment (Docker/Podman)

The application is containerized as a **single monolithic image**. The Go server handles serving the built React app, proxying API requests, and managing WebSockets.

### 1. Build the Image

```bash
docker build -t lofish-mart .
# or
podman build -t lofish-mart .
```

### 2. Run the Container

Use `--env-file .env` to pass your credentials securely.

```bash
docker run -d --name lofish-mart -p 8080:8080 --env-file .env lofish-mart
# or
podman run -d --name lofish-mart -p 8080:8080 --env-file .env lofish-mart
```

**Environment Variables (`.env`):**

```env
VITE_XENDIT_SECRET_KEY=xnd_development_...
VITE_ENABLE_WEBSOCKET=true
# VITE_WEBSOCKET_URL is optional in production (auto-detected)
```

### 3. Push & Pull Image

To share the image or deploy it to a server, you can push it to a container registry (e.g., Docker Hub, GitHub Container Registry, or a private registry).

**Pushing:**

```bash
# 1. Tag the image
podman tag lofish-mart registry.example.com/your-username/lofish-mart:latest

# 2. Login (if needed)
podman login registry.example.com

# 3. Push
podman push registry.example.com/your-username/lofish-mart:latest
```

**Pulling:**

```bash
podman pull registry.example.com/your-username/lofish-mart:latest
```

### 4. Access

Open <http://localhost:8080> in your browser.

## License

Private Property of Lofish Mart.
