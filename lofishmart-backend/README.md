<div align="center">

# Lofish Market API

**Backend RESTful API untuk sistem manajemen pasar ikan**

</div>

---

## 📖 Dokumentasi

Semua dokumentasi teknis telah dipindahkan ke folder `docs/` untuk menjaga keteraturan project:

- [**Database Schema**](docs/DATABASE_SCHEMA.md) — Struktur tabel, relasi, dan dokumentasi database.
- [**Aturan Bisnis (Rules)**](docs/RULES.md) — Logika bisnis, validasi, dan aturan sistem.
- [**Referensi**](docs/REFERENCES.md) — Informasi tambahan dan referensi pengembangan.

---

## 🚀 Memulai (Quick Start)

### Instalasi
```bash
npm install
```

### Konfigurasi
Salin `.env.example` menjadi `.env` dan sesuaikan kredensial database Anda.

### Database
```bash
npm run migration
```

### Menjalankan Server
```bash
npm start
```

---

## 🛠️ Tech Stack Utama
- **Node.js** & **Express**
- **TypeORM** & **MySQL**
- **Winston** (Logging)
- **JWT** (Authentication)

---

## 📁 Struktur Folder Utama
- `bin/`: Entry point HTTP server.
- `config/`: Konfigurasi database, logger, dan library.
- `controllers/`: Logika utama setiap resource API.
- `db/`: Entity database dan file migrasi.
- `docs/`: Dokumentasi teknis project.
- `middleware/`: Auth, error handling, dan utility middleware.
- `routes/`: Definisi endpoint API.

---

## 📜 Lisensi
Private — Hak cipta dilindungi.
