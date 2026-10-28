# UI Rules — Penerbangan Big Data

Aturan tampilan untuk web `web/` (Next.js + Tailwind + shadcn/ui). Semua halaman dan komponen wajib mengikuti file ini.

## 0. Skill desain yang dipakai

Tiga skill Claude Code dipakai bersama, dengan pembagian peran yang jelas:

| Skill | Peran | Kapan dipakai |
|---|---|---|
| **`/ui-ux-pro-max:ui-ux-pro-max`** | **Sistem desain & aturan UX.** Sumber palet, gaya *Minimalism & Swiss Style*, aturan aksesibilitas, form, chart, dan responsif di file ini. | Saat menentukan/mengubah token, komponen, aksesibilitas, atau mereview UX. Cari aturan spesifik: `search.py "<kata kunci>" --domain ux` / `--stack nextjs`. |
| **`/humanizer`** | **Teks di layar.** Semua teks yang tampil (judul, deskripsi, tombol, keterangan grafik, pesan error) disunting agar terdengar ditulis orang: tanpa kontras "bukan X tetapi Y", tanpa kalimat penutup dramatis, tanpa bahasa jualan atau klaim berlebihan. Fakta & angka tidak boleh berubah. | Setiap menulis atau mengubah teks halaman, sebelum merge. Bahasa: Indonesia, nada netral dan teknis. |
| **`/hallmark`** | **Komposisi halaman & kualitas akhir.** Menyusun bentuk tiap halaman (hero, section, "signature"), menjaga agar web tidak terlihat seperti template generik, dan mengecek hasil dengan `sloplint`. | Saat **membangun halaman baru** (beranda, dashboard, prediksi, dst.) dan sebelum merge: `/hallmark audit <path>`. Perubahan kecil pada halaman yang sudah ada **tidak** memakai hallmark, kecuali dipanggil `/hallmark redesign <path>`. |

Aturan main agar keduanya tidak bentrok:
1. **Sistem terkunci.** Palet, font, radius, dan library animasi di file ini **tidak** boleh diganti tema dari hallmark. Saat folder `web/` dibuat, salin bagian 2–6 file ini ke **`web/DESIGN.md`**; hallmark membaca `DESIGN.md` sebagai sistem terkunci, sehingga ia tidak membagikan (*deal*) tema sendiri.
2. **Floor hallmark wajib** (lihat bagian 11) — kecuali yang bertentangan dengan pilihan eksplisit tim di file ini; pengecualian dicatat sebagai *waive* di stamp CSS.
3. **Isi nyata saja.** Hallmark melarang angka/testimoni karangan; web ini hanya menampilkan angka dari `pipeline-stats.json` dan Supabase.
4. Hallmark menanyakan *material, audience, use, tone* sekali sebelum membangun. Jawaban baku proyek ini: material = data & grafik nyata BTS 2023–2025 + model; audience = dosen & kelas (penumpang/maskapai sebagai ilustrasi); use = paham alur big data lalu mencoba prediksi; tone = *technical, utilitarian*.

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
| `--orange-text` | `#C2410C` | `#FB923C` | **Teks/angka** berwarna oranye (mis. kelas 5). `#F97316` sebagai teks hanya 2,8:1, gagal kontras |
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

- Tabel di atas berlaku untuk **halaman aplikasi** (dashboard, prediksi, kompensasi, model). **Beranda** (halaman non-aplikasi) memakai skala display hallmark: H1 48–72px, H2 36–48px, ketebalan 400/600/800 saja.
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
- Alur 6 langkah: Ambil data BTS → Simpan ringkas (Parquet di Google Drive) → Bersihkan & beri kelas PM 89 → Uji 16 model → Kirim ke Supabase & ONNX → Tampilkan di website.
- Beranda: *sticky diptych*. Kiri judul + tautan menempel, kanan linimasa vertikal; garis terisi mengikuti scroll (CSS `animation-timeline`), setiap kartu muncul saat terlihat (`data-reveal`). **Tanpa autoplay**: pengguna membaca dengan kecepatannya sendiri.
- `/cara-kerja`: satu bab per langkah. Diagram alur (kotak + panah) muncul berurutan saat discroll; kotak terakhir berwarna primary. Nomor langkah dalam lingkaran gold.
- Efek scroll dipakai di seluruh beranda atas permintaan pengguna (28 Okt 2026), menggantikan aturan "satu reveal per halaman". Tetap wajib: konten terlihat tanpa JavaScript (kelas `.js`), dan `prefers-reduced-motion` mematikan semua gerak.
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

## Checklist sebelum merge

- [ ] Halaman baru dibangun dengan `/hallmark` dan `sloplint` bersih (0 FAIL)
- [ ] Tidak ada eyebrow / label kapital berjarak / meta bertitik tengah
- [ ] Tidak ada hex langsung di komponen, semua lewat token
- [ ] Hanya satu tombol gold per layar; teks tombol gold/orange berwarna navy
- [ ] Font Plus Jakarta Sans terpasang via `next/font`
- [ ] Animasi pakai motion/animate-ui, hanya transform/opacity, reduced-motion aman
- [ ] Kontras ≥ 4.5:1 di light & dark
- [ ] Focus terlihat, tombol ikon punya `aria-label`
- [ ] Rapi di 375 / 768 / 1024 / 1440px, tanpa scroll horizontal
- [ ] Alur data berubah? Animasi Cara Kerja (`web/content/pipeline.ts`) sudah diperbarui
