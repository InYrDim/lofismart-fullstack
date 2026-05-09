# Serial / Weight Scale API Specification

## 1. Backend REST API — Weight Scale CRUD

Base URL: `/api`

### Entity: `weight_scale`

| Field      | Type                   | Description                                          |
| ---------- | ---------------------- | ---------------------------------------------------- |
| `id`       | int (unsigned, PK, auto) |                                                      |
| `name`     | varchar(30)            | Nama device timbangan                                |
| `status`   | enum('1','2','3')      | `1` = active connect, `2` = disconnect, `3` = non active |
| `mac_ip`   | varchar(30), nullable  | MAC address atau IP device                           |
| `created_at` | timestamp            | Auto                                                 |
| `updated_at` | timestamp            | Auto                                                 |

### Endpoints

#### List Semua Device Timbangan

```
GET /weight-scale-list
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Timbangan 1",
    "status": "1",
    "mac_ip": "192.168.1.100",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

#### Tambah Device Timbangan Baru

```
POST /weight-scale-create
```

**Request Body:**
```json
{
  "name": "Timbangan 1",
  "status": "1",
  "mac_ip": "192.168.1.100"
}
```

**Response:** `200 OK` — Mengembalikan entity yang baru dibuat.

#### Update Device Timbangan

```
PATCH /weight-scale-update/:id
```

**Request Body:** (partial update)
```json
{
  "name": "Timbangan Updated",
  "status": "2"
}
```

**Response:** `200 OK` — Mengembalikan entity yang sudah di-update.

**Error:** `404 Not Found` — Jika `id` tidak ditemukan.
```json
{ "message": "Data not found" }
```

#### Hapus Device Timbangan

```
GET /weight-scale-delete/:id
```

**Response:** `200 OK`
```json
{ "message": "Data deleted successfully" }
```

**Error:** `404 Not Found`
```json
{ "message": "Data not found" }
```

### Error Format (Server Error)

```json
{ "message": "<error message>" }
```

---

## 2. Web Serial API (Client-Side) — Real-time Scale Reading

Tidak menggunakan REST API. Menggunakan **Web Serial API** bawaan browser (`navigator.serial`) untuk koneksi langsung ke device timbangan via USB/serial port.

### Sumber Kode

| File                                                                  | Deskripsi                                  |
| --------------------------------------------------------------------- | ------------------------------------------ |
| `lofishmart-frontend/src/context/SerialContext.ts`                    | Interface `SerialPort` dan `SerialContextType` |
| `lofishmart-frontend/src/context/SerialProvider.tsx`                  | Provider koneksi serial (connect, read, parse, send) |
| `lofishmart-frontend/src/hooks/useSerial.ts`                          | Hook untuk mengakses SerialContext         |
| `lofishmart-frontend/src/components/ScaleListener.tsx`                | Listener data timbangan, auto-add ke cart & kirim harga balik |
| `lofishmart-frontend/src/components/ui/modals/SerialSettingsModal.tsx` | UI setting baud rate, connect/disconnect   |
| `lofishmart-frontend/src/components/PosHeader.tsx`                    | Indikator status koneksi (hijau/merah)     |

### Konfigurasi Koneksi

- **Default baud rate:** 115200
- **Data encoding:** UTF-8 (via `TextDecoderStream`)
- **Buffer:** Partial data diakumulasi, diproses per line (`\n`)

### Format Data dari Timbangan

Device mengirim data sebagai **JSON object per line** (`\n`-delimited):

```typescript
interface ScaleData {
  itemCode: string;   // Barcode produk
  weight: number;     // Berat dalam kg
  price: number;      // Harga
  status: boolean;    // Apakah data valid
  scaleId: string;    // ID device timbangan
}
```

**Contoh data dari timbangan:**
```json
{"itemCode":"8991234567890","weight":1.5,"price":75000,"status":true,"scaleId":"scale-01"}
```

### Alur Pembacaan & Respon Harga

1. User mengklik "Connect" → `navigator.serial.requestPort()` (browser menampilkan dialog pilih port)
2. Port dibuka dengan `baudRate` yang dikonfigurasi
3. Data dibaca via `ReadableStream`, di-decode ke string UTF-8
4. Buffer diakumulasi, di-split per `\n`
5. Setiap line yang berupa JSON (`{...}`) divalidasi terhadap `ScaleData`
6. Jika valid → `setScaleData(parsed)` → `ScaleListener` mendeteksi perubahan
7. `ScaleListener` mencari produk dengan `barcode === scaleData.itemCode`, lalu memanggil `addScaleItem(product, weight)`
8. Item ditambahkan ke cart dengan `source: "serial"` dan `measuredWeight`
9. `ScaleListener` mengirim data produk sebagai **JSON** ke perangkat serial via `send(JSON.stringify(response))`

### Type Definitions (Frontend)

```typescript
// lofishmart-frontend/src/types/index.ts
interface ScaleData {
  itemCode: string;
  weight: number;
  price: number;
  status: boolean;
  scaleId: string;
}

// lofishmart-frontend/src/context/SerialContext.ts
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;       // Untuk mengirim data
}

interface SerialContextType {
  isConnected: boolean;
  isConnecting: boolean;
  baudRate: number;
  setBaudRate: (rate: number) => void;
  lastData: string;
  scaleData: ScaleData | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  send: (data: string | number) => Promise<void>;    // Kirim data ke serial
  clearData: () => void;
  clearScaleData: () => void;
}
```

---

## 3. Bidirectional Communication — Mengirim Data ke Perangkat Serial

### Method `send`

Frontend dapat mengirim data kembali ke perangkat serial melalui method `send` yang tersedia di `SerialContext`.

```typescript
type SendFn = (data: string | number) => Promise<void>;
```

### Implementasi (`SerialProvider.tsx`)

```typescript
const send = useCallback(async (data: string | number) => {
  const port = portRef.current;
  if (!port?.writable) {
    throw new Error("Port serial tidak terhubung atau tidak dapat ditulisi.");
  }

  const writer = port.writable.getWriter();
  try {
    const encoded = new TextEncoder().encode(String(data) + "\n");
    await writer.write(encoded);
  } finally {
    writer.releaseLock();
  }
}, []);
```

### Format Respon JSON

Setelah produk ditemukan, frontend mengirim data produk sebagai **JSON object** ke perangkat serial:

```json
{
  "name": "Ikan Kakap Merah",
  "code": "8991234567890",
  "base_price": 50000,
  "total_price": 75000,
  "weight": 1.5
}
```

| Field          | Tipe   | Deskripsi                                    |
| -------------- | ------ | -------------------------------------------- |
| `name`         | string | Nama produk                                  |
| `code`         | string | Barcode / kode produk                       |
| `base_price`   | number | Harga dasar per kg                           |
| `total_price`  | number | Harga setelah dikalkulasi (`basePrice × weight`) |
| `weight`       | number | Berat produk dari timbangan (kg)             |

### Alur Pengiriman Data

```
ScaleListener (produk ditemukan)
  └── response = { name, code, base_price, total_price, weight }
       └── send(JSON.stringify(response))
            └── port.writable.getWriter()
                 └── TextEncoder.encode(jsonString + "\n")
                      └── writer.write(encoded)
```

### Contoh Pemanggilan

```typescript
// ScaleListener.tsx — setelah produk ditemukan
const response = {
  name: product.name,
  code: product.barcode,
  base_price: product.basePrice,
  total_price: product.basePrice * roundedWeight,
  weight: roundedWeight,
};
send(JSON.stringify(response)).catch((err) => {
  logger.error("Gagal mengirim data ke serial:", err);
});
```

### Catatan Pengiriman

- Data dikirim sebagai **UTF-8 JSON string** dengan delimiter `\n`
- `total_price` = `base_price × weight` — sinkron dengan subtotal item di keranjang
- Gunakan `.catch()` karena `send` bersifat **fire-and-forget** (tidak blocking aliran utama)
- Error terjadi jika port terputus atau `writable` tidak tersedia

---

### Status Koneksi

| State           | Keterangan                          |
| --------------- | ----------------------------------- |
| `isConnected`   | Port serial sedang terhubung        |
| `isConnecting`  | Proses koneksi sedang berlangsung   |
| `error`         | Pesan error jika koneksi gagal      |

### Catatan

- **Browser support:** Hanya browser berbasis Chromium yang mendukung Web Serial API.
- **Keamanan:** Web Serial API hanya bisa digunakan di **HTTPS** atau `localhost`.
- Frontend **belum** mengonsumsi REST API weight-scale endpoints di atas. CRUD device hanya ada di backend.
- Tidak ada service file (`src/services/`) khusus untuk weight-scale di frontend saat ini.
- Komunikasi serial bersifat **bidirectional** — timbangan mengirim `ScaleData` (JSON), frontend merespon dengan data produk (JSON + `\n`).
