// Kategori keterlambatan PM 89/2015 (Pasal 3) dan kompensasinya (Pasal 9 ayat 1).
// Kelas 0 tambahan penelitian; kelas 6 (pembatalan) tidak dimodelkan.
export const PM89 = [
  { kelas: 0, rentang: "< 30 menit", kompensasi: "Belum termasuk keterlambatan menurut PM 89/2015." },
  { kelas: 1, rentang: "30–60 menit", kompensasi: "Minuman ringan." },
  { kelas: 2, rentang: "61–120 menit", kompensasi: "Minuman dan makanan ringan (snack box)." },
  { kelas: 3, rentang: "121–180 menit", kompensasi: "Minuman dan makanan berat (heavy meal)." },
  { kelas: 4, rentang: "181–240 menit", kompensasi: "Minuman, makanan ringan, dan makanan berat." },
  { kelas: 5, rentang: "> 240 menit", kompensasi: "Ganti rugi Rp300.000." },
] as const;

/** Sama dengan to_class() di 03_model: <30 → 0, ≤60 → 1, ≤120 → 2, ≤180 → 3, ≤240 → 4, >240 → 5. */
export function toClass(minutes: number): number {
  const m = minutes;
  return Number(m >= 30) + Number(m > 60) + Number(m > 120) + Number(m > 180) + Number(m > 240);
}
