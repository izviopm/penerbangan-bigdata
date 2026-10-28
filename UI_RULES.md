# UI Rules — Penerbangan Big Data

Aturan tampilan untuk web `web/` (Next.js + Tailwind + shadcn/ui). Semua halaman dan komponen wajib mengikuti file ini.
Dasar: rekomendasi skill **ui-ux-pro-max** (gaya *Minimalism & Swiss Style* untuk dashboard analitik), disesuaikan dengan pilihan tim.

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
- Pola standar:
  - Kartu KPI & grid chart: muncul *stagger* (opacity 0→1, y 16→0, jeda 0.06s).
  - Angka KPI: *count-up* saat pertama tampil.
  - Ganti tab/halaman: fade + geser kecil, tanpa layout shift.
  - Hasil prediksi/kompensasi: muncul dengan *spring* ringan agar terasa sebagai "jawaban".

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

## 8. Form (halaman Prediksi & Estimasi Kompensasi)

- Label selalu terlihat (bukan placeholder saja), helper text di bawah field.
- Error muncul di dekat field yang salah, dengan teks jelas.
- Pakai `select`/combobox untuk maskapai & bandara, bukan input bebas.
- Tombol submit gold, disabled + spinner saat memproses.

## 9. Ikon & Gambar

- Ikon: **Lucide** (`lucide-react`, default shadcn), ukuran 16/20/24px, stroke konsisten. **Tanpa emoji** sebagai ikon.
- Ikon dekoratif `aria-hidden="true"`.
- Gambar pakai `next/image`, format WebP/AVIF, `alt` wajib.

## 10. Aksesibilitas

- Focus ring terlihat (`ring-2 ring-ring ring-offset-2`), jangan dihapus.
- Semua fitur bisa dipakai dengan keyboard.
- Dark mode didukung (`next-themes`, class `dark`), kontras dicek ulang di dark.

## Checklist sebelum merge

- [ ] Tidak ada hex langsung di komponen, semua lewat token
- [ ] Hanya satu tombol gold per layar; teks tombol gold/orange berwarna navy
- [ ] Font Plus Jakarta Sans terpasang via `next/font`
- [ ] Animasi pakai motion/animate-ui, hanya transform/opacity, reduced-motion aman
- [ ] Kontras ≥ 4.5:1 di light & dark
- [ ] Focus terlihat, tombol ikon punya `aria-label`
- [ ] Rapi di 375 / 768 / 1024 / 1440px, tanpa scroll horizontal
- [ ] Alur data berubah? Animasi Cara Kerja (`web/content/pipeline.ts`) sudah diperbarui
