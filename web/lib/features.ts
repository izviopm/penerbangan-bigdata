// Tiruan make_features() di notebooks/03_model.ipynb & 04_export.ipynb.
// Wajib identik dengan Python: dibuktikan oleh tests/parity.test.ts.
import encoders from "@/models/encoders.json";

export type FlightInput = {
  airline: string;
  origin: string;
  dest: string;
  month: number; // 1–12
  dow: number; // 1 = Senin … 7 = Minggu (konvensi BTS)
  crs_dep: number; // jadwal berangkat HHMM, mis. 856 = 08:56
  distance: number; // mil
  crs_elapsed: number; // durasi terjadwal, menit
};

type Cat = "airline" | "origin" | "dest";
export const CATEGORIES = encoders.categories as Record<Cat, string[]>;
export const FEATURES = encoders.features as string[];

const CODES = Object.fromEntries(
  (Object.keys(CATEGORIES) as Cat[]).map((c) => [c, new Map(CATEGORIES[c].map((v, i) => [v, i]))]),
) as Record<Cat, Map<string, number>>;

export function makeFeatures(r: FlightInput): number[] {
  const mins = ((Math.floor(r.crs_dep / 100) * 60 + (r.crs_dep % 100)) % 1440 + 1440) % 1440;
  const tau = 2 * Math.PI;
  return [
    CODES.airline.get(r.airline) ?? -1, // kategori tak dikenal → -1, sama dengan pd.Categorical
    CODES.origin.get(r.origin) ?? -1,
    CODES.dest.get(r.dest) ?? -1,
    r.dow,
    Math.sin((tau * r.month) / 12),
    Math.cos((tau * r.month) / 12),
    Math.sin((tau * mins) / 1440),
    Math.cos((tau * mins) / 1440),
    r.distance,
    r.crs_elapsed,
  ];
}
