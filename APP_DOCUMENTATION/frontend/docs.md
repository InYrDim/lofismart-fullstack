# Lofish Mart - Dokumentasi Project

## Deskripsi Project

Lofish Mart adalah aplikasi Point of Sale (POS) berbasis web untuk toko ikan dan seafood. Aplikasi ini dibangun menggunakan React + TypeScript + Vite dengan Tailwind CSS untuk styling.

## Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite (Rolldown)
- **Styling**: Tailwind CSS 4.1.17
- **Routing**: React Router DOM 7.9.6
- **Icons**: Lucide React 0.554.0

---

## Setup dan Instalasi

### Prerequisites

- Node.js v18+
- npm atau yarn

### Langkah Instalasi

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd lofish-mart
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

   Aplikasi akan berjalan di `http://localhost:5173`

4. **Build untuk Production**

   ```bash
   npm run build
   ```

   Output akan tersimpan di folder `dist/`

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

### Available Scripts

| Command           | Deskripsi                                        |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Menjalankan development server dengan hot reload |
| `npm run build`   | Build aplikasi untuk production                  |
| `npm run lint`    | Menjalankan ESLint untuk cek kualitas code       |
| `npm run preview` | Preview production build secara lokal            |

---

## Struktur Folder

```
lofish-mart/
├── public/                 # Asset statis
├── src/                    # Source code utama
│   ├── assets/            # Font dan gambar
│   ├── components/        # Komponen React reusable
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Halaman utama aplikasi
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root component dengan routing
│   ├── main.tsx           # Entry point aplikasi
│   └── index.css          # Global styles
├── package.json           # Dependencies dan scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

---

## Detail Struktur Folder

### `/src/assets`

**Fungsi**: Menyimpan asset statis seperti font dan gambar.

**Isi**:

- `fonts/WorkSans-Italic-VariableFont_wght.ttf` - Font custom untuk aplikasi
- `react.svg` - Logo React default

---

### `/src/components`

**Fungsi**: Komponen React yang dapat digunakan kembali di berbagai halaman.

#### File Utama:

##### `Brand.tsx`

**Fungsi**: Komponen logo dan nama brand "Lofish Mart".

**Props**: Tidak menerima props (pure presentational component)

**Features**:

- Menampilkan icon ikan (SVG custom dengan path vector)
- Menampilkan nama aplikasi dengan styling bold
- Digunakan di header POS
- Shadow effect untuk depth visual

**Styling**:

- Icon: Background orange (`bg-orange-500`) dengan rounded corners
- Shadow: `shadow-lg shadow-orange-500/20` untuk glow effect
- Typography: `font-bold text-xl` untuk brand name

**Usage Example**:

```tsx
import Brand from "./components/Brand";

// Di header
<header>
	<Brand />
</header>;
```

##### `CartSidebar.tsx`

**Fungsi**: Sidebar keranjang belanja di sisi kanan dengan fixed width 400px.

**Props Interface**:

```typescript
interface CartSidebarProps {
	cart: CartItem[]; // Array item dalam cart
	onUpdateQuantity: (itemId: string, delta: number) => void; // +/- qty
	onUpdateGrade: (itemId: string, newGrade: string) => void; // Ganti variant
	onRemove: (itemId: string) => void; // Hapus item
	onClear: () => void; // Reset cart
	onApplyVoucher: (code: string) => void; // Apply voucher code
	activeVoucher: string; // Kode voucher aktif
	grossTotal: number; // Total sebelum diskon
	totalItemDiscount: number; // Total diskon item
	voucherDiscount: number; // Diskon voucher
	tax: number; // Pajak 11%
	total: number; // Grand total
	onCheckout: () => void; // Callback checkout
}
```

**Features**:

- **Pemisahan Kategori**: Product dan Service ditampilkan terpisah dengan header berbeda
- **Input Fields**:
  - Nama Member (grid col-span-2)
  - Catatan transaksi
  - Kode voucher (dengan validasi visual)
- **Item Controls**: Quantity +/-, variant selector, delete button
- **Price Breakdown**: Subtotal, item discount, tax, voucher discount, total
- **Empty State**: Icon dan pesan saat cart kosong

**Layout Sections**:

1. **Header**: Title "Pesanan" + tombol Reset
2. **Content**: Scrollable list dengan categories
3. **Footer**: Input fields + price summary + checkout button

**Styling Patterns**:

- Card items dengan border-bottom untuk separator
- Sticky footer dengan shadow untuk depth
- Green highlight untuk voucher aktif
- Disabled state pada checkout jika cart kosong

##### `PaymentModal.tsx`

**Fungsi**: Modal untuk proses pembayaran.

- Pilihan metode pembayaran (Cash/QRIS)
- Input jumlah bayar untuk Cash
- Kalkulasi kembalian otomatis
- Ringkasan pesanan
- **Props**: `isOpen`, `onClose`, `totalAmount`, `onSuccess`, `cart`, `activeVoucher`, `voucherDiscount`

##### `ProductCatalog.tsx`

**Fungsi**: Grid katalog produk.

- Menampilkan produk dalam grid layout
- Menggunakan `ProductCard` untuk setiap item
- **Props**: `products`, `cart`, `onAddToCart`, `onUpdateQuantity`

##### `SearchBar.tsx`

**Fungsi**: Input pencarian produk.

- Search icon dengan Lucide React
- Real-time filtering
- **Props**: `searchQuery`, `setSearchQuery`

##### `Sidebar.tsx`

**Fungsi**: Sidebar navigasi di sisi kiri (collapsible).

- Menu navigasi (Dashboard, POS, Transaksi, Pengaturan)
- Tombol logout
- Animasi slide in/out
- Responsive (overlay di mobile, static di desktop)
- **Props**: `isOpen`, `onToggle`

#### `/src/components/ui`

**Fungsi**: Komponen UI kecil dan reusable.

##### `LoadingButton.tsx`

**Fungsi**: Tombol dengan loading state.

- Menampilkan spinner saat loading
- Disable saat loading
- **Props**: `loading`, `children`, `onClick`, `className`, dll.

##### `ProductCard.tsx`

**Fungsi**: Card untuk menampilkan produk individual dengan interactive controls.

**Props Interface**:

```typescript
interface ProductCardProps {
	product: Product; // Data produk
	qty: number; // Quantity saat ini (0 jika belum di cart)
	onAdd: (product: Product) => void; // Callback saat tambah ke cart
	onUpdateQty: (delta: number) => void; // Callback update quantity (+1 / -1)
}
```

**Features**:

- **Image Section**:
  - Aspect ratio square dengan object-cover
  - Hover zoom effect (scale-105)
  - Badge quantity di corner kanan atas (jika qty > 0)
- **Product Info**:
  - Nama produk (truncated jika terlalu panjang)
  - Harga dengan format Rupiah
  - Label "/ varian" jika memiliki variants
  - Stock indicator (hardcoded 25 untuk demo)
- **Action Buttons**:
  - **State 0**: Tombol "Tambah" full width
  - **State > 0**: Controls [-] [qty] [+]

**State Transitions**:

```
[Tambah Button] → Click → [- 1 +] Controls
   qty = 0                    qty > 0
```

**Styling**:

- Hover: Shadow meningkat untuk feedback visual
- Transition: Smooth 300ms untuk semua perubahan
- Active state: Scale down saat click untuk tactile feedback
- Color scheme: Orange untuk primary actions

**Code Example**:

```tsx
<ProductCard
	product={product}
	qty={cartItem?.qty || 0}
	onAdd={addToCart}
	onUpdateQty={(delta) => updateQuantity(product.id, delta)}
/>
```

##### `SuccessModal.tsx`

**Fungsi**: Modal konfirmasi transaksi berhasil.

- Animasi checkmark
- Menampilkan kembalian
- Tombol "Transaksi Baru"
- **Props**: `isOpen`, `onClose`, `change`

---

### `/src/hooks`

**Fungsi**: Custom React hooks untuk logic reusable.

#### `useCart.ts`

**Fungsi**: Custom hook untuk manajemen state keranjang belanja dengan voucher system.

**Return Value Interface**:

```typescript
interface UseCartReturn {
	// State
	cart: CartItem[]; // Array item dalam cart
	activeVoucher: string; // Kode voucher aktif
	voucherDiscount: number; // Nilai diskon dari voucher

	// Actions
	addToCart: (product: Product) => void;
	updateQuantity: (itemId: string, delta: number) => void;
	updateGrade: (itemId: string, newGrade: string) => void;
	removeFromCart: (itemId: string) => void;
	clearCart: () => void;
	applyVoucher: (code: string) => void;

	// Computed Values
	grossTotal: number; // Total sebelum diskon
	totalItemDiscount: number; // Sum dari item.discount
	subtotalAfterItemDisc: number; // grossTotal - totalItemDiscount
	tax: number; // 11% dari subtotalAfterItemDisc
	total: number; // Final amount setelah semua kalkulasi
}
```

**Internal State**:

- `cart`: useState<CartItem[]> - Array items dengan qty, subtotal, discount
- `voucherDiscount`: useState<number> - Global discount dari voucher
- `activeVoucher`: useState<string> - Kode voucher yang sedang aktif

**Helper Functions**:

1. **`getItemPrice(item, grade?)`**

   - Menghitung harga per unit berdasarkan variant
   - Return variant price jika ada, basePrice jika tidak

2. **`calculateCartWithVoucher(currentCart, code)`**

   - Core logic untuk apply voucher
   - Return: `{ updatedItems, globalDisc }`
   - Voucher types:
     - **Item-level**: Modify discount per item
     - **Global**: Flat discount dari total

3. **`updateCartState(newCart)`**
   - Internal helper untuk update + re-apply voucher
   - Auto recalculate jika ada activeVoucher

**Voucher Logic Detail**:

```typescript
// ITEM10: 10% per item
itemDiscFn = (item, price, qty) => price * qty * 0.1;

// POTONG5K: Flat 5000 per item (max price * qty)
itemDiscFn = (item, price, qty) => Math.min(price * qty, 5000 * qty);

// CHANNA20: 20% khusus produk Channa
itemDiscFn = (item, price, qty) =>
	item.name.toUpperCase().includes("CHANNA") ? price * qty * 0.2 : 0;

// GLOBAL50: Flat 50,000 dari total
globalDisc = 50000;
```

**Action Workflows**:

**1. addToCart(product)**

```
Cek existing item by id
├─ Jika ADA → qty++, recalc subtotal
└─ Jika TIDAK → Push item baru
    ├─ Set initial variant (jika hasVariants)
    ├─ Set qty = 1
    └─ Set discount = 0
↓
updateCartState() → reapply voucher if any
```

**2. updateQuantity(itemId, delta)**

```
Map cart items
├─ Find item by id
├─ newQty = qty + delta
├─ If newQty <= 0 → return null (filter keluar)
└─ Else → update qty & subtotal
↓
updateCartState() → reapply voucher
```

**3. applyVoucher(code)**

```
Set activeVoucher = code
↓
calculateCartWithVoucher(cart, code)
├─ Parse voucher rules
├─ Apply item-level discounts
└─ Apply global discount
↓
Update cart items + voucherDiscount
```

**Calculation Flow**:

```
Cart Items
  ↓
getItemPrice() → Calculate per-unit price
  ↓
subtotal = price × qty (per item)
  ↓
grossTotal = Σ(subtotal) → Total sebelum diskon
  ↓
Apply Voucher (if any)
  ├─ Item discounts → item.discount
  └─ Global discount → voucherDiscount
  ↓
totalItemDiscount = Σ(item.discount)
  ↓
subtotalAfterItemDisc = grossTotal - totalItemDiscount
  ↓
tax = subtotalAfterItemDisc × 0.11
  ↓
total = subtotalAfterItemDisc + tax - voucherDiscount
```

**Usage Example**:

```tsx
const { cart, addToCart, updateQuantity, total, applyVoucher, activeVoucher } =
	useCart();

// Add product
addToCart(selectedProduct);

// Update quantity
updateQuantity("P1", 1); // +1
updateQuantity("P1", -1); // -1

// Apply voucher
applyVoucher("ITEM10");

// Display total
<p>{formatRupiah(total)}</p>;
```

---

### `/src/pages`

**Fungsi**: Halaman-halaman utama aplikasi.

#### `LoginPage.tsx`

**Fungsi**: Halaman login.

- Form username dan password
- Navigasi ke `/pos` setelah login
- Styling dengan gradient background

#### `POSPage.tsx`

**Fungsi**: Halaman utama POS (Point of Sale).

**Layout**:

```
┌─────────────────────────────────────────────┐
│  [Menu] Brand    [Search]    [Refresh][Cart]│
├──────────┬──────────────────────┬────────────┤
│          │                      │            │
│ Sidebar  │   Product Catalog    │ Cart       │
│ (kiri)   │   (tengah)           │ Sidebar    │
│          │                      │ (kanan)    │
│          │                      │            │
└──────────┴──────────────────────┴────────────┘
```

**State Management**:

- `searchQuery` - Query pencarian
- `isSidebarOpen` - Status sidebar kiri
- `isCartOpen` - Status cart sidebar kanan
- `isPaymentModalOpen` - Status modal pembayaran
- `isSuccessModalOpen` - Status modal sukses
- `lastChange` - Kembalian terakhir

**Features**:

- Toggle sidebar kiri (menu navigasi)
- Toggle cart sidebar kanan (animasi slide)
- Badge notifikasi jumlah item di tombol cart
- Search/filter produk
- Refresh catalog
- Checkout flow

**Data**:

- `DUMMY_PRODUCTS` - Array produk dummy (ikan air tawar, ikan laut, layanan)

---

### `/src/types`

**Fungsi**: Definisi TypeScript types untuk type safety.

#### `index.ts`

**Types**:

```typescript
ProductVariant {
  grade: string;
  price: number;
}

Product {
  id: string;
  name: string;
  image: string;
  basePrice: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
  category: "PRODUCT" | "SERVICE";
}

CartItem extends Product {
  qty: number;
  selectedGrade?: string;
  subtotal: number;
  discount: number;
}

PaymentMethod = "CASH" | "QRIS"
```

---

### `/src/utils`

**Fungsi**: Utility functions helper.

#### `index.ts`

**Functions**:

- `formatRupiah(num)` - Format angka ke format mata uang Rupiah (IDR)
  - Contoh: `45000` → `"Rp 45.000"`

---

## Alur Aplikasi

### 1. Entry Point (`main.tsx`)

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
```

**Proses**:

1. Import React StrictMode untuk development checks
2. Create root element dari DOM node `#root`
3. Render `<App />` component

---

### 2. Routing (`App.tsx`)

```typescript
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LoginPage />} />
				<Route path="/pos" element={<POSPage />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
```

**Routes**:

- `/` → LoginPage (Landing page)
- `/pos` → POSPage (Main POS interface)
- `*` → Redirect ke `/` (404 handler)

---

### 3. POS Flow Diagram

```
POSPage Component
│
├─── [Header]
│    ├─ [Menu Button] ──→ Toggle Sidebar Kiri
│    ├─ <Brand />
│    ├─ <SearchBar />
│    ├─ [Refresh Button]
│    └─ [Cart Button + Badge] ──→ Toggle Cart Sidebar
│
├─── <Sidebar /> (Kiri)
│    ├─ State: isSidebarOpen
│    ├─ Navigation Links
│    └─ Logout Button
│
├─── [Product Catalog Area]
│    └─ <ProductCatalog>
│         └─ Map products → <ProductCard />
│              ├─ Click "Tambah" ──→ addToCart()
│              └─ Click [+/-] ──→ updateQuantity()
│
├─── <CartSidebar /> (Kanan)
│    ├─ State: isCartOpen
│    ├─ List Cart Items
│    │   ├─ Product Section
│    │   └─ Service Section
│    ├─ Input: Nama Member, Catatan, Voucher
│    ├─ Price Summary
│    └─ [Checkout Button] ──→ Open PaymentModal
│
├─── <PaymentModal />
│    ├─ State: isPaymentModalOpen
│    ├─ Select Payment Method
│    │   ├─ CASH → Input amount + calculate change
│    │   └─ QRIS → Show QR code
│    ├─ Order Summary
│    └─ [Konfirmasi] ──→ onSuccess() ──→ Open SuccessModal
│
└─── <SuccessModal />
     ├─ State: isSuccessModalOpen
     ├─ Show checkmark animation
     ├─ Display change amount
     └─ [Transaksi Baru] ──→ clearCart() + close modal
```

---

### 4. State Management Flow

```
useCart Hook (Custom State Management)
│
├─── State
│    ├─ cart: CartItem[]
│    ├─ activeVoucher: string
│    └─ voucherDiscount: number
│
├─── Actions
│    ├─ addToCart() ────────┐
│    ├─ updateQuantity() ───┤
│    ├─ updateGrade() ───────┼──→ updateCartState()
│    ├─ removeFromCart() ────┤     ├─ Update cart
│    ├─ clearCart() ─────────┘     └─ Reapply voucher (if any)
│    │
│    └─ applyVoucher()
│         ├─ calculateCartWithVoucher()
│         │   ├─ Parse voucher rules
│         │   ├─ Apply item discounts
│         │   └─ Apply global discount
│         └─ Update state
│
└─── Computed Values (useMemo equivalent)
     ├─ grossTotal = Σ(price × qty)
     ├─ totalItemDiscount = Σ(item.discount)
     ├─ subtotalAfterItemDisc = grossTotal - totalItemDiscount
     ├─ tax = subtotalAfterItemDisc × 0.11
     └─ total = subtotalAfterItemDisc + tax - voucherDiscount
```

---

### 5. Component Communication

```
POSPage (Parent)
    │
    ├── useCart() hook
    │     │
    │     ↓
    ├── State & Actions dijadikan Props
    │
    ├──→ ProductCatalog
    │      └──→ ProductCard
    │            └── onAdd={addToCart}
    │
    ├──→ CartSidebar
    │      ├── cart={cart}
    │      ├── onUpdateQuantity={updateQuantity}
    │      ├── onUpdateGrade={updateGrade}
    │      ├── onApplyVoucher={applyVoucher}
    │      └── total={total}
    │
    └──→ PaymentModal
           ├── totalAmount={total}
           ├── cart={cart}
           └── onSuccess={() => {
                 setIsPaymentModalOpen(false);
                 setIsSuccessModalOpen(true);
               }}
```

**Props Drilling Strategy**:

- State disimpan di `POSPage` level
- Functions dari `useCart` di-pass sebagai props
- Child components bersifat "controlled" (stateless)

---

---

## Styling Architecture

### Tailwind CSS

- Utility-first approach
- Custom colors: orange (primary), gray (neutral)
- Responsive breakpoints
- Animations: slide-in, fade, scale

### Design Patterns

- **Glassmorphism**: Backdrop blur effects
- **Shadows**: Layered shadow untuk depth
- **Transitions**: Smooth animations (300ms)
- **Responsive**: Mobile-first design

---

## Key Features

1. **Dual Sidebar System**

   - Sidebar kiri: Navigasi menu
   - Sidebar kanan: Keranjang belanja
   - Keduanya collapsible dengan animasi

2. **Smart Cart Management**

   - Auto-calculate subtotal per item
   - Variant selection (grade/size)
   - Item discount logic
   - Voucher system (item-level & global)

3. **Notification Badge**

   - Badge merah di tombol cart
   - Menampilkan total quantity items
   - Auto-hide saat cart kosong

4. **Payment Flow**

   - Cash: Input manual + auto-calculate change
   - QRIS: QR code display
   - Order summary
   - Success confirmation

5. **Product Categories**
   - PRODUCT: Ikan dan seafood
   - SERVICE: Jasa (bersihkan, fillet, delivery)

---

## Catatan Pengembangan

### Voucher Codes (Hardcoded)

- `ITEM10` - 10% discount per item (Gurame, Nila, Lele)
- `CHANNA20` - 20% discount untuk Channa products
- `GLOBAL5` - 5% discount dari total

### Dummy Data

**Products (9 items)**:

```typescript
const DUMMY_PRODUCTS: Product[] = [
  // Ikan Air Tawar
  {
    id: "P1",
    name: "Ikan Gurame Hidup",
    basePrice: 45000,
    hasVariants: true,
    category: "PRODUCT",
    variants: [
      { grade: "Sedang (500g-800g)", price: 38000 },
      { grade: "Besar (1kg+)", price: 45000 },
    ],
  },
  { id: "P2", name: "Ikan Nila Merah", basePrice: 32000, ... },
  { id: "P3", name: "Ikan Lele Sangkuriang", basePrice: 24000, ... },
  { id: "P4", name: "Ikan Mas Segar", basePrice: 30000, ... },

  // Ikan Laut
  { id: "P5", name: "Ikan Kembung Banjar", basePrice: 40000, ... },
  { id: "P6", name: "Ikan Tongkol Batik", basePrice: 35000, ... },
  { id: "P7", name: "Udang Vaname", basePrice: 80000, hasVariants: true, ... },
  { id: "P8", name: "Cumi-Cumi Segar", basePrice: 75000, ... },
  { id: "P9", name: "Fillet Salmon (Premium)", basePrice: 280000, hasVariants: true, ... },
];
```

**Services (3 items)**:

```typescript
// Layanan
{ id: "S1", name: "Jasa Bersihkan Ikan", category: "SERVICE", basePrice: 2000, hasVariants: true },
{ id: "S2", name: "Jasa Fillet Daging", category: "SERVICE", basePrice: 10000 },
{ id: "S3", name: "Pengiriman (Delivery)", category: "SERVICE", basePrice: 15000, hasVariants: true },
```

**Image Sources**: Semua gambar dari Unsplash API dengan auto-format

---

### Future Improvements

**Backend Integration**:

- [ ] REST API atau GraphQL endpoint
- [ ] Real-time stock management
- [ ] Database (PostgreSQL/MongoDB)

**Authentication & Authorization**:

- [ ] Multi-user system (admin, cashier)
- [ ] Role-based permissions
- [ ] Session management

**Features**:

- [ ] Transaction history dengan filter & search
- [ ] Print receipt (thermal printer support)
- [ ] Export reports (PDF, Excel)
- [ ] Inventory management
- [ ] Customer loyalty program
- [ ] Multi-language support (i18n)

**Technical**:

- [ ] Unit testing (Vitest)
- [ ] E2E testing (Playwright)
- [ ] State management library (Zustand/Redux)
- [ ] Offline mode (PWA)
- [ ] Analytics tracking

---

## Testing

### Manual Testing Checklist

**Product Catalog**:

- [x] Search berfungsi real-time
- [x] Product card responsive
- [x] Add to cart animation smooth

**Cart Management**:

- [x] Add/remove items
- [x] Update quantity
- [x] Change variant/grade
- [x] Apply voucher code
- [x] Clear cart

**Payment Flow**:

- [x] Cash payment calculation
- [x] QRIS display
- [x] Success modal animation
- [x] Transaction complete flow

**Sidebar Toggling**:

- [x] Left sidebar slide animation
- [x] Cart sidebar slide animation
- [x] Badge update on cart changes

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy dist folder
netlify deploy --prod --dir=dist
```

### Manual Deployment

1. Build production bundle:

   ```bash
   npm run build
   ```

2. Upload `dist/` folder ke hosting:

   - Static hosting: Vercel, Netlify, GitHub Pages
   - VPS: Nginx atau Apache

3. Configure routing:
   ```nginx
   # nginx.conf
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

### Environment Variables (Future)

Jika menggunakan backend:

```bash
# .env
VITE_API_URL=https://api.lofish-mart.com
VITE_API_KEY=your_api_key_here
```

Access via:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
```
