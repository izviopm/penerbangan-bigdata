// Form prediksi → input model. Dipakai di server (halaman /prediksi) dan diuji di tests/flight.test.ts.
import routes from "@/models/routes.json";
import { CATEGORIES, type FlightInput } from "@/lib/features";

/** { asal: { tujuan: [jarak_mil, durasi_menit, jumlah_penerbangan] } } dari notebook 04 bagian 7 */
export const ROUTES = routes as unknown as Record<string, Record<string, [number, number, number]>>; // JSON tak bisa menyatakan tuple

export type FlightQuery = { maskapai?: string; asal?: string; tujuan?: string; tanggal?: string; jam?: string };
export type FieldErrors = Partial<Record<keyof FlightQuery, string>>;

/** BTS: 1 = Senin … 7 = Minggu; JavaScript: 0 = Minggu. */
export const btsDow = (jsDay: number) => ((jsDay + 6) % 7) + 1;

export function parseFlight(q: FlightQuery): { input: FlightInput } | { errors: FieldErrors } | null {
  if (!q.maskapai && !q.asal && !q.tujuan && !q.tanggal && !q.jam) return null; // form belum dikirim
  const errors: FieldErrors = {};
  if (!q.maskapai || !CATEGORIES.airline.includes(q.maskapai)) errors.maskapai = "Pilih maskapai dari daftar.";
  if (!q.asal || !ROUTES[q.asal]) errors.asal = "Pilih bandara asal dari daftar.";
  else if (!q.tujuan || !ROUTES[q.asal][q.tujuan]) errors.tujuan = `Pilih tujuan yang diterbangi dari ${q.asal}.`;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(q.tanggal ?? "") ? new Date(`${q.tanggal}T00:00:00Z`) : null;
  if (!date || Number.isNaN(date.getTime())) errors.tanggal = "Isi tanggal keberangkatan.";
  const jam = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(q.jam ?? "");
  if (!jam) errors.jam = "Isi jam jadwal berangkat, misalnya 19:30.";
  if (Object.keys(errors).length || !date || !jam) return { errors };

  const [distance, crs_elapsed] = ROUTES[q.asal!][q.tujuan!];
  return {
    input: {
      airline: q.maskapai!,
      origin: q.asal!,
      dest: q.tujuan!,
      month: date.getUTCMonth() + 1,
      dow: btsDow(date.getUTCDay()),
      crs_dep: Number(jam[1]) * 100 + Number(jam[2]),
      distance,
      crs_elapsed,
    },
  };
}
