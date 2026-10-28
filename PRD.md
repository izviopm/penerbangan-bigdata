# PRD — Penerbangan Big Data

**Produk:** Web analitik keterlambatan & estimasi kompensasi penerbangan
**Tim:** Kelompok 2 MKOM Universitas Budi Luhur: Recky Arisenta, Izvio Prijaya Mumin, Safira Alisha Aqista
**Mata kuliah:** Manajemen Big Data & Analitik Bisnis
**Tenggat:** presentasi projek **5 Desember 2026**
**Status:** Draft

---

## 1. Latar Belakang

Keterlambatan penerbangan merugikan penumpang dan maskapai. Di Indonesia, **PM 89/2015** mewajibkan maskapai memberi kompensasi berjenjang sesuai lama keterlambatan, sampai ganti rugi Rp300.000 jika delay > 240 menit.

Projek ini menunjukkan **pengelolaan big data end-to-end**: jutaan baris data penerbangan mentah diolah dengan Python, dipakai untuk melatih model machine learning, lalu disajikan sebagai web yang bisa diakses publik.

Data yang dipakai adalah **BTS On-Time Performance** (AS, 2023–2025, 20.928.579 baris). Kelas kompensasi PM 89/2015 diterapkan sebagai studi kasus.

## 2. Tujuan

| # | Tujuan | Ukuran keberhasilan |
|---|---|---|
| G1 | Menunjukkan pipeline big data dari data mentah sampai web | Seluruh alur berjalan dan dijelaskan di animasi "Cara Kerja" |
| G2 | Menyajikan insight keterlambatan | Dashboard menampilkan tren per bulan, maskapai, bandara, dan kelas kompensasi |
| G3 | Memprediksi kelas kompensasi sebuah penerbangan | Endpoint prediksi < 1 detik; model terbaik dilaporkan dengan macro F1 & recall kelas 5 |
| G4 | Bisa diakses online gratis | Ter-deploy di Vercel + Supabase free tier, aktif saat presentasi |

**Di luar cakupan:** data real-time, login pengguna, data penerbangan Indonesia, aplikasi mobile, klaim kompensasi sungguhan.

## 3. Pengguna

| Persona | Kebutuhan |
|---|---|
| Dosen & kelas (utama) | Memahami alur big data dan hasil model dengan cepat saat presentasi |
| Penumpang (ilustrasi) | Tahu perkiraan delay dan hak kompensasinya |
| Analis maskapai (ilustrasi) | Melihat rute/maskapai/jam yang rawan delay |

## 4. Alur Sistem

```
[1] Data mentah BTS (CSV per bulan, 2023–2025)
        │  unduh, pilih ±15 kolom
        ▼
[2] Google Colab + Google Drive: CSV → Parquet (PySpark / DuckDB)
        │  bersihkan, buang pembatalan, buat fitur (jam sin/cos, hari, rute, dll.)
        ▼
[3] Labeling kelas kompensasi PM 89/2015 (kelas 0–5)
        │
        ▼
[4] Pelatihan model: Regresi (A) vs Klasifikasi (B)
        │  LR/LogReg, DT, RF, XGBoost × skenario S1–S4, split 80:20 + 5-fold CV
        ▼
[5] Ekspor
        ├─ model web: B-S4 XGBoost (klasifikasi + class weight) → model.onnx → disimpan di web/
        └─ tabel agregat + sampel → Supabase (Postgres)
        ▼
[6] Next.js di Vercel
        ├─ dashboard membaca agregat dari Supabase
        └─ API /api/predict menjalankan model.onnx (onnxruntime-web/WASM di server)
        ▼
[7] Pengguna membuka website
```

Rumus kelas kompensasi PM 89/2015:

| Kelas | Lama delay | Kompensasi |
|---|---|---|
| 0 | < 30 menit | — (bukan delay menurut PM 89) |
| 1 | 30–60 menit | Minuman ringan |
| 2 | 61–120 menit | Minuman + makanan ringan* |
| 3 | 121–180 menit | Minuman + makanan berat* |
| 4 | 181–240 menit | Minuman, makanan ringan + berat |
| 5 | > 240 menit | Ganti rugi Rp300.000* |

\* Wajib diverifikasi ke teks resmi PM 89/2015 (JDIH Kemenhub) sebelum rilis.

## 5. Fitur

### F1. Intro "Cara Kerja Aplikasi" (wajib, P0)
Enam langkah dari data BTS sampai website, ditulis untuk orang awam (revisi 28 Okt 2026: animasi otomatis terlalu cepat dibaca, langkah "Anda" dihapus).
- **Beranda:** linimasa 6 langkah yang muncul mengikuti scroll (garis terisi saat digulir). Setiap langkah: judul, angka nyata, satu kalimat, dan tautan ke penjelasannya. Tidak ada autoplay.
- **Arsitektur sistem di `/cara-kerja`** (`web/content/architecture.ts`): BTS → Google Colab (notebook Python 01–04) → Google Drive, Supabase, GitHub → Vercel → browser. Di desktop panelnya menempel dan scroll menggerakkan data (motion.dev); di HP tampil statis. Ada glosarium istilah (Python, notebook, Colab, Supabase, Vercel).
- **Halaman `/cara-kerja`:** satu bab per langkah berisi diagram alur beranimasi, "Apa yang dikerjakan", "Kenapa begini" (alasan memilih BTS, Parquet, Google Drive, Supabase, 16 model, ONNX), fakta angka, dan batasan.
- Semua singkatan dijelaskan saat pertama muncul (mis. BTS = Bureau of Transportation Statistics).
- Hormati `prefers-reduced-motion` dan tetap terbaca tanpa JavaScript: tampilkan semua langkah statis tanpa animasi.
- **Isi diambil dari satu file sumber `web/content/pipeline.ts`** (lihat §8), bukan di-hardcode di komponen.

### F2. Dashboard (P0)
- KPI: total penerbangan, % delay ≥ 30 menit, rata-rata delay, jumlah penerbangan kelas 5.
- Grafik: tren bulanan, distribusi kelas 0–5, top maskapai/bandara rawan delay, heatmap jam × hari.
- Filter: periode, maskapai, bandara asal.
- Sumber: tabel agregat Supabase.

### F3. Prediksi Delay & Kompensasi (P0)
- Form: maskapai, bandara asal, bandara tujuan, tanggal, jam berangkat, jarak (otomatis dari rute bila ada).
- Output: kelas kompensasi prediksi, probabilitas per kelas, dan teks hak penumpang sesuai PM 89/2015.
- Diproses di `/api/predict` dengan `model.onnx`.

### F4. Estimasi Kompensasi Manual (P1)
Pengguna mengisi lama delay (menit) → tampil kelas dan kompensasinya. Tanpa model, aturan saja.

### F5. Tentang Model (P1)
Perbandingan Pendekatan A vs B, skenario S1–S4, tabel metrik (MAE, RMSE, R², precision/recall/F1 per kelas, macro F1, recall kelas 5), confusion matrix, dan feature importance.

## 6. Kebutuhan Non-Fungsional

- **Biaya:** Rp0. Google Colab free, Supabase free, dan Vercel Hobby.
- **Performa:** halaman pertama tampil < 2,5 detik (LCP); prediksi < 1 detik.
- **Ukuran:** model ONNX 29,2 MB (400 pohon × 6 kelas; batas aman < 50 MB untuk Vercel & GitHub); data Supabase hanya beberapa MB (agregat).
- **Model web:** B-S4 XGBoost, karena satu-satunya pendekatan yang mendeteksi kelas 5 (recall 0,166; macro F1 0,169). A-S1 XGBoost punya macro F1 lebih tinggi (0,180) tetapi tidak pernah memprediksi kelas 5.
- **Konsistensi:** preprocessing di web harus identik dengan Python; dibuktikan dengan *parity test* (input sama → kelas sama).
- **Tampilan:** mengikuti [UI_RULES.md](UI_RULES.md).
- **Keamanan:** tidak ada kunci di repo; kunci Supabase di Environment Variables Vercel; tabel Supabase read-only untuk publik (RLS).

## 7. Tech Stack

| Lapisan | Teknologi |
|---|---|
| Pengolahan data | Python, Google Colab, Google Drive, PySpark / DuckDB, Parquet |
| Machine learning | scikit-learn, XGBoost, skl2onnx / onnxmltools |
| Database | Supabase (Postgres) |
| Web | Next.js (App Router), TypeScript, Tailwind, shadcn/ui, motion.dev, animate-ui |
| Inferensi | onnxruntime-web (WASM) di API route; onnxruntime-node 307 MB melebihi batas fungsi Vercel 250 MB |
| Hosting | Vercel |
| Kode | GitHub (monorepo ini) |

## 8. Aturan "Cara Kerja" Selalu Terbaru

Animasi F1 adalah dokumentasi hidup. Agar tidak basi:

1. Satu sumber kebenaran: **`web/content/pipeline.ts`** berisi daftar langkah (judul, ringkasan, diagram alur, apa/kenapa, fakta, batasan, angka). Beranda dan `/cara-kerja` hanya membaca file ini.
2. Angka (jumlah baris, ukuran Parquet, metrik model) diisi dari **`web/content/pipeline-stats.json`** yang di-*generate* otomatis oleh notebook ekspor (`notebooks/04_export.ipynb`) setiap kali dijalankan.
3. Setiap perubahan pada notebook, skema Supabase, model, atau API **wajib** ikut mengubah `pipeline.ts` (dan diagram §4 di file ini serta README) di commit/PR yang sama.
4. Checklist PR berisi: "Apakah alur data berubah? Jika ya, `pipeline.ts`, PRD §4, dan README sudah diperbarui."

## 9. Milestone

| Target | Pekerjaan |
|---|---|
| Minggu 1 (s.d. 8 Nov) | Unduh data 2023–2025, notebook ingest → Parquet, EDA |
| Minggu 2 (s.d. 15 Nov) | Fitur + labeling, training 16 model, pilih model terbaik |
| Minggu 3 (s.d. 22 Nov) | Ekspor ONNX + agregat Supabase; setup Next.js, intro Cara Kerja, dashboard |
| Minggu 4 (s.d. 29 Nov) | Halaman prediksi + parity test, Tentang Model, polishing UI |
| 1–4 Des | Uji di HP & laptop, pastikan Supabase aktif, latihan demo |
| **5 Des** | Presentasi |

## 10. Risiko

| Risiko | Mitigasi |
|---|---|
| Colab kehabisan RAM / terputus | Proses per bulan, simpan Parquet bertahap, latih pada sampel bertingkat 2–3 juta baris |
| Supabase free di-pause karena tidak aktif | Buka/ping project beberapa hari sebelum presentasi |
| Preprocessing web ≠ Python | Parity test sebelum deploy |
| Model ONNX terlalu besar | Pakai XGBoost (bukan RF); kalau > 50 MB, kurangi `n_estimators` di 03_model |
| Teks kompensasi PM 89 salah | Verifikasi ke JDIH Kemenhub sebelum rilis |
