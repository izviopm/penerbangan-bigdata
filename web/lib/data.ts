import { cacheLife } from "next/cache";
import { supabase } from "@/lib/supabase";

// Data agregat hanya berubah saat notebook 04 dijalankan ulang → cache per hari cukup.

export type StatRow = {
  year: number;
  month: number;
  flights: number;
  cancelled: number;
  diverted: number;
  avg_dep_delay: number | null;
  class_0: number;
  class_1: number;
  class_2: number;
  class_3: number;
  class_4: number;
  class_5: number;
};
export type AirlineRow = StatRow & { airline: string };
export type OriginRow = StatRow & { origin: string };
export type HourDowRow = { dow: number; hour: number; flights: number; delayed_30: number; class_5: number };
export type ModelRow = {
  approach: "regression" | "classification";
  scenario: string;
  algorithm: string;
  is_best: boolean;
  metrics: {
    accuracy: number;
    macro_f1: number;
    recall_class_5: number;
    precision_class_5: number;
    per_class: Record<string, { precision: number; recall: number; f1: number; support: number }>;
    confusion_matrix: number[][];
    mae?: number;
    rmse?: number;
    r2?: number;
  };
};

/** PostgREST membatasi 1.000 baris per permintaan: hitung dulu, lalu ambil semua halaman sekaligus (paralel). */
async function fetchAll<T>(table: string, columns: string): Promise<T[]> {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw new Error(`Supabase ${table}: ${error.message}`);
  const pages = await Promise.all(
    Array.from({ length: Math.ceil((count ?? 0) / 1000) }, (_, p) =>
      supabase.from(table).select(columns).range(p * 1000, p * 1000 + 999),
    ),
  );
  return pages.flatMap((r) => {
    if (r.error) throw new Error(`Supabase ${table}: ${r.error.message}`);
    return r.data as T[];
  });
}

const STAT = "year, month, flights, cancelled, diverted, avg_dep_delay, class_0, class_1, class_2, class_3, class_4, class_5";

export async function getAirlineMonthly() {
  "use cache";
  cacheLife("days");
  return fetchAll<AirlineRow>("monthly_airline_stats", `airline, ${STAT}`);
}

export async function getOriginMonthly() {
  "use cache";
  cacheLife("days");
  return fetchAll<OriginRow>("monthly_origin_stats", `origin, ${STAT}`);
}

export async function getAirlines() {
  "use cache";
  cacheLife("days");
  const rows = await fetchAll<{ code: string; name: string }>("airlines", "code, name");
  return Object.fromEntries(rows.map((r) => [r.code, r.name]));
}

export async function getAirports() {
  "use cache";
  cacheLife("days");
  const rows = await fetchAll<{ code: string; state: string | null }>("airports", "code, state");
  return Object.fromEntries(rows.map((r) => [r.code, r.state]));
}

export async function getHourDow() {
  "use cache";
  cacheLife("days");
  return fetchAll<HourDowRow>("hour_dow_stats", "dow, hour, flights, delayed_30, class_5");
}

export async function getModelResults() {
  "use cache";
  cacheLife("days");
  return fetchAll<ModelRow>("model_results", "approach, scenario, algorithm, is_best, metrics");
}

// ---------- agregasi (dipakai beranda & dashboard)

export type Totals = { flights: number; operated: number; delayed30: number; class5: number; delaySum: number; classes: number[] };

/** Jumlahkan baris bulanan. Rata-rata delay ditimbang dengan jumlah penerbangan beroperasi. */
export function sumRows(rows: StatRow[]): Totals {
  const t: Totals = { flights: 0, operated: 0, delayed30: 0, class5: 0, delaySum: 0, classes: [0, 0, 0, 0, 0, 0] };
  for (const r of rows) {
    const cls = [r.class_0, r.class_1, r.class_2, r.class_3, r.class_4, r.class_5];
    const op = cls.reduce((a, b) => a + b, 0);
    t.flights += r.flights;
    t.operated += op;
    t.delayed30 += op - r.class_0;
    t.class5 += r.class_5;
    t.delaySum += (r.avg_dep_delay ?? 0) * op;
    cls.forEach((v, k) => (t.classes[k] += v));
  }
  return t;
}

/** % delay ≥ 30 menit per jam jadwal berangkat (semua hari). */
export function delayByHour(rows: HourDowRow[]) {
  return Array.from({ length: 24 }, (_, h) => {
    const hr = rows.filter((r) => r.hour === h);
    const f = hr.reduce((s, r) => s + r.flights, 0);
    return f ? (100 * hr.reduce((s, r) => s + r.delayed_30, 0)) / f : 0;
  });
}
