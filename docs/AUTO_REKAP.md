# Auto Recap — Rencana Implementasi

## Goal
Generate laporan rekap penjualan secara otomatis periodik (harian/mingguan/bulanan) tanpa perlu klik tombol manual.

---

## Opsi A — Fully Frontend (sederhana)

### Komponen Baru

**`src/lib/reportStore.ts`** — localStorage-based report history store.

```typescript
interface SavedReport {
  id: string;                    // "REPORT_2026_05_11"
  type: "DAILY" | "WEEKLY" | "MONTHLY";
  periodStart: string;          // "2026-05-11"
  periodEnd: string;            // "2026-05-11"
  label: string;                // "11 Mei 2026"
  htmlContent: string;          // full HTML report
  createdAt: string;            // ISO date
  totalTransactions: number;
  totalRevenue: number;
}

// Methods
saveReport(report: SavedReport): void
getReport(id: string): SavedReport | null
getReportsByType(type: string): SavedReport[]
getLatestReport(type: string): SavedReport | null
deleteReport(id: string): void
clearOldReports(maxCount: number): void  // hapus yang tertua jika melebihi batas
```

**`src/hooks/useAutoReport.ts`** — hook untuk auto-detect dan generate report periodik.

```typescript
interface UseAutoReportOptions {
  type: "DAILY" | "WEEKLY" | "MONTHLY";
  autoPrint?: boolean;
}

function useAutoReport(options: UseAutoReportOptions): {
  isGenerating: boolean;
  lastReport: SavedReport | null;
  generateNow: () => Promise<void>;
  allReports: SavedReport[];
}
```

### Alur

```
User membuka halaman laporan
  → useAutoReport di-mount
    → hitung period key berdasarkan type & tanggal hari ini
    → cek reportStore.getReport(key)
    → jika sudah ada → set lastReport, selesai
    → jika belum ada → set isGenerating = true
      → fetch transactions + products + services (parallel)
      → panggil generateReportHtml()
      → simpan ke reportStore.saveReport()
      → jika autoPrint true → panggil PrintService.printReport()
      → set isGenerating = false
```

### Integrasi di Halaman

**Halaman `/report-item`** — tambahkan toggle auto-generate:

```tsx
<div className="flex items-center gap-3">
  <select value={reportType} onChange={...}>
    <option value="DAILY">Harian</option>
    <option value="WEEKLY">Mingguan</option>
    <option value="MONTHLY">Bulanan</option>
  </select>
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" checked={autoGenerate} onChange={...} />
    Generate Otomatis
  </label>
</div>
```

**Halaman baru `Riwayat Laporan`** (atau di dalam halaman report-item):

```tsx
<div>
  <h3>Riwayat Laporan Tersimpan</h3>
  <table>
    <thead>
      <tr>
        <th>Periode</th>
        <th>Tipe</th>
        <th>Transaksi</th>
        <th>Revenue</th>
        <th>Dibuat</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>
      {reports.map(r => (
        <tr key={r.id}>
          <td>{r.label}</td>
          <td>{r.type}</td>
          <td>{r.totalTransactions}</td>
          <td>{formatRupiah(r.totalRevenue)}</td>
          <td>{r.createdAt}</td>
          <td>
            <button onClick={() => PrintService.printReport(r.htmlContent, ...)}>Cetak</button>
            <button onClick={() => deleteReport(r.id)}>Hapus</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Perubahan File

| File | Status | Perubahan |
|------|--------|-----------|
| `src/lib/reportStore.ts` | **Baru** | ~80 baris — CRUD laporan di localStorage |
| `src/hooks/useAutoReport.ts` | **Baru** | ~60 baris — hook auto-detect & generate |
| `src/routes/_protected._management.report-item.lazy.tsx` | **Edit** | ~50 baris — toggle auto-generate + riwayat laporan |

### Keterbatasan Opsi A

- **Tidak ada true scheduling** — hanya trigger saat user membuka halaman
- **localStorage terbatas** (~5MB) — perlu `clearOldReports()` untuk mencegah penuh
- **Tidak lintas device** — laporan hanya tersimpan di browser user
- **Data bisa basi** — jika ada transaksi baru setelah halaman di-load, report tidak otomatis ter-update

---

## Opsi B — Backend Scheduler (proper)

### Backend — Komponen Baru

**Tabel database:**

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  label VARCHAR(100) NOT NULL,
  html_content TEXT NOT NULL,
  transaction_count INTEGER DEFAULT 0,
  total_revenue NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(type, period_start, period_end)
);
```

**Endpoint API:**

| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/reports` | Daftar semua laporan (filter: type, period) |
| `GET` | `/reports/:id` | Detail laporan + html_content |
| `POST` | `/reports/generate` | Trigger generate manual (body: type) |
| `DELETE` | `/reports/:id` | Hapus laporan |

**Cron job** (dijalankan scheduler external / cron-job.org):

```
SETEL 0 0 * * *   → generate DAILY (hari sebelumnya)
SETEL 0 0 * * 0   → generate WEEKLY (minggu sebelumnya)
SETEL 0 0 1 * *   → generate MONTHLY (bulan sebelumnya)
```

Cron job logic:
```
1. Hitung period_start dan period_end berdasarkan type
2. Fetch transaksi dalam periode (TransactionService.getTransactions)
3. Fetch product details + service details
4. Panggil generateReportHtml()
5. Simpan ke tabel reports (upsert by type + period)
```

### Frontend — Komponen Baru

**`src/services/report.service.ts`** — tambah method:

```typescript
getSavedReports(type?: string): Promise<SavedReport[]>
getReportById(id: string): Promise<SavedReport>
generateReport(type: "DAILY" | "WEEKLY" | "MONTHLY"): Promise<SavedReport>
deleteReport(id: string): Promise<void>
```

**Halaman baru `Riwayat Laporan`** (route `/reports`):

- Tabel semua laporan yang sudah di-generate
- Filter by type (harian/mingguan/bulanan)
- Tombol "Generate Sekarang" untuk trigger manual
- Tombol "Cetak" → `PrintService.printReport(html, title)`
- Tombol "Hapus"
- Info: total transaksi, revenue, tgl generate

### Perubahan File

| File | Status | Perubahan |
|------|--------|-----------|
| Backend — migration baru | **Baru** | Tabel `reports` |
| Backend — `ReportController` | **Baru** | CRUD endpoints |
| Backend — `ReportService` | **Baru** | Generate + cron logic |
| Backend — cron job config | **Baru** | Scheduler |
| `src/services/report.service.ts` | **Edit** | +3 method API |
| `src/components/reports/ReportHistory.tsx` | **Baru** | Tabel riwayat |
| `src/routes/_protected.reports.lazy.tsx` | **Baru** | Halaman laporan tersimpan |
| `src/routes/_protected.tsx` | **Edit** | Tambah route `/reports` |

---

## Opsi C — Hybrid (Service Worker)

### Konsep

Gunakan **Service Worker** untuk background sync tanpa perlu cron backend.

```
Service Worker register
  → install event: simpan jadwal (daily 08:00, weekly Monday, monthly 1st)
  → saat waktunya tiba (via setTimeout / periodic sync):
    → fetch data dari API
    → generate HTML
    → simpan ke IndexedDB
    → (opsional) tampilkan notifikasi "Laporan harian siap dicetak"
```

### Komponen

| File | Fungsi |
|------|--------|
| `sw.ts` | Service Worker — scheduler + generate + IndexedDB |
| `src/lib/reportIDB.ts` | IndexedDB wrapper untuk laporan |
| `public/sw.js` | Compiled service worker |

### Kelebihan

- Bekerja meski user tidak membuka app (terbatas)
- IndexedDB kapasitas besar (hampir unlimited)
- Background sync (browser API)

### Kekurangan

- Service Worker punya umur terbatas (browser bisa terminate)
- Periodic Sync API belum didukung semua browser
- Kompleksitas implementasi lebih tinggi

---

## Rekomendasi

| Kriteria | Opsi A | Opsi B | Opsi C |
|----------|--------|--------|--------|
| Backend changes | ✗ | ✓ | ✗ |
| True scheduling | ✗ | ✓ | ~ |
| Lintas device | ✗ | ✓ | ✗ |
| Kapasitas | ~5MB | Unlimited | Hampir unlimited |
| Kompleksitas | Rendah | Tinggi | Tinggi |
| Waktu implementasi | 1-2 hari | 3-5 hari | 3-5 hari |

**Mulai dengan Opsi A** karena zero backend, cepat, dan sudah cukup untuk kebutuhan dasar. Ke depannya bisa upgrade ke Opsi B dengan mengganti `reportStore` dari localStorage jadi API call tanpa mengubah komponen UI.
