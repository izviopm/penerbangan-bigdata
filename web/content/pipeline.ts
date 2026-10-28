// Satu-satunya sumber animasi "Cara Kerja" (PRD §8). Angka dibaca dari pipeline-stats.json yang
// ditulis notebook 04_export; kalau alur data berubah, ubah file ini, PRD §4, dan diagram README bersamaan.
import stats from "@/content/pipeline-stats.json";
import { dec, juta, num } from "@/lib/format";

export type Step = {
  id: string;
  title: string;
  line: string;
  figure: string;
  figureLabel: string;
  tools: string;
  input: string;
  output: string;
};

const supabaseRows = Object.values(stats.export.supabase_rows).reduce((a, b) => a + b, 0);

export const STEPS: Step[] = [
  {
    id: "bts",
    title: "Data mentah BTS",
    line: "Catatan setiap penerbangan domestik Amerika Serikat, diunduh per bulan.",
    figure: `${stats.ingest.months} file`,
    figureLabel: `CSV bulanan, ${stats.ingest.raw_columns} kolom`,
    tools: "Python di Google Colab",
    input: `transtats.bts.gov, periode ${stats.ingest.period.replace("-", "–")}`,
    output: "ZIP bulanan berisi CSV",
  },
  {
    id: "parquet",
    title: "Parquet di Drive",
    line: `Hanya ${stats.ingest.kept_columns} kolom yang disimpan, dalam format kolumnar terkompresi.`,
    figure: `${dec(stats.ingest.parquet_mb, 1)} MB`,
    figureLabel: `untuk ${juta(stats.ingest.rows)} baris`,
    tools: "pandas, pyarrow",
    input: "CSV bulanan",
    output: "Satu file Parquet per bulan",
  },
  {
    id: "label",
    title: "Bersihkan dan beri kelas",
    line: "Penerbangan batal dan dialihkan dibuang, lalu delay dipetakan ke kelas PM 89/2015.",
    figure: juta(stats.eda.rows_operated),
    figureLabel: "penerbangan beroperasi",
    tools: "DuckDB (SQL langsung ke Parquet)",
    input: `${num(stats.ingest.rows)} baris`,
    output: "Kelas 0 sampai 5 dan statistik EDA",
  },
  {
    id: "model",
    title: "Latih 16 model",
    line: "Regresi dan klasifikasi diuji pada sampel dan metrik yang sama.",
    figure: `${stats.model.n_models} model`,
    figureLabel: `dari sampel ${num(stats.model.n_sample)} penerbangan`,
    tools: "scikit-learn, XGBoost",
    input: `${num(stats.model.n_train)} data latih, ${num(stats.model.n_test)} data uji`,
    output: "Metrik tiap model dan model XGBoost",
  },
  {
    id: "export",
    title: "Ekspor ke web",
    line: "Model terpilih diubah ke ONNX, agregat dashboard dikirim ke Supabase.",
    figure: `${dec(stats.export.onnx_mb, 1)} MB`,
    figureLabel: `model ONNX dan ${num(supabaseRows)} baris agregat`,
    tools: "onnxmltools, PostgreSQL di Supabase",
    input: "Model B-S4 XGBoost dan Parquet",
    output: "model.onnx dan 6 tabel Supabase",
  },
  {
    id: "web",
    title: "Next.js di Vercel",
    line: "Dashboard membaca Supabase, prediksi menjalankan model ONNX di server.",
    figure: "Sama persis",
    figureLabel: "dengan prediksi di Python, diuji pada 50 penerbangan",
    tools: "Next.js, onnxruntime-web",
    input: "model.onnx dan tabel Supabase",
    output: "Halaman dashboard dan prediksi",
  },
  {
    id: "you",
    title: "Anda",
    line: "Pilih rute dan jam, lalu lihat kategori kompensasi yang paling mungkin.",
    figure: dec(stats.model.recall_class_5, 3),
    figureLabel: "recall kelas 5 model yang dipakai web",
    tools: "Browser",
    input: "Maskapai, rute, tanggal, jam",
    output: "Kelas PM 89/2015 dan hak kompensasinya",
  },
];
