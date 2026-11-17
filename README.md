# SisaJadi — Marketplace Bahan Sisa Produksi Berkelanjutan

**SisaJadi** adalah platform digital berbasis ekonomi sirkular yang mempertemukan pelaku usaha percetakan dan konveksi/garmen dengan para pengrajin (*crafters*) serta mahasiswa untuk memanfaatkan kembali bahan sisa produksi yang masih bernilai guna.

Repository ini menggunakan arsitektur **Monorepo** yang mencakup aplikasi web, server REST API, serta skema data terpusat.

---

## Arsitektur Ekosistem & Tech Stack

| Modul / Repository | Teknologi Utama | Peran dalam Sistem |
| :--- | :--- | :--- |
| **`sisajadi-frontend`** | React.js (Vite), Tailwind CSS, Axios, Lucide Icons, Socket.io Client | Antarmuka web responsif untuk pembeli (*crafter*/mahasiswa) dan dashboard mitra industri. |
| **`sisajadi-backend`** | Node.js, Express.js, Socket.io, JWT, Multer / Cloudinary | Pusat logika bisnis, RESTful API (`/api/v1`), autentikasi, dan server chat negosiasi *real-time*. |
| **`sisajadi-data`** | SQL / Prisma Schema, JSON Seeder, OpenAPI / Postman Collection | Skema database (ERD), data *dummy* awal, dan kontrak spesifikasi API lintas platform. |
| **`sisajadi-mobile`** *(Repo Terpisah)* | Flutter (Dart), Dio, Socket.io Client | Aplikasi mobile Android & iOS yang mengonsumsi REST API dan Socket.io dari `sisajadi-backend`. |

### Identitas Visual & Design Tokens
* **Primary Color (Forest Green):** `#1A5235`
* **Accent Color (Warm Orange):** `#D96B27`
* **Background Surface:** `#F8FAFC` / `#FFFFFF`
* **Typography:** `Plus Jakarta Sans`

---

## Struktur Direktori

```text
sisajadi-website/
├── .github/
│   └── CODEOWNERS               # Pengaturan hak persetujuan Pull Request per role/folder
├── frontend/           # Proyek React.js + Tailwind CSS
│   ├── public/
│   └── src/
│       ├── assets/              # Logo resmi SJ & aset grafis
│       ├── components/          # Komponen UI modular (common, layout, marketplace)
│       ├── context/             # Global state (AuthContext, CartContext)
│       ├── hooks/               # Custom hooks (useMaterials, useSocket)
│       ├── pages/               # Halaman (auth, public, buyer, seller)
│       ├── routes/              # Konfigurasi routing & ProtectedRoute per role
│       ├── services/            # Konfigurasi instance Axios & Socket.io
│       └── utils/               # Helper format mata uang, satuan berat, & tanggal
├── backend/            # Proyek Node.js + Express
│   └── src/
│       ├── config/              # Koneksi database, Cloudinary, & payment gateway
│       ├── controllers/         # Handler HTTP request & response
│       ├── middlewares/         # JWT Auth, Multer upload, error & response handler
│       ├── models/              # Definisi tabel/model database
│       ├── routes/              # Grouping endpoint REST API (/api/v1)
│       ├── services/            # Logika bisnis utama
│       └── utils/               # Helper token, enkripsi, & logger
├── data/               # Dokumentasi kontrak API, skema ERD, & data seeder
├── .gitignore                   # Aturan pengabaian file sensitif & build di seluruh subfolder
└── README.md                    # Dokumentasi utama proyek
```

---

## Fitur Utama Platform

### 1. Sisi Pembeli (Crafter & Mahasiswa)
* **Katalog & Filter Spesifik Bahan Sisa:** Pencarian berdasarkan kategori (*Kain Konveksi, Kertas Percetakan, Akrilik & Plastik, Kayu, Logam*), kondisi potongan, lokasi mitra, dan minimal pembelian (`kg`, `lembar`, `roll`, `meter`).
* **Chat & Negosiasi Real-Time:** Diskusi langsung dengan penjual untuk menanyakan ukuran pasti potongan bahan atau mengajukan pembelian borongan.
* **Checkout & Opsi Logistik Fleksibel:** Mendukung pengambilan langsung di lokasi mitra (*Pick-up*), kurir lokal instan, maupun ekspedisi kargo untuk pembelian berat.
* **Eco-Impact Tracker:** Kalkulasi otomatis total berat (kg) limbah produksi yang berhasil diselamatkan dari setiap transaksi.

### 2. Sisi Mitra Industri (Percetakan & Konveksi)
* **Dashboard Mitra:** Ringkasan total bahan sisa terjual, pendapatan, pesanan masuk, dan status ketersediaan stok.
* **Manajemen Stok Bahan Sisa:** Unggah multi-foto bahan, spesifikasi gramasi/dimensi, pengaturan harga per satuan, dan status stok.
* **Pemrosesan Pesanan:** Konfirmasi pesanan masuk, koordinasi jadwal pengambilan/pengiriman, dan riwayat transaksi.

---

## Panduan Menjalankan Proyek di Lokal

### Prasyarat Sistem
* **Node.js** versi `18.x` atau lebih baru
* **npm** (bawaan Node.js)
* **Database Server** (MySQL / PostgreSQL) aktif di lokal
* **Git**

### 1. Clone Repository
```bash
git clone [https://github.com/sisajadi-id/sisajadi-website.git](https://github.com/sisajadi-id/sisajadi-website.git)
cd sisajadi-website
```

### 2. Konfigurasi Database (`sisajadi-data`)
1. Buat database baru di server database lokal dengan nama `sisajadi_db`.
2. Jalankan skema migrasi / file SQL yang tersedia di folder `sisajadi-data/` untuk membuat struktur tabel dan data awal (*seeder*).

### 3. Jalankan Backend (`sisajadi-backend`)
Buka terminal pertama, masuk ke folder backend, dan siapkan variabel environment:
```bash
cd sisajadi-backend
cp .env.example .env
npm install
```
Sesuaikan konfigurasi di dalam file `sisajadi-backend/.env`:
```env
PORT=5000
DATABASE_URL=mysql://root:@localhost:3306/sisajadi_db
JWT_SECRET=ganti_dengan_kunci_rahasia_jwt
CLIENT_URL=http://localhost:5173
```
Jalankan server backend:
```bash
npm run dev
```
Server REST API dan Socket.io aktif di `http://localhost:5000`.

### 4. Jalankan Frontend (`sisajadi-frontend`)
Buka terminal kedua dari direktori root proyek:
```bash
cd sisajadi-frontend
cp .env.example .env
npm install
```
Pastikan isi `sisajadi-frontend/.env` mengarah ke server backend lokal:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```
Jalankan aplikasi web:
```bash
npm run dev
```
Aplikasi web dapat diakses melalui browser di `http://localhost:5173`.

---

## Standar Integrasi API (Web, Backend & Mobile)

Seluruh komunikasi data antara `sisajadi-frontend`, `sisajadi-backend`, dan `sisajadi-mobile` wajib mematuhi standar berikut:

1. **Prefix Endpoint:** Seluruh route REST API menggunakan awalan `/api/v1/...`.
2. **Format Response JSON Baku:**
   ```json
   {
     "success": true,
     "message": "Daftar bahan sisa berhasil dimuat",
     "data": [],
     "meta": {
       "page": 1,
       "limit": 12,
       "total_items": 48
     }
   }
   ```
3. **Konsistensi Tipe Data:** Nilai harga, stok, dan berat wajib dikirim sebagai tipe numerik murni (`number`), bukan `string`. Field kosong dikirim eksplisit sebagai `null`.
4. **Autentikasi Universal:** Menggunakan HTTP Header `Authorization: Bearer <token>` pada setiap *endpoint* terproteksi.
5. **Format Waktu & Media:** Seluruh *timestamp* menggunakan standar **ISO 8601 UTC** dan URL gambar wajib menggunakan *absolute URL*.

---

## Aturan Kolaborasi & Git Workflow

1. **Proteksi Branch Utama:**
   * `main`: Kode siap rilis (*production*). Terkunci penuh dan hanya menerima *merge* dari `develop` melalui Pull Request.
   * `develop`: Cabang utama integrasi pengujian antar-fitur. Dilarang melakukan `git push` langsung ke `main` maupun `develop`.
2. **Penamaan Branch Fitur & Perbaikan:**
   * Frontend Web: `feat/web-<nama-fitur>` (contoh: `feat/web-katalog-filter`)
   * Backend API: `feat/api-<nama-fitur>` (contoh: `feat/api-auth-jwt`)
   * Database & Docs: `feat/data-<nama-perubahan>` (contoh: `feat/data-erd-orders`)
   * Perbaikan Bug: `fix/<scope>-<nama-bug>`
3. **Urutan Perubahan Kontrak API:** Setiap penambahan atau perubahan *endpoint* wajib diperbarui terlebih dahulu di `sisajadi-data/`, diimplementasikan di `sisajadi-backend/`, lalu diintegrasikan ke `sisajadi-frontend/` dan `sisajadi-mobile`.
4. **Keamanan Kredensial:** Dilarang melakukan *commit* file `.env`, kunci privat, atau folder `node_modules/`. Gunakan `.env.example` untuk mendaftarkan nama variabel baru.
