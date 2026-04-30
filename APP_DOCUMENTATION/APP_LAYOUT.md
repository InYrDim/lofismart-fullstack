# Application Layout Structure

Dokumen ini mendefinisikan arsitektur layout tingkat tinggi yang digunakan dalam aplikasi Lofishmart. Struktur ini dirancang untuk memberikan navigasi yang efisien dan akses cepat ke informasi detail tanpa meninggalkan konteks halaman utama.

## 1. Sidebar Kiri (Navigasi Utama)
- **Tujuan**: Menu navigasi utama aplikasi.
- **Perilaku**: Berisi tautan ke modul-modul utama seperti Dashboard, Manajemen, Inventory, POS, Riwayat Transaksi, dan Pengaturan.
- **Aksesibilitas**: Dapat diciutkan (collapsed) untuk memperluas area kerja utama.

## 2. Area Tengah (Workspace Utama)
Area ini merupakan pusat interaksi aplikasi yang terbagi secara vertikal menjadi dua bagian:

### A. Header
- **Tujuan**: Menampilkan informasi kontekstual halaman, bar pencarian, aksi global (seperti Refresh, Pengaturan Perangkat, atau Toggle Keranjang), dan branding.
- **Posisi**: Berada di bagian paling atas dari area tengah.

### B. Konten (Kontainer Data)
- **Tujuan**: Workspace utama tempat data ditampilkan dan dikelola (misal: Tabel Data Transaksi, Katalog Produk POS).
- **Perilaku**: Responsif dan mengisi sisa ruang yang tersedia di antara sidebar kiri dan kanan.

## 3. Sidebar Kanan (Expandable Sidebar)
- **Tujuan**: Menampilkan informasi detail, menu tambahan, atau fungsionalitas pendukung lainnya yang bersifat kontekstual terhadap item yang dipilih di area konten.
- **Perilaku**: Sidebar yang bersifat fleksibel (bisa dibuka/tutup). Terletak di sisi paling kanan layar.
- **Contoh Penggunaan**: 
  - **Transaction Detail Sidebar**: Menampilkan rincian barang dalam satu transaksi.
  - **Cart Sidebar**: Menampilkan daftar belanjaan di halaman POS.

---
*Layout ini harus dipertahankan secara konsisten di seluruh aplikasi untuk menjaga pengalaman pengguna (UX) yang seragam.*
