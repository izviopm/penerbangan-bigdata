# DESIGN.md — sistem desain terkunci (Penerbangan Big Data)

> Dibaca hallmark sebagai **sistem terkunci**: palet, font, radius, dan library animasi di bawah tidak boleh diganti tema.
> Salinan bagian UI_RULES.md (sumber utama: `../UI_RULES.md`). Kalau UI_RULES berubah, salin ulang bagian ini.

## 1. Karakter

- **Bersih, berbasis data, terpercaya.** Ini dashboard analitik, bukan landing page promosi.
- **Biru dominan** (±70% bobot visual), **gold** dan **orange** hanya untuk aksi (tombol) dan sorotan penting.
- Grid rapi, banyak ruang kosong, hierarki tipografi jelas, bayangan tipis.

## 2. Warna

Definisikan sebagai CSS variable di `globals.css`; komponen **tidak boleh** memakai hex langsung, selalu lewat token Tailwind (`bg-primary`, `text-muted-foreground`, dst).

| Token | Light | Dark | Pemakaian |
|---|---|---|---|
| `--background` | `#EFF6FF` | `#0B1B3F` | Latar halaman |
| `--foreground` | `#0F1E4A` | `#E6EEFF` | Teks utama |
| `--card` | `#FFFFFF` | `#11265A` | Kartu, panel |
| `--primary` | `#1E3A8A` | `#2563EB` | Navbar, heading, link, elemen brand |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Teks di atas primary |
| `--secondary` | `#3B82F6` | `#60A5FA` | Aksen biru sekunder, chart utama |
| `--muted` | `#E9EEF5` | `#1A2F66` | Latar sekunder, skeleton |
| `--muted-foreground` | `#475569` | `#A9B8D6` | Teks keterangan |
| `--border` | `#BFDBFE` | `#23407F` | Garis kartu & input |
| `--ring` | `#1E3A8A` | `#93C5FD` | Focus ring |
| `--gold` | `#F5B700` | `#F5B700` | **Tombol utama (CTA)** |
| `--gold-foreground` | `#0B1B3F` | `#0B1B3F` | Teks di tombol gold |
| `--orange` | `#F97316` | `#FB923C` | **Tombol sekunder/aksi**, highlight |
| `--orange-foreground` | `#0B1B3F` | `#0B1B3F` | Teks di tombol orange |
| `--destructive` | `#DC2626` | `#F87171` | Error, hapus |

Aturan:
- Teks di atas gold/orange **selalu navy `#0B1B3F`**, bukan putih (putih di atas orange hanya 2.8:1, gagal WCAG; navy di gold 9.4:1, di orange 6.0:1).
- Kontras teks minimal **4.5:1**, cek di light dan dark.
- Gold dan orange **tidak** dipakai untuk latar besar atau teks paragraf.
- Status jangan hanya dibedakan warna; tambahkan ikon atau label.

## 3. Tombol

| Varian | Warna | Kapan |
|---|---|---|
| `default` (CTA) | gold | Satu aksi utama per layar: "Prediksi", "Hitung Kompensasi" |
| `accent` | orange | Aksi penting kedua: "Lihat Detail", "Unduh" |
| `outline` | border biru, latar transparan | Aksi netral: "Reset", "Batal" |
| `ghost` | tanpa latar | Aksi ringan di toolbar/tabel |
| `destructive` | merah | Hapus |

- Maksimal **satu** tombol gold per layar.
- Tinggi minimal **44px** di mobile, `cursor-pointer`, hover 150–250ms, state `disabled` + loading (spinner) saat request berjalan.
- Tombol ikon saja wajib punya `aria-label`.

## 4. Tipografi

- Font tunggal: **Plus Jakarta Sans**, dimuat lewat `next/font/google`:

```tsx
// web/app/layout.tsx
import { Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// <html className={jakarta.variable}> ... ; Tailwind: font-sans → var(--font-sans)
```

| Peran | Ukuran | Weight |
|---|---|---|
| Display / angka KPI | 36–48px | 700–800 |
| H1 | 30px | 700 |
| H2 | 24px | 700 |
| H3 / judul kartu | 18px | 600 |
| Body | 16px, line-height 1.5 | 400 |
| Caption / label | 13–14px | 500 |

- Body tidak boleh < 16px di mobile, teks apa pun tidak < 12px.
- Angka di tabel & KPI pakai `tabular-nums` agar sejajar.
- **Tanpa eyebrow & label huruf kapital berjarak** (mis. "TANPA DATA LEAKAGE", "BAGIAN 01"): label, caption, kepala tabel, tag, dan menu memakai huruf biasa (sentence case), satu tingkat lebih kecil dari body. *(Floor hallmark 9; berbeda dari gaya PPT.)*
- Jangan gabungkan info dengan titik tengah (`2024 · BTS · 20,9 jt`); pakai baris/kolom terpisah. *(Floor 10)*
- Jangan satu kata miring di tengah judul tegak. *(Floor 3)*

## 5. Layout & Spacing

- Skala spacing kelipatan 4: `4, 8, 12, 16, 24, 32, 48, 64`.
- Container maksimal `max-w-7xl`, padding samping 16px (mobile) / 24–32px (desktop).
- Radius: kartu `rounded-xl` (12px), tombol & input `rounded-lg` (8px).
- Breakpoint uji: **375, 768, 1024, 1440px**. Tidak boleh ada scroll horizontal di halaman (tabel lebar boleh scroll di dalam kartunya).
- Kartu: latar `card`, border `border`, bayangan `shadow-sm` saja.

## 6. Animasi — motion.dev + animate-ui

- Library: **Motion** (`motion`, import dari `motion/react`) untuk animasi custom; **animate-ui** untuk komponen siap pakai (dipasang lewat registry shadcn, mis. `npx shadcn@latest add @animate-ui/<komponen>`). Jangan tambah library animasi lain (GSAP, framer-motion lama, react-spring).
- Utamakan komponen animate-ui; tulis `motion.*` sendiri hanya jika tidak ada padanannya.
- Durasi: micro-interaction **150–250ms**, masuk elemen/kartu **300–450ms**, keluar lebih cepat dari masuk (±70% durasinya).
- Pola standar (disesuaikan dengan hallmark: **satu "reveal" per halaman**, konten tetap terlihat tanpa JavaScript):
  - **Beranda:** satu-satunya animasi besar adalah intro *Cara Kerja* di bawah — ini *signature* halaman versi hallmark.
  - **Dashboard & halaman kerja:** konten langsung tampil, **tanpa** stagger masuk dan **tanpa** *count-up* angka (angka count-up sempat menampilkan nilai palsu dan kosong kalau JS mati). Animasi hanya untuk perubahan state: hover, tooltip, ganti filter/tab (fade + geser kecil, tanpa layout shift).
  - Hasil prediksi/kompensasi: muncul dengan *spring* ringan agar terasa sebagai "jawaban" (reveal satu-satunya di halaman itu).

### Intro "Cara Kerja Aplikasi" (halaman awal)
- Animasi alur 7 langkah: Data mentah BTS → Colab/Parquet → Fitur & label → Training → Ekspor ONNX & Supabase → Next.js/Vercel → Pengguna.
- Bentuk: langkah-langkah tersusun (horizontal di desktop, vertikal di mobile) dihubungkan garis/path. Partikel "data" mengalir sepanjang garis, lalu tiap langkah menyala bergantian (±0.6s per langkah, total < 6s).
- Setiap langkah: ikon Lucide dalam lingkaran biru, judul, satu kalimat, dan satu angka nyata. Langkah aktif diberi aksen orange; langkah terakhir (website) diberi aksen gold.
- Ada tombol "Putar ulang" (outline) dan "Lewati" (ghost). Langkah bisa diklik untuk membuka detail (animate-ui popover/dialog).
- Data animasi **hanya** dari `web/content/pipeline.ts` + `pipeline-stats.json`; jangan hardcode teks di komponen (lihat PRD §8).
- Reduced motion: semua langkah langsung tampil statis.

- Animasikan **hanya `transform` dan `opacity`**, jangan width/height/top/left.
- **Wajib** hormati `prefers-reduced-motion`: bungkus app dengan `<MotionConfig reducedMotion="user">`.
- Animasi harus punya makna (memberi arah/feedback), bukan dekorasi terus-menerus. Tidak ada animasi loop di area data.

## 7. Grafik & Data

- Warna seri utama biru (`--secondary`), pembanding orange; kelas kompensasi 0–5 pakai gradasi biru → orange, **kelas 5 (ganti rugi) selalu orange** agar menonjol.
- Setiap chart: judul, label sumbu, legend (jika >1 seri), tooltip, dan sumber data ("BTS On-Time Performance 2023–2025").
- Tampilkan skeleton saat loading; ruang chart dipesan dari awal (CLS < 0.1).
- Sediakan ringkasan teks/tabel untuk chart penting (aksesibilitas).

## 9. Ikon & Gambar

- Ikon: **Lucide** (`lucide-react`, default shadcn), ukuran 16/20/24px, stroke konsisten. **Tanpa emoji** sebagai ikon.
- Ikon dekoratif `aria-hidden="true"`.
- Gambar pakai `next/image`, format WebP/AVIF, `alt` wajib.

## 10. Aksesibilitas

- Focus ring terlihat (`ring-2 ring-ring ring-offset-2`), jangan dihapus.
- Semua fitur bisa dipakai dengan keyboard.
- Dark mode didukung (`next-themes`, class `dark`), kontras dicek ulang di dark.

## 11. Floor hallmark (tidak bisa ditawar)

Ringkasan aturan dasar hallmark yang belum tercakup di atas:

- `overflow-x: clip` pada `html` dan `body` (bukan `hidden`, jangan `100vw`).
- Track grid berisi gambar pakai `minmax(0, 1fr)`; judul besar diberi `overflow-wrap: break-word; min-width: 0`.
- `:focus-visible` di semua elemen interaktif, muncul instan (tanpa transisi).
- Jangan `transition: all`.
- Hero beranda: judul ≤ 7 kata, satu kalimat ≤ 12 kata, dan tombol aksi — semuanya terlihat di layar 1280×800 tanpa scroll.
- ±80 kata per layar; beranda maksimal ±450 kata total.
- Container dibatasi dan di tengah: di layar 1920px hanya margin yang melebar.
- Tidak ada gradien ungu→biru, kartu di dalam kartu, emoji sebagai ikon, atau gambar jendela browser palsu.
- Baris pertama CSS utama (`globals.css`) = **stamp hallmark** + baris kritik + daftar *waive*.
- Sebelum merge halaman baru: `node ~/.claude/skills/hallmark/scripts/sloplint.mjs --url http://localhost:3000/<route> --render --scope app` (dashboard/prediksi) atau tanpa `--scope app` (beranda). Semua `FAIL` diperbaiki; `REFLEX` diperbaiki atau di-*waive* dengan alasan.

