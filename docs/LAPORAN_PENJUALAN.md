# Laporan Penjualan — Comprehensive Report Print

## Goal
Buat fitur cetak laporan penjualan komprehensif di halaman **Laporan per Item** (`/_protected/_management/report-item`), dengan data produk + layanan yang di-group per transaksi, ringkasan KPI, dan dicetak via tombol "Cetak Laporan".

---

## Rencana Implementasi

### Langkah 1: Buat Report Print Template

**File baru:** `src/lib/reportPrintTemplate.ts`

Template HTML lengkap dengan inline CSS untuk cetak A4/letter.

#### Struktur template:

```
┌─────────────────────────────────────────────┐
│  [LOGO]   NAMA PERUSAHAAN                   │
│           Alamat                             │
│           Telp                               │
├─────────────────────────────────────────────┤
│         LAPORAN PENJUALAN                    │
│         Periode: 01 - 31 Mei 2026            │
├─────────────────────────────────────────────┤
│  Outlet: Lofish Mart                         │
│  Dicetak oleh: Admin                         │
│  Tanggal Cetak: 11 Mei 2026 14:30            │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐                  │
│  │Transaksi │  │   Qty    │                  │
│  │   150    │  │  1.250   │                  │
│  └──────────┘  └──────────┘                  │
│  ┌──────────┐  ┌──────────┐                  │
│  │  Berat   │  │ Revenue  │                  │
│  │ 320.5 kg │  │Rp50.000k │                  │
│  └──────────┘  └──────────┘                  │
├─────────────────────────────────────────────┤
│  Rincian Pembayaran:                         │
│  ┌──────────────────────┬──────────┐         │
│  │ Tunai                │Rp30.000k │         │
│  │ Transfer             │Rp15.000k │         │
│  │ QRIS                 │Rp 5.000k │         │
│  ├──────────────────────┼──────────┤         │
│  │ Total                │Rp50.000k │         │
│  └──────────────────────┴──────────┘         │
├─────────────────────────────────────────────┤
│  Rincian per Transaksi:                      │
│                                              │
│  ── TRX-001 ──                               │
│  Kasir: Andi  |  Pel: Umum  |  Tunai         │
│  Tgl: 11 Mei 2026 10:30  |  Lunas            │
│                                              │
│  PRODUK:                                     │
│  ┌──────────┬───┬──────┬───────┬──────┐      │
│  │ Produk   │Qty│Berat │Harga  │Total │      │
│  ├──────────┼───┼──────┼───────┼──────┤      │
│  │ Salair A │ 2 │1.5kg │Rp50k  │Rp100k│      │
│  │ Bandeng B│ 1 │0.8kg │Rp40k  │Rp40k │      │
│  └──────────┴───┴──────┴───────┴──────┘      │
│                                              │
│  LAYANAN:                                    │
│  ┌──────────┬───┬───────┬──────┐             │
│  │ Layanan  │Qty│Harga  │Total │             │
│  ├──────────┼───┼───────┼──────┤             │
│  │ Service#1│ 1 │Rp10k  │Rp10k │             │
│  └──────────┴───┴───────┴──────┘             │
│  Subtotal: Rp150k                            │
│                                              │
│  ── TRX-002 ── (dst...)                      │
├─────────────────────────────────────────────┤
│  GRAND TOTAL                                 │
│  Total Qty: 1.250 pcs                        │
│  Total Berat: 320.5 kg                       │
│  Total Revenue: Rp50.000.000                 │
├─────────────────────────────────────────────┤
│  Footer:                                     │
│  Dicetak pada: 11/05/2026 14:30              │
│                                              │
│  ___________     ___________                  │
│  Mengetahui     Pencetak                     │
└─────────────────────────────────────────────┘
```

#### Fungsi utama:

```typescript
interface ReportPrintParams {
  products: SellingProductDetail[];
  services: SellingServiceDetail[];
  dateRange: string;
  marketName: string;
  userName: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  printDate: string;
}

function generateReportHtml(params: ReportPrintParams): string
```

Output: string HTML dengan styling inline, siap di-print via `window.print()`.

**Internal helpers:**
- `groupBySellingId(items)` → group array items by `selling_id`
- `renderTransactionBlock(sellingId, products, services)` → HTML per transaksi
- `renderProductTable(products)` → HTML tabel produk
- `renderServiceTable(services)` → HTML tabel layanan
- `calculateGrandTotals(products, services)` → total qty, berat, revenue

---

### Langkah 2: Perbarui PrintService

**File:** `src/services/print.service.ts`

Tambah method public:

```typescript
printReport: (htmlContent: string, title: string) => void
```

Method ini membuka window baru, inject HTML konten + styles Tailwind/css, lalu trigger `window.print()` + `window.close()`.

Pattern: reuse logika `_printFullPage` yang sudah ada.

---

### Langkah 3: Perbarui ReportService

**File:** `src/services/report.service.ts`

Tambah method:

```typescript
printComprehensiveReport(
  products: SellingProductDetail[],
  services: SellingServiceDetail[],
  params: {
    dateRange: string;
    marketName: string;
    userName: string;
    company?: { name: string; address: string; phone: string };
    filterType: string;
  }
): void
```

Alur:
1. Hitung KPI dari `products` (total qty, total weight, total revenue)
2. Hitung unique transaction count dari `products` + `services`
3. Hitung breakdown per payment method dari `products` (via `selling_payment_name`)
4. Panggil `generateReportHtml()` dengan semua parameter
5. Panggil `PrintService.printReport(html, title)`

---

### Langkah 4: Update Halaman Report-Item

**File:** `src/routes/_protected._management.report-item.lazy.tsx`

**Perubahan:**

1. **Tambah state untuk services:**
   ```typescript
   const [services, setServices] = useState<SellingServiceDetail[]>([]);
   ```

2. **Tambah fetch services paralel di `fetchDetails`:**
   ```typescript
   const [prodData, svcData] = await Promise.all([
     TransactionService.getSellingProductDetails({...}),
     TransactionService.getServiceDetails(marketId, startDate, endDate),
   ]);
   setDetails(prodData);
   setServices(svcData);
   ```

3. **Ganti tombol "Export" jadi "Cetak Laporan":**
   ```tsx
   <Button
     variant="outline"
     size="sm"
     className="h-9 gap-2"
     onClick={handlePrintReport}
     disabled={loading || details.length === 0}
   >
     <Printer className="w-4 h-4" /> Cetak Laporan
   </Button>
   ```

4. **Handler print:**
   ```typescript
   const handlePrintReport = () => {
     const user = AuthService.getCurrentUser();
     ReportService.printComprehensiveReport(filteredDetails, services, {
       dateRange: `${format(new Date(startDate), "dd MMM yyyy")} - ${format(new Date(endDate), "dd MMM yyyy")}`,
       marketName: selectedMarket === "all" ? "Semua Outlet" : selectedMarket,
       userName: user?.name || "Admin",
       filterType,
     });
   };
   ```

---

### Langkah 5: Test & Verifikasi

1. Buka halaman `/report-item`
2. Filter data (Hari Ini / Minggu Ini / Bulan Ini)
3. Klik "Cetak Laporan"
4. Verify: window print muncul dengan:
   - Company header
   - KPI sesuai data
   - Ringkasan per metode bayar
   - Daftar transaksi dengan produk & layanan
   - Grand total
   - Footer
5. Verify: setelah print dialog OK/close, window tertutup otomatis

---

## Ringkasan Perubahan File

| File | Status | Perubahan |
|------|--------|-----------|
| `src/lib/reportPrintTemplate.ts` | **Baru** | ~280 baris — template HTML laporan |
| `src/services/print.service.ts` | **Edit** | +10 baris — tambah method `printReport()` |
| `src/services/report.service.ts` | **Edit** | +70 baris — tambah method `printComprehensiveReport()` |
| `src/routes/_protected._management.report-item.lazy.tsx` | **Edit** | ~40 baris — fetch services, ganti tombol, handler print |

---

## Catatan

- **CSS:** Semua inline dalam template — tidak bergantung pada Tailwind saat print
- **Print method:** `window.print()` via popup — perlu izin popup browser
- **Data services:** Di-fetch paralel dengan produk — tidak nambah latency signifikan
- **Group by transaksi:** Produk & services punya `selling_id` yang bisa dicocokkan
