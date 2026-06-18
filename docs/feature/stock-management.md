# Feature: Manajemen Stok (Transfer Order, Penempatan Supervisor & Cetak Laporan)

## 1. Pendahuluan

Fitur ini mencakup tiga area utama yang saling berkaitan:

1. **Transfer Order Gudang → Outlet** — Pengiriman stok dari gudang ke outlet kini menggunakan sistem 3-status dengan verifikasi, menggantikan proses transfer instan yang tidak memiliki audit trail.
2. **Penempatan Supervisor per Outlet** — Admin dapat menetapkan supervisor ke outlet tertentu langsung dari UI, mengontrol visibilitas data kiriman per supervisor.
3. **Cetak Fingerprint** — Laporan pengiriman (Surat Jalan) dan laporan penerimaan (Bukti Terima) yang dapat dicetak oleh masing-masing pihak.

---

## 2. Kondisi Sistem Saat Ini (Sebelum Implementasi)

| Aspek | Kondisi |
|---|---|
| Penerimaan dari supplier → stok gudang | ✅ Sudah berjalan (`receiveFromSupplier`) |
| Transfer gudang ke outlet | ⚠️ Instan — stok langsung dipindah tanpa verifikasi |
| Verifikasi penerimaan di outlet | ❌ Hanya client-side (localStorage), tidak tersimpan di DB |
| Penempatan supervisor ke outlet di UI | ❌ Hanya bisa di-set manual via DB |
| Laporan cetak pengiriman | ❌ Belum ada |

---

## 3. Alur Transfer Stok Baru (User Flow)

```
Gudang (GDNG/Admin)               DB: stock_transfer              Outlet (SPVR)
        │                                  │                            │
  [Buat Transfer]  ──────► status: SENDING                            │
  Stok gudang -X           (stok dikurangi saat ini)                  │
        │                                  │                            │
  [Konfirmasi Kirim] ──► status: WAITING_VERIFICATION ◄─── (SPVR melihat kiriman)
  [Cetak Surat Jalan]       │                                          │
        │                                  │              [ACC & Verifikasi by SPVR]
        │                                  │               Stok outlet +X
        │                          status: DONE ◄──────────────────────│
        │                                                  [Cetak Bukti Terima]
```

**Aturan Sinkronisasi Stok:**
- Stok gudang dikurangi **saat transfer dibuat** (`SENDING`) — barang sudah "berangkat"
- Stok outlet ditambah **hanya saat SPVR memverifikasi** (`DONE`)
- Jika transfer dibatalkan (`SENDING` → `CANCELLED`), stok gudang dikembalikan

---

## 4. Desain Database

### Tabel Baru: `stock_transfer`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | varchar(16) | Primary Key |
| `qty` | double | Jumlah yang dikirim dari gudang |
| `unit` | enum('1','2') | Satuan: 1=KG, 2=Ekor |
| `status` | enum | `SENDING`, `WAITING_VERIFICATION`, `DONE`, `CANCELLED` |
| `notes` | varchar nullable | Catatan dari pengirim |
| `verified_qty` | double nullable | Qty yang diterima setelah verifikasi SPVR |
| `verified_notes` | varchar nullable | Catatan penerimaan dari SPVR |
| `sent_at` | timestamp nullable | Waktu status berubah ke `WAITING_VERIFICATION` |
| `verified_at` | timestamp nullable | Waktu status berubah ke `DONE` |
| `created_at` | timestamp | Auto |
| `updated_at` | timestamp | Auto |

**Relasi:**

| Kolom FK | Target | Keterangan |
|---|---|---|
| `source_stock_id` | `stock.id` | Stok gudang asal |
| `target_market_id` | `profile.id` | Outlet tujuan |
| `product_id` | `product.id` | Produk yang dikirim |
| `created_by_id` | `user.id` | User yang membuat transfer |
| `verified_by_id` | `user.id` nullable | SPVR yang memverifikasi |

---

## 5. Rencana Implementasi Teknis

### A. Backend — Database Layer

**File baru:**
- `db/entities/StockTransfer.js` — Entity TypeORM untuk tabel `stock_transfer`
- `db/migrations/1774100000000-AddStockTransfer.js` — Migrasi: buat tabel + tambah permissions `stock-transfer` dan `stock-transfer-edit`

### B. Backend — API Endpoints

**File dimodifikasi:** `controllers/inventoryController.js`

Tambah 5 fungsi baru:

| Fungsi | Method & Path | Deskripsi |
|---|---|---|
| `createTransferOrder` | `POST /inventory/transfer-order/create` | Gudang membuat order pengiriman. Validasi stok cukup, kurangi stok gudang, buat record `SENDING`. |
| `getTransferOrders` | `GET /inventory/transfer-orders` | List transfer orders — Admin/Manager: semua; GDNG: dari gudangnya; SPVR: ke outletnya. |
| `updateTransferStatus` | `PATCH /inventory/transfer-order/:id/status` | Update status: `SENDING→WAITING_VERIFICATION` (oleh GDNG) atau `WAITING_VERIFICATION→DONE` (oleh SPVR, tambah stok outlet). |
| `cancelTransfer` | `POST /inventory/transfer-order/:id/cancel` | Batalkan transfer saat `SENDING`, kembalikan stok ke gudang. |
| `getTransferReport` | `GET /inventory/transfer-order/:id/report` | Kembalikan detail lengkap transfer untuk keperluan cetak laporan. |

**File dimodifikasi:** `routes/product.js`

```javascript
// Routes baru yang ditambahkan:
router.post('/inventory/transfer-order/create', auth(['stock-edit']), inventoryController.createTransferOrder);
router.get('/inventory/transfer-orders', auth(['stock']), inventoryController.getTransferOrders);
router.patch('/inventory/transfer-order/:id/status', auth(['stock-edit']), inventoryController.updateTransferStatus);
router.post('/inventory/transfer-order/:id/cancel', auth(['stock-edit']), inventoryController.cancelTransfer);
router.get('/inventory/transfer-order/:id/report', auth(['stock']), inventoryController.getTransferReport);
```

### C. Frontend — Service Layer

**File dimodifikasi:** `src/services/inventory.service.ts`

Tambah interface `StockTransfer` dan fungsi-fungsi baru:

```typescript
// Interface baru
interface StockTransfer {
  id: string;
  qty: number;
  unit: '1' | '2';
  status: 'SENDING' | 'WAITING_VERIFICATION' | 'DONE' | 'CANCELLED';
  notes?: string;
  verified_qty?: number;
  verified_notes?: string;
  sent_at?: string;
  verified_at?: string;
  created_at: string;
  source_stock?: StockItem;
  target_market?: { id: string; name: string; address?: string };
  product?: { id: string; name: string };
  created_by?: { id: string; name: string };
  verified_by?: { id: string; name: string } | null;
}

// Fungsi baru
createTransferOrder(payload)
getTransferOrders(params?: { status?: string; market_id?: string })
updateTransferStatus(id, status, verifiedQty?, verifiedNotes?)
cancelTransferOrder(id)
getTransferReport(id)
```

### D. Frontend — UI Components

**File dimodifikasi: `TransferModal.tsx`**
- Ubah submit handler dari `transferStock` (instan) menjadi `createTransferOrder`
- Tambah field `notes` (catatan pengiriman, opsional)
- Success message: `"Pengiriman dibuat! Status: Mengirim 🚚"`

**File baru: `TransferOrderList.tsx`**
- Komponen daftar transfer orders dengan status badge berwarna:
  - 🚚 `SENDING` → badge oranye
  - ⏳ `WAITING_VERIFICATION` → badge kuning
  - ✅ `DONE` → badge hijau
  - ❌ `CANCELLED` → badge abu-abu
- Untuk GDNG/Admin: tombol "Konfirmasi Sudah Dikirim" (`SENDING` → `WAITING_VERIFICATION`) + tombol "Cetak Surat Jalan"
- Untuk SPVR: tombol "ACC & Terima" (`WAITING_VERIFICATION` → `DONE`) + input qty diterima + tombol "Cetak Bukti Terima"
- Untuk semua: tombol "Batalkan" (`SENDING` → `CANCELLED`)

**File dimodifikasi: `OutletView.tsx`**
- Ganti sistem "Pending Stock" berbasis `localStorage` (heuristic 24 jam) dengan data `StockTransfer` status `WAITING_VERIFICATION` yang ditujukan ke outlet ini
- Tampilkan kiriman masuk dari DB — realtime dan akurat

**File dimodifikasi: `GudangView.tsx`**
- Tambah section "Pengiriman Berjalan" yang menampilkan transfer dengan status `SENDING` dan `WAITING_VERIFICATION`

**File dimodifikasi: `_protected._inventory_group.markets.tsx`**
- Load `getTransferOrders` saat init / refresh
- Teruskan data `transferOrders` ke komponen `TransferOrderList`, `OutletView`, dan `GudangView`
- Tambah callbacks untuk update status

---

## 6. Penempatan Supervisor per Outlet

### Latar Belakang
Kolom `market_id` sudah ada di tabel `user` dan entity `User.js`. Backend `userUpdate` di `userController.js` sudah menangani field ini (baris 188–190). **Tidak diperlukan perubahan backend.**

Yang perlu ditambahkan adalah UI manajemen di sisi admin agar penugasan mudah dilakukan tanpa akses DB.

### Perubahan UI

**File dimodifikasi: `_protected._management.users.lazy.tsx`**

1. Tambah kolom **"Outlet"** di tabel daftar user:
   - Tampilkan nama outlet yang di-assign (badge biru) jika ada
   - Tampilkan badge abu-abu "Belum Ditugaskan" jika `market` null
   - Kolom ini hanya ditampilkan untuk baris user dengan role `SPVR` atau `GDNG`

2. Di form Create/Edit User, tambah field **"Tugaskan ke Outlet"**:
   - Dropdown berisi list dari `ProfileService.getMarketProfiles()`
   - Muncul hanya jika role yang dipilih adalah `SPVR` atau `GDNG`
   - Submit mengirim `market_id` ke `PATCH /user/update/:id`

**File dimodifikasi: `_protected._management.outlets.lazy.tsx`**

- Tambah panel/widget **"Supervisor Bertugas"** di detail setiap outlet
- Menampilkan nama supervisor yang sudah di-assign ke outlet tersebut
- Jika belum ada supervisor: tampilkan pesan "Belum ada supervisor — tugaskan dari menu Users"

---

## 7. Cetak Fingerprint (Laporan Transfer)

Dua jenis laporan cetak yang dirender client-side menggunakan `window.print()` dengan layout A4 (`@media print` CSS). Tidak memerlukan library PDF tambahan.

### Laporan A — Surat Jalan Pengiriman

**Siapa yang cetak:** GDNG / Admin  
**Kapan tersedia:** Status `WAITING_VERIFICATION` atau `DONE`

**Konten:**
- Header: nama perusahaan, nama gudang, tanggal pengiriman
- Nomor Transfer Order (ID)
- Tabel: Nama Produk | Qty Dikirim | Satuan
- Outlet tujuan + alamat outlet
- Nama pengirim (`created_by.name`)
- Kolom tanda tangan: **Pengirim** & **Penerima** (kosong, diisi manual)

### Laporan B — Bukti Penerimaan Barang

**Siapa yang cetak:** SPVR outlet  
**Kapan tersedia:** Status `DONE`

**Konten:**
- Header: nama perusahaan, nama outlet, tanggal verifikasi
- Nomor Transfer Order (ID) + tanggal kirim
- Tabel: Nama Produk | Qty Dikirim | Qty Diterima | Selisih
- Status keseluruhan: **DITERIMA PENUH** / **ADA SELISIH**
- Nama supervisor penerima (`verified_by.name`)
- Catatan penerimaan (`verified_notes`)
- Kolom tanda tangan: **Supervisor**

### Implementasi

**File baru: `src/components/markets/TransferPrintView.tsx`**

```tsx
// Komponen print-only dengan prop:
interface TransferPrintViewProps {
  type: 'delivery' | 'receipt'; // Laporan A atau B
  transfer: StockTransfer;
  onClose: () => void;
}
```

- Render halaman cetak dengan styling print-only CSS
- Memanggil `window.print()` saat komponen mount
- Terintegrasi di `TransferOrderList` (tombol "Cetak Surat Jalan") dan `OutletView` (tombol "Cetak Bukti Terima")

---

## 8. Skenario Pengujian (Verification Plan)

### End-to-End: Transfer Stok Lengkap

1. Admin buka **Users** → pilih user SPVR → tugaskan ke Outlet A → simpan ✓
2. Admin/GDNG buka **Inventory** → klik **"Kirim ke Outlet"**
3. Isi form (pilih stok: *Ikan Bandeng 50 kg*, tujuan: *Outlet A*, qty: *10 kg*) → Submit → status `SENDING`
4. Stok gudang berkurang 10 kg ✓
5. GDNG klik **"Konfirmasi Sudah Dikirim"** → status `WAITING_VERIFICATION`
6. GDNG klik **"Cetak Surat Jalan"** → browser print dialog muncul ✓
7. SPVR Outlet A login → melihat kiriman masuk di halaman Inventory
8. SPVR klik **"ACC & Terima"** → konfirmasi qty: *10 kg* → status `DONE`
9. Stok Outlet A bertambah 10 kg ✓
10. SPVR klik **"Cetak Bukti Terima"** → laporan penerimaan dicetak ✓

### Test Cases

| Skenario | Ekspektasi |
|---|---|
| Transfer qty > stok gudang | Error: "Stok gudang tidak mencukupi" |
| Cancel transfer saat `SENDING` | Stok gudang dikembalikan; status `CANCELLED` |
| SPVR verify qty < qty kiriman | Selisih tercatat di `verified_notes`; stok outlet +qty_diterima |
| SPVR tidak di-assign ke outlet | Tidak melihat kiriman ke outlet lain |
| User role bukan SPVR/GDNG | Dropdown outlet assignment di Users tidak muncul |
| Cetak sebelum `WAITING_VERIFICATION` | Tombol cetak tidak tampil |
| Transfer ke outlet tanpa supervisor | Transfer tetap bisa dibuat; SPVR bisa assign belakangan |

---

## 9. Daftar File yang Diubah / Dibuat

### Backend
| Status | File | Keterangan |
|---|---|---|
| 🆕 Baru | `db/entities/StockTransfer.js` | Entity tabel `stock_transfer` |
| 🆕 Baru | `db/migrations/1774100000000-AddStockTransfer.js` | Migrasi DB + permissions |
| ✏️ Ubah | `controllers/inventoryController.js` | +5 fungsi transfer order |
| ✏️ Ubah | `routes/product.js` | +5 route transfer order |

### Frontend
| Status | File | Keterangan |
|---|---|---|
| ✏️ Ubah | `src/services/inventory.service.ts` | +interface & +5 fungsi |
| ✏️ Ubah | `src/components/markets/TransferModal.tsx` | Ubah ke createTransferOrder |
| 🆕 Baru | `src/components/markets/TransferOrderList.tsx` | Daftar transfer + status |
| ✏️ Ubah | `src/components/markets/OutletView.tsx` | Ganti heuristic → DB transfer |
| ✏️ Ubah | `src/components/markets/GudangView.tsx` | +section pengiriman berjalan |
| 🆕 Baru | `src/components/markets/TransferPrintView.tsx` | Komponen cetak laporan |
| ✏️ Ubah | `src/routes/_protected._inventory_group.markets.tsx` | Integrasi semua fitur baru |
| ✏️ Ubah | `src/routes/_protected._management.users.lazy.tsx` | +kolom & dropdown outlet |
| ✏️ Ubah | `src/routes/_protected._management.outlets.lazy.tsx` | +widget supervisor bertugas |
