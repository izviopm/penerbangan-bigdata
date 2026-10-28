// Arsitektur sistem untuk /cara-kerja (PRD §4). Ubah bersama pipeline.ts kalau alur data berubah.
import stats from "@/content/pipeline-stats.json";
import type { IconName } from "@/components/icons";
import { dec, num } from "@/lib/format";

export type ArchNode = { name: string; note: string; icon: IconName };
export type ArchStage = {
  id: string;
  title: string;
  /** keterangan panggung, ditampilkan menyala saat panggung ini aktif */
  caption: string;
  nodes: ArchNode[];
};

const supabaseRows = Object.values(stats.export.supabase_rows).reduce((a, b) => a + b, 0);

export const ARCH: ArchStage[] = [
  {
    id: "sumber",
    title: "Sumber data",
    caption: "BTS, badan statistik transportasi Amerika Serikat, membuka catatan setiap penerbangan domestik dalam file CSV bulanan.",
    nodes: [{ name: "BTS", note: `${stats.ingest.months} file CSV bulanan`, icon: "Landmark" }],
  },
  {
    id: "olah",
    title: "Pengolahan di Google Colab",
    caption: "Empat notebook Python dijalankan berurutan di Google Colab. Setiap notebook mengerjakan satu tahap dan menyimpan hasilnya untuk notebook berikutnya.",
    nodes: [
      { name: "Notebook 01", note: "unduh dan ringkas data", icon: "NotebookPen" },
      { name: "Notebook 02", note: "bersihkan, beri kelas, jelajahi", icon: "NotebookPen" },
      { name: "Notebook 03", note: "latih dan uji 16 model", icon: "NotebookPen" },
      { name: "Notebook 04", note: "kirim hasil ke internet", icon: "NotebookPen" },
    ],
  },
  {
    id: "simpan",
    title: "Penyimpanan",
    caption: "Data lengkap tinggal di Google Drive. Yang dibutuhkan website saja yang dikirim keluar: ringkasan ke Supabase, model ke GitHub.",
    nodes: [
      { name: "Google Drive", note: `Parquet ${dec(stats.ingest.parquet_mb, 1)} MB`, icon: "HardDrive" },
      { name: "Supabase", note: `${num(supabaseRows)} baris ringkasan`, icon: "Database" },
      { name: "GitHub", note: `kode website dan model ${dec(stats.export.onnx_mb, 1)} MB`, icon: "FolderGit2" },
    ],
  },
  {
    id: "web",
    title: "Website",
    caption: "Vercel membangun website dari GitHub. Dashboard membaca ringkasan dari Supabase, halaman prediksi menjalankan model di server.",
    nodes: [
      { name: "Vercel", note: "menjalankan Next.js", icon: "Cloud" },
      { name: "Dashboard dan prediksi", note: "5 halaman", icon: "LayoutDashboard" },
    ],
  },
  {
    id: "pengguna",
    title: "Anda",
    caption: "Anda membuka website di browser, memilih rute dan jam, lalu melihat kelas delay dan hak kompensasinya.",
    nodes: [{ name: "Browser Anda", note: "laptop atau HP", icon: "Monitor" }],
  },
];

export const GLOSSARY: [term: string, meaning: string][] = [
  ["Python", "Bahasa pemrograman yang paling banyak dipakai untuk mengolah data dan membuat model machine learning."],
  ["Notebook", "Dokumen berisi potongan kode Python dan penjelasannya. Kodenya dijalankan bagian demi bagian, dan hasilnya langsung tampil di bawah kode."],
  ["Google Colab", "Layanan gratis Google untuk menjalankan notebook Python di browser, tanpa memasang apa pun di komputer."],
  ["Supabase", "Database online. Website membaca angka dashboard dari sini."],
  ["Vercel", "Layanan yang menjalankan website ini dan memperbaruinya setiap kali kode di GitHub berubah."],
];
