// Satu-satunya sumber cerita "Cara kerja" (PRD §8): kartu di beranda dan bab di /cara-kerja.
// Angka dibaca dari pipeline-stats.json yang ditulis notebook 04_export. Kalau alur data berubah,
// ubah file ini, PRD §4, dan diagram README bersamaan.
import stats from "@/content/pipeline-stats.json";
import type { IconName } from "@/components/icons";
import { dec, juta, num } from "@/lib/format";

export type Step = {
  id: string;
  /** judul pendek untuk kartu beranda */
  title: string;
  /** satu kalimat untuk kartu beranda, bahasa awam */
  short: string;
  figure: string;
  figureLabel: string;
  /** judul bab di /cara-kerja */
  heading: string;
  /** ringkasan yang selalu terlihat (±40 kata) */
  lead: string;
  /** diagram alur di /cara-kerja: [nama, keterangan, ikon] dari kiri ke kanan */
  flow: [name: string, note: string, icon: IconName][];
  /** di mana langkah ini dijalankan, dan alat Python/JavaScript yang dipakai */
  where: string;
  stack: string[];
  /** detail "Selengkapnya" */
  what: string[];
  /** kenapa begini */
  why: string[];
  facts: [label: string, value: string][];
  /** keterbatasan yang jujur, bila ada */
  limits?: string[];
};

const supabaseRows = Object.values(stats.export.supabase_rows).reduce((a, b) => a + b, 0);
const operated = stats.eda.rows_operated;

export const STEPS: Step[] = [
  {
    id: "sumber-data",
    title: "Ambil data penerbangan",
    short: "Catatan setiap penerbangan domestik Amerika Serikat dari BTS, 3 tahun penuh.",
    figure: juta(stats.ingest.rows),
    figureLabel: "penerbangan, Januari 2023 sampai Desember 2025",
    heading: "Data diambil dari BTS, lembaga statistik transportasi Amerika Serikat",
    lead: "BTS (Bureau of Transportation Statistics) adalah badan statistik Departemen Perhubungan Amerika Serikat. Maskapai di sana wajib melaporkan setiap penerbangannya, lalu BTS membuka datanya untuk umum.",
    flow: [
      ["Maskapai di Amerika Serikat", "melapor setiap penerbangan", "Plane"],
      ["BTS", "mengumpulkan dan membuka data", "Landmark"],
      [`${stats.ingest.months} file bulanan`, "diunduh satu per satu", "Files"],
      ["Google Colab", "notebook 01 membaca tiap file", "NotebookPen"],
    ],
    where: "Notebook 01 di Google Colab",
    stack: ["Python", "pandas"],
    what: [
      "BTS adalah singkatan dari Bureau of Transportation Statistics, badan statistik di bawah Departemen Perhubungan Amerika Serikat. Maskapai besar di sana wajib melaporkan setiap penerbangan domestiknya: jadwal, jam berangkat sebenarnya, dan berapa menit terlambat. BTS membuka data itu untuk umum secara gratis.",
      `BTS menyediakan unduhan per bulan. Kami mengambil ${stats.ingest.months} bulan, dari Januari 2023 sampai Desember 2025. Satu bulan berisi sekitar 250 MB tabel CSV dengan ${stats.ingest.raw_columns} kolom, sehingga totalnya sekitar 9 GB.`,
    ],
    why: [
      "Data per penerbangan di Indonesia tidak dibuka untuk umum; Kementerian Perhubungan hanya merilis ringkasan ketepatan waktu. Data BTS lengkap sampai tingkat satu penerbangan dan sudah dipakai di banyak penelitian, jadi hasilnya bisa dibandingkan.",
      "Tiga tahun terakhir dipilih karena pola penerbangan 2020 dan 2021 berubah drastis akibat pandemi, sedangkan 2026 belum lengkap setahun.",
      "File diproses satu bulan demi satu bulan. Google Colab versi gratis hanya punya memori sekitar 12 GB, jadi memuat 9 GB sekaligus akan gagal. Cara ini juga aman kalau koneksi putus: bulan yang sudah selesai tidak perlu diulang.",
    ],
    facts: [
      ["Sumber", "transtats.bts.gov"],
      ["Periode", "Januari 2023 sampai Desember 2025"],
      ["File", `${stats.ingest.months} file bulanan`],
      ["Kolom asli", `${stats.ingest.raw_columns} kolom`],
    ],
  },
  {
    id: "simpan-ringkas",
    title: "Simpan dalam bentuk ringkas",
    short: `Hanya ${stats.ingest.kept_columns} kolom yang dibutuhkan disimpan sebagai Parquet di Google Drive.`,
    figure: `${dec(stats.ingest.parquet_mb, 1)} MB`,
    figureLabel: "dari sekitar 9 GB tabel CSV",
    heading: "Hanya kolom yang dipakai, disimpan dalam format Parquet di Google Drive",
    lead: `Dari ${stats.ingest.raw_columns} kolom, hanya ${stats.ingest.kept_columns} yang dipakai. Hasilnya disimpan sebagai file Parquet di Google Drive tim, dari sekitar 9 GB menjadi ${dec(stats.ingest.parquet_mb, 1)} MB.`,
    flow: [
      ["Tabel CSV", `${stats.ingest.raw_columns} kolom, sekitar 9 GB`, "Table"],
      ["Pilih kolom", `${stats.ingest.kept_columns} kolom yang dipakai`, "Columns3"],
      ["File Parquet", "satu file per bulan", "FileArchive"],
      ["Google Drive", `${dec(stats.ingest.parquet_mb, 1)} MB, dipakai bersama`, "HardDrive"],
    ],
    where: "Notebook 01 di Google Colab",
    stack: ["pandas", "DuckDB", "Parquet"],
    what: [
      `Dari ${stats.ingest.raw_columns} kolom, kami hanya menyimpan ${stats.ingest.kept_columns}: tanggal, maskapai, bandara asal dan tujuan, jam jadwal, jarak, menit delay, serta status batal atau dialihkan.`,
      "Hasilnya disimpan dalam format Parquet, satu file per bulan, di folder Google Drive milik tim.",
    ],
    why: [
      `Parquet menyimpan data per kolom dan memampatkannya. Ukurannya turun dari sekitar 9 GB menjadi ${dec(stats.ingest.parquet_mb, 1)} MB, dan untuk menghitung satu kolom komputer tidak perlu membaca kolom lain. Analisis 20 juta baris jadi selesai dalam hitungan detik.`,
      "Penyimpanan di Google Colab hilang setiap kali sesi berakhir. Google Drive menyimpan hasilnya secara permanen dan bisa dibuka seluruh anggota tim dari notebook masing-masing.",
    ],
    facts: [
      ["Kolom disimpan", `${stats.ingest.kept_columns} dari ${stats.ingest.raw_columns}`],
      ["Ukuran", `${dec(stats.ingest.parquet_mb, 1)} MB`],
      ["Tempat", "Google Drive tim"],
    ],
  },
  {
    id: "beri-kelas",
    title: "Bersihkan dan beri kelas PM 89",
    short: "Penerbangan batal dibuang, lalu setiap penerbangan diberi kelas sesuai lama delay-nya.",
    figure: juta(operated),
    figureLabel: "penerbangan yang benar-benar terbang",
    heading: "Penerbangan yang batal dibuang, sisanya diberi kelas kompensasi PM 89/2015",
    lead: "Penerbangan yang batal atau dialihkan dibuang. Sisanya diberi kelas PM 89/2015 menurut lama delay-nya, misalnya delay 135 menit masuk kelas 3.",
    flow: [
      ["Semua penerbangan", juta(stats.ingest.rows), "Plane"],
      ["Buang batal & dialihkan", `${num(stats.ingest.cancelled + stats.ingest.diverted)} penerbangan`, "Filter"],
      ["Hitung kelas PM 89", "dari menit delay keberangkatan", "Tags"],
      ["Siap dianalisis", `${juta(operated)} penerbangan berkelas`, "CheckCheck"],
    ],
    where: "Notebook 02 di Google Colab",
    stack: ["DuckDB", "matplotlib"],
    what: [
      `Ada ${num(stats.ingest.cancelled)} penerbangan yang batal dan ${num(stats.ingest.diverted)} yang dialihkan ke bandara lain. Keduanya dikeluarkan karena tidak punya menit delay keberangkatan. Sisanya ${num(operated)} penerbangan.`,
      "Setiap penerbangan lalu diberi kelas menurut Peraturan Menteri Perhubungan PM 89/2015. Misalnya delay 45 menit masuk kelas 1 (minuman ringan), 135 menit masuk kelas 3 (makanan berat), dan 300 menit masuk kelas 5 (ganti rugi Rp300.000). Delay di bawah 30 menit kami sebut kelas 0.",
    ],
    why: [
      "Kelas inilah yang ingin ditebak model, karena setiap kelas punya kewajiban kompensasi yang berbeda bagi maskapai.",
      "Kenapa data Amerika diberi kelas aturan Indonesia? Penelitian ini ingin tahu cara terbaik menebak kategori kompensasi PM 89/2015, tetapi data per penerbangan Indonesia tidak dibuka untuk umum. Data BTS dipakai sebagai studi kasus untuk menguji metodenya.",
      "Cara ini masuk akal karena kelas PM 89/2015 hanya ditentukan oleh lama delay dalam menit. Pasal 4 menghitung delay dari jadwal berangkat sampai pesawat benar-benar berangkat, dan BTS mengukur kolom delay keberangkatan dengan cara yang sama: selisih jam jadwal dan jam pesawat meninggalkan gerbang.",
      "Pekerjaan ini memakai DuckDB, alat yang bisa menjalankan perintah SQL langsung ke file Parquet tanpa memuat 20 juta baris ke memori sekaligus.",
    ],
    facts: [
      ["Dikeluarkan", `${num(stats.ingest.cancelled + stats.ingest.diverted)} penerbangan`],
      ["Delay minimal 30 menit", `${dec(stats.eda.pct_delay30, 2)}%`],
      ["Kelas 5", `${dec(stats.eda.class_pct["5"], 2)}% penerbangan`],
    ],
    limits: [
      "Penumpang di Amerika Serikat tidak menerima kompensasi PM 89/2015. Kelas di sini hanya label untuk penelitian.",
      "Pola delay di Indonesia (cuaca, kepadatan bandara, maskapai) berbeda, jadi model ini belum bisa langsung dipakai untuk penerbangan Indonesia. Model perlu dilatih ulang kalau data Indonesia tersedia.",
    ],
  },
  {
    id: "latih-model",
    title: "Uji 16 model",
    short: "Dua cara menebak dibandingkan secara adil dengan empat algoritma.",
    figure: `${stats.model.n_models} model`,
    figureLabel: `dilatih pada sampel ${num(stats.model.n_sample)} penerbangan`,
    heading: "16 model diuji supaya perbandingannya adil",
    lead: "Model adalah rumus yang belajar dari data lama untuk menebak data baru. Kami menguji 16 model untuk menjawab satu pertanyaan: lebih tepat menebak menit delay, atau langsung menebak kelasnya?",
    flow: [
      ["Sampel acak", `${num(stats.model.n_sample)} penerbangan`, "Shuffle"],
      ["Bagi 80 : 20", "data latih dan data uji", "Split"],
      ["16 model", "2 cara x 2 perlakuan x 4 algoritma", "Brain"],
      ["Model terpilih", "B-S4 XGBoost", "Trophy"],
    ],
    where: "Notebook 03 di Google Colab",
    stack: ["scikit-learn", "XGBoost"],
    what: [
      "Model adalah rumus yang belajar dari data lama untuk menebak data baru. Pertanyaan penelitian kami: lebih tepat menebak menit delay lalu mengubahnya ke kelas (cara A, regresi), atau langsung menebak kelasnya (cara B, klasifikasi)?",
      "Angka 16 berasal dari 2 cara menebak, masing-masing dengan 2 perlakuan, dikali 4 algoritma. Perlakuan cara A adalah menit asli atau menit yang dipadatkan dengan logaritma. Perlakuan cara B adalah tanpa atau dengan bobot kelas, yaitu memberi perhatian lebih pada kelas yang langka. Algoritmanya dua yang sederhana sebagai pembanding (Linear atau Logistic Regression dan Decision Tree) dan dua yang lebih kuat (Random Forest dan XGBoost).",
    ],
    why: [
      "Dengan satu model saja, kami tidak bisa tahu apakah hasilnya bagus karena cara menebaknya atau karena algoritmanya. Dengan 16 model yang memakai data dan ukuran yang sama, setiap perbedaan bisa ditelusuri ke penyebabnya.",
      `Hasilnya, hanya cara B dengan bobot kelas yang bisa menangkap delay lebih dari 240 menit. XGBoost dari kelompok ini dipakai di website, dengan recall kelas 5 sebesar ${dec(stats.model.recall_class_5, 3)}.`,
    ],
    facts: [
      ["Data latih", `${num(stats.model.n_train)} penerbangan`],
      ["Data uji", `${num(stats.model.n_test)} penerbangan`],
      ["Model terpilih", "B-S4 XGBoost"],
    ],
    limits: [
      "Colab gratis tidak kuat melatih 16 model pada 20 juta baris, jadi model memakai sampel 1 juta penerbangan yang proporsinya sama dengan data lengkap.",
      "Model hanya tahu jadwal. Cuaca dan keterlambatan pesawat dari penerbangan sebelumnya tidak ikut dihitung, sehingga tebakannya berupa tingkat risiko.",
    ],
  },
  {
    id: "kirim-ke-web",
    title: "Kirim hasil ke internet",
    short: "Ringkasan data dikirim ke Supabase dan model dikemas agar bisa dijalankan website.",
    figure: num(supabaseRows),
    figureLabel: "baris ringkasan, mewakili 20,9 juta penerbangan",
    heading: "Pekerjaan berat di Colab, hasil kecilnya dikirim ke layanan online",
    lead: `Pekerjaan berat tetap di Google Colab. Yang dikirim ke internet hanya ringkasan ${num(supabaseRows)} baris ke database Supabase dan model yang sudah dikemas ulang.`,
    flow: [
      ["Notebook 04 di Colab", "menyiapkan hasil akhir", "NotebookPen"],
      ["Supabase", `${num(supabaseRows)} baris ringkasan`, "Database"],
      ["Model ONNX", `${dec(stats.export.onnx_mb, 1)} MB, disimpan di GitHub`, "Package"],
      ["Vercel", "membangun website dari GitHub", "Rocket"],
    ],
    where: "Notebook 04 di Google Colab",
    stack: ["onnxmltools", "psycopg2", "Supabase"],
    what: [
      `Supabase adalah database online. Ke sana kami hanya mengirim ringkasan: angka per bulan dan maskapai, per bulan dan bandara, serta per jam dan hari, totalnya ${num(supabaseRows)} baris. Ringkasan ini cukup untuk semua grafik di dashboard.`,
      `Model dibuat dengan Python, sedangkan website berjalan dengan JavaScript. Karena itu model diubah ke format ONNX, format standar yang bisa dibaca banyak bahasa pemrograman, mirip PDF untuk dokumen. Ukurannya ${dec(stats.export.onnx_mb, 1)} MB.`,
    ],
    why: [
      "Google Colab kuat untuk mengolah data, tetapi tidak bisa diakses publik dan sesinya berakhir sendiri. Supabase dan Vercel selalu online, tetapi versi gratisnya kecil. Karena itu pengolahan tetap di Colab dan hanya hasil kecilnya yang ditaruh online, sehingga semua layanan cukup memakai paket gratis.",
    ],
    facts: [
      ["Database", "Supabase (PostgreSQL)"],
      ["Isi database", `${num(supabaseRows)} baris`],
      ["Model", `ONNX, ${dec(stats.export.onnx_mb, 1)} MB`],
    ],
    limits: [
      "Supabase gratis hanya 500 MB dan berhenti sementara kalau tujuh hari tidak dipakai, sehingga data mentah tetap di Google Drive.",
      "Data tidak diperbarui otomatis. Untuk menambah bulan baru, notebook dijalankan ulang di Colab.",
    ],
  },
  {
    id: "website",
    title: "Tampilkan di website",
    short: "Dashboard membaca ringkasan, halaman prediksi menjalankan model saat Anda menekan tombol.",
    figure: "5 halaman",
    figureLabel: "beranda, dashboard, prediksi, kompensasi, model",
    heading: "Website membaca ringkasan dan menjalankan model saat dibutuhkan",
    lead: "Dashboard membaca ringkasan dari Supabase. Halaman prediksi menjalankan model saat Anda menekan tombol, lalu menampilkan kelas PM 89/2015 dan hak kompensasinya.",
    flow: [
      ["Anda", "memilih rute, tanggal, dan jam", "User"],
      ["Server Vercel", "menyusun fitur penerbangan", "Server"],
      ["Model ONNX", "memberi skor setiap kelas", "Cpu"],
      ["Hasil", "kelas PM 89 dan hak penumpang", "BadgeCheck"],
    ],
    where: "Website di Vercel",
    stack: ["Next.js", "onnxruntime-web", "Supabase"],
    what: [
      "Website ini dibuat dengan Next.js dan berjalan di Vercel. Halaman dashboard mengambil ringkasan dari Supabase lalu menggambar grafiknya.",
      "Di halaman prediksi, Anda memilih maskapai, rute, tanggal, dan jam. Server menjalankan model ONNX dan menampilkan kelas PM 89/2015 yang paling mungkin beserta hak kompensasinya.",
    ],
    why: [
      "Kami membandingkan prediksi website dengan prediksi Colab pada 50 penerbangan contoh, dan hasilnya sama. Model yang Anda pakai di sini adalah model yang dievaluasi di paper.",
    ],
    facts: [
      ["Website", "Next.js di Vercel"],
      ["Data dashboard", "Supabase"],
      ["Prediksi", "Model ONNX di server"],
    ],
  },
];
