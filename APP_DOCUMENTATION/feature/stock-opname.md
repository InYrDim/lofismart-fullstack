# Feature: Stock Opname (Audit Stok Fisik)

## 1. Pendahuluan
Stock Opname adalah fitur untuk mencocokkan stok yang tercatat di sistem dengan jumlah fisik yang ada di lokasi (Gudang/Market). Fitur ini krusial untuk menjaga akurasi data inventaris dari penyusutan, kerusakan, atau kehilangan.

## 2. Alur Pengguna (User Flow)
1. **Inisialisasi**: Supervisor/Admin membuka sesi opname baru untuk lokasi tertentu (Market/Gudang). Status: `DRAFT`.
2. **Perhitungan (Counting)**: Petugas lapangan menginput jumlah fisik barang yang ditemukan.
   - Sistem menampilkan `Stok Sistem` (Current Stock).
   - Petugas memasukkan `Stok Fisik` (Actual Stock).
   - Sistem menghitung `Selisih` (Missing Stock).
   - Petugas mengunggah foto bukti jika ada kerusakan/kejanggalan.
3. **Peninjauan (Reviewing)**: Supervisor meninjau daftar selisih.
4. **Finalisasi (Approving)**: Supervisor menekan tombol "Setujui & Sinkronisasi".
   - Sistem merubah status sesi menjadi `APPROVED`.
   - Sistem secara otomatis memperbarui tabel `Stock` utama agar sesuai dengan hitungan fisik.

## 3. Desain Database
Fitur ini menggunakan dua tabel utama:
- `stock_opname`: Header sesi (ID, Tanggal, Lokasi, Status, Approver).
- `stock_opname_detail`: Detail per item produk (ID Sesi, ID Produk, Stok Sistem, Stok Fisik, Selisih, Alasan, Bukti Foto).

## 4. Rencana Implementasi Teknis

### A. Backend (APIs)
- `POST /product/stock-opname/create`: Membuat sesi baru.
- `GET /product/stock-opname/list`: Menampilkan daftar sesi opname.
- `POST /product/so-detail/create`: Menambahkan item hitungan ke sesi.
- **`POST /product/stock-opname/approve/:id` (NEW)**:
  - Validasi status (hanya draft yang bisa diapprove).
  - Mulai Database Transaction.
  - Loop semua detail di sesi tersebut.
  - Update `Stock.qty` berdasarkan `actual_stock`.
  - Log perubahan jika perlu.
  - Commit Transaction.

### B. Frontend (UI)
- **Akses Menu**: Dapat diakses melalui sidebar **Inventory -> Audit Stok (Opname)**.
- **Halaman Daftar Sesi**: Melihat riwayat opname dan statusnya.

- **Halaman Detail Sesi**:
  - UI Input Per Item (Cari produk -> Tampil stok sistem -> Input stok fisik).
  - Indikator warna untuk selisih (Merah jika kurang, Hijau jika lebih).
  - Fitur upload foto untuk bukti barang rusak/hilang.
- **Tombol Action**: "Selesaikan Hitungan" dan "Approve & Sinkronkan" (khusus Admin/SPVR).

## 5. Kesimpulan
Dengan fitur ini, sinkronisasi stok tidak lagi dilakukan secara manual "tembak database", melainkan melalui proses audit yang memiliki rekam jejak yang jelas.
