# Analisis Flow Authentication dan Authorization (Frontend)

Dokumen ini merinci mekanisme Autentikasi (AuthN) dan Autorisasi (AuthZ) pada aplikasi frontend LofishMart.

---

## 1. Authentication (AuthN)

Aplikasi menggunakan **Token-based Authentication** dengan sinkronisasi antara `localStorage` dan **React Context**.

### A. Login Flow
1. **Service Layer (`AuthService.login`)**:
   - Mengirim kredensial ke endpoint `/login`.
   - Menerima respons berupa `token` dan objek `user`.
   - Menyimpan token (dengan prefix `Bearer `) dan data user ke `localStorage` via utility `storage`.
2. **Context Layer (`AuthProvider`)**:
   - Saat aplikasi dimuat, `AuthProvider` mengambil data user dari `localStorage` untuk inisialisasi state.
   - Fungsi `login` di context dipanggil untuk mengupdate state global `user` dan `isAuthenticated`.

### B. Request Interception (`api.ts`)
Setiap request keluar melalui `ApiClient` otomatis menyematkan header `Authorization`:
- Token diambil langsung dari `localStorage`.
- Jika server merespons dengan **401 Unauthorized**, aplikasi otomatis memanggil `storage.clear()` dan melakukan redirect paksa ke halaman login (`/`).

### C. Route Guarding (TanStack Router)
- **`/_protected`**: Menggunakan `beforeLoad` untuk mengecek `AuthService.isAuthenticated()`. Jika gagal, user di-redirect ke `/`.
- **`/_guest`**: Mencegah user yang sudah login mengakses halaman login/index, mengarahkan mereka langsung ke `/pos`.

---

## 2. Authorization (AuthZ) - Centralized RBAC

Aplikasi ini menggunakan sistem **Role-Based Access Control (RBAC)** yang dipusatkan pada rute-rute layout (Pathless Layout Routes).

### A. Centralized Layout Guards
Alih-alih menyebar logika pengecekan di setiap halaman, kita menggunakan layout khusus:

1. **`_management` Layout** ([src/routes/_protected._management.tsx](file:///home/inyrdim/code/lofishmart/lofishmart-frontend/src/routes/_protected._management.tsx)):
   - Membatasi akses hanya untuk role `ADMIN` dan `MANAGER`.
   - Melindungi rute: `/users`, `/outlets`, `/products`, `/product-attributes`, `/suppliers`, `/report-item`.
2. **`_inventory_group` Layout** ([src/routes/_protected._inventory_group.tsx](file:///home/inyrdim/code/lofishmart/lofishmart-frontend/src/routes/_protected._inventory_group.tsx)):
   - Membatasi akses untuk role `ADMIN`, `MANAGER`, `SUPERVISOR`, dan `GUDANG`.
   - Melindungi rute: `/inventory`, `/inventory-dashboard`, `/markets`.

### B. Mekanisme Redirect
User yang mencoba mengakses rute di luar otoritasnya akan otomatis di-redirect ke halaman **`/forbidden`** yang memberikan feedback visual yang jelas.

### C. Granular Control (UI Level)
Untuk elemen UI spesifik (tombol/menu), gunakan hook atau komponen berikut:
- **Hook `useRoleAndPermission`**: Untuk flag boolean cepat (`isAdmin`, `isCashier`).
- **Component `PermissionGuard`**: Untuk menyembunyikan/menampilkan section UI berdasarkan permission string.

---

## 3. Komponen Utama & File Terkait

| Kategori | File | Peran |
| :--- | :--- | :--- |
| **Logic** | `services/auth.service.ts` | Interaksi API login/logout |
| **State** | `context/AuthContext.tsx` | State manajemen global user |
| **Utility** | `utils/storage.ts` | Manajemen `localStorage` |
| **Utility** | `utils/api.ts` | Injeksi token & handle 401 |
| **Guard** | `routes/_protected.tsx` | Proteksi rute Global Auth |
| **Layout Guard** | `routes/_protected._management.tsx` | Centralized RBAC (Admin/Manager) |
| **Layout Guard** | `routes/_protected._inventory_group.tsx` | Centralized RBAC (Inventory Roles) |
| **Hook** | `hooks/useRoleAndPermission.ts` | Abstraksi pengecekan role/permit |
| **UI** | `components/Forbidden.tsx` | Fallback rute tidak diizinkan |

---

## 4. Hasil Audit & Status Akhir

- **Global Auth Guard**: **Selesai**. Solid dan terpusat di `_protected.tsx`.
- **RBAC Guard**: **Selesai & Ditingkatkan**. Telah diimplementasikan secara deklaratif menggunakan Layout Routes, menghilangkan duplikasi kode di 10+ file rute dan memberikan feedback `/forbidden` yang premium.
