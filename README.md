# Penerbangan Big Data

Projek ini mengolah data keterlambatan penerbangan berskala besar dengan Python. Hasilnya dipakai untuk melatih model yang memprediksi **kelas kompensasi keterlambatan (PM 89/2015)**, lalu ditampilkan di web Next.js.

Dibuat oleh **Kelompok 2 MKOM Universitas Budi Luhur**, mata kuliah Manajemen Big Data & Analitik Bisnis:

- Recky Arisenta
- Izvio Prijaya Mumin
- Safira Alisha Aqista

> Detail produk: [PRD.md](PRD.md) · Aturan tampilan: [UI_RULES.md](UI_RULES.md)

## Cara Kerja Aplikasi

```
Data mentah BTS (CSV, 2024–2025, ±14 juta baris)
  → Google Colab: CSV → Parquet di Google Drive (PySpark / DuckDB)
  → Bersihkan + buat fitur + label kelas kompensasi 0–5
  → Latih model: Regresi vs Klasifikasi (LR, DT, RF, XGBoost)
  → Ekspor: model.onnx → web/   |   agregat + sampel → Supabase
  → Next.js di Vercel: dashboard (Supabase) + prediksi (/api/predict, ONNX)
  → Pengguna
```

Alur yang sama ditampilkan sebagai animasi di halaman awal website. Isinya diambil dari `web/content/pipeline.ts`. **Jika alur berubah, perbarui file itu, diagram ini, dan PRD §4 di commit yang sama.**

## Struktur Repo

```
penerbangan-bigdata/
├── notebooks/        # Google Colab: ingest, EDA, training, ekspor
├── web/              # Next.js (di-deploy ke Vercel, Root Directory = web)
│   ├── content/      # pipeline.ts + pipeline-stats.json (sumber animasi Cara Kerja)
│   └── models/       # model.onnx
├── supabase/         # SQL skema tabel
├── PRD.md
├── UI_RULES.md
└── README.md
```

> Folder di atas adalah rencana; dibuat bertahap sesuai milestone di PRD.

## Tech Stack

- **Pengolahan data:** Python, Google Colab, Google Drive, PySpark / DuckDB, Parquet.
- **ML:** scikit-learn, XGBoost, ONNX.
- **Database:** Supabase (Postgres).
- **Web:** Next.js, TypeScript, Tailwind, shadcn/ui, motion.dev, animate-ui, onnxruntime-node.
- **Hosting:** Vercel.

## Menjalankan

### 1. Pengolahan data & model (Colab)
1. Buka notebook di `notebooks/` lewat Colab (File → Open notebook → GitHub).
2. Hubungkan Google Drive; data mentah & Parquet disimpan di folder Drive bersama tim, **bukan** di repo.
3. Jalankan berurutan: `01_ingest` → `02_eda` → `03_model` → `04_export`.
4. `04_export` menghasilkan `model.onnx`, `pipeline-stats.json`, dan mengunggah agregat ke Supabase.

### 2. Web (lokal)
```bash
cd web
cp .env.example .env.local   # isi URL & publishable key Supabase
npm install
npm run dev                  # http://localhost:3000
```

### 3. Deploy
Import repo ini di Vercel, set **Root Directory = `web`**, lalu isi Environment Variables (lihat `web/.env.example`). Setiap push ke `main` otomatis ter-deploy.

## Aturan Kontribusi

- Jangan commit data mentah/Parquet (>100 MB, ditolak GitHub) atau kunci/secret (`.env*` sudah di `.gitignore`).
- Tampilan wajib mengikuti [UI_RULES.md](UI_RULES.md).
- Checklist sebelum merge:
  - [ ] Alur data berubah? → `web/content/pipeline.ts`, diagram README, dan PRD §4 sudah diperbarui
  - [ ] Model/fitur berubah? → parity test Python vs web lulus
  - [ ] Checklist UI_RULES.md terpenuhi

## Data

- U.S. Bureau of Transportation Statistics (BTS), *Airline On-Time Performance*, periode 2024–2025.
- Kelas kompensasi mengacu Peraturan Menteri Perhubungan No. PM 89 Tahun 2015.
