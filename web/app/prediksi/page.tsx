import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PredictForm, type RouteOptions } from "@/components/predict-form";
import stats from "@/content/pipeline-stats.json";
import { getAirlines, getAirports } from "@/lib/data";
import { ROUTES, parseFlight, type FlightQuery } from "@/lib/flight";
import { dec, num } from "@/lib/format";
import { PM89 } from "@/lib/pm89";
import { predict } from "@/lib/predict";

export const metadata: Metadata = {
  title: "Prediksi kategori delay",
  description: "Pilih maskapai, rute, tanggal, dan jam untuk melihat kategori kompensasi PM 89/2015 yang paling mungkin.",
};

type Search = Promise<FlightQuery>;
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Opsi rute untuk form: tanpa jumlah penerbangan agar data ke browser lebih kecil
const ROUTE_OPTIONS: RouteOptions = Object.fromEntries(
  Object.entries(ROUTES).map(([o, ds]) => [o, Object.entries(ds).map(([d, [dist, el]]) => [d, dist, el] as [string, number, number])]),
);

export default function PrediksiPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto max-w-site px-4 py-10 md:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Prediksi kategori delay</h1>
      <p className="mt-1 max-w-2xl text-muted-foreground">
        Isi jadwal penerbangan. Model B-S4 XGBoost menebak kelas PM 89/2015 dari pola {num(stats.ingest.rows)} penerbangan 2023 sampai 2025.
      </p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-xl bg-muted" aria-busy="true" aria-label="Memuat form" />}>
        <Prediksi searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Prediksi({ searchParams }: { searchParams: Search }) {
  const q = await searchParams;
  const [airlineNames, airports] = await Promise.all([getAirlines(), getAirports()]);
  const parsed = parseFlight(q);
  const pred = parsed && "input" in parsed ? (await predict([parsed.input]))[0] : null;
  const airlines = Object.entries(airlineNames)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-labelledby="form-title" className="min-w-0 self-start rounded-xl border border-border bg-card p-6">
        <h2 id="form-title" className="text-xl font-semibold text-foreground">
          Jadwal penerbangan
        </h2>
        <div className="mt-5">
          <PredictForm
            airlines={airlines}
            airports={airports}
            routes={ROUTE_OPTIONS}
            values={q}
            errors={parsed && "errors" in parsed ? parsed.errors : {}}
          />
        </div>
      </section>

      <section aria-labelledby="hasil-title" aria-live="polite" className="min-w-0">
        {pred && parsed && "input" in parsed ? (
          <Result kelas={pred.kelas} probabilities={pred.probabilities} q={q} airline={airlineNames[q.maskapai!] ?? q.maskapai!} input={parsed.input} />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8">
            <h2 id="hasil-title" className="text-xl font-semibold text-foreground">
              Hasil muncul di sini
            </h2>
            <p className="mt-2 max-w-prose text-muted-foreground">
              Kelas PM 89/2015 yang paling mungkin, hak kompensasi penumpang untuk kelas itu, dan skor model untuk keenam kelas. Hasil
              tersimpan di alamat halaman, jadi bisa dibagikan.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Result({
  kelas,
  probabilities,
  q,
  airline,
  input,
}: {
  kelas: number;
  probabilities: number[];
  q: FlightQuery;
  airline: string;
  input: { distance: number; crs_elapsed: number };
}) {
  const rule = PM89[kelas];
  const top = Math.max(...probabilities);
  const tanggal = new Date(`${q.tanggal}T00:00:00Z`);
  return (
    <div className="rounded-xl border border-border bg-card p-6 lg:p-8">
      <p className="text-sm text-muted-foreground">
        {airline}, {q.asal} ke {q.tujuan}, {HARI[tanggal.getUTCDay()]} {tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })} pukul {q.jam}
      </p>
      <h2 id="hasil-title" className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`text-6xl font-extrabold tabular-nums ${kelas === 5 ? "text-orange-text" : "text-primary"}`}>Kelas {kelas}</span>
        <span className="text-2xl font-semibold text-foreground">{rule.rentang}</span>
      </h2>
      <p className="mt-3 text-lg text-foreground">
        <span className="font-semibold">Hak penumpang menurut PM 89/2015:</span> {rule.kompensasi}
      </p>

      <h3 className="mt-8 text-sm font-semibold text-foreground">Skor model per kelas</h3>
      <ul className="mt-3 space-y-2">
        {probabilities.map((p, k) => (
          <li key={k} className="grid grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] items-center gap-3">
            <span className={`text-sm ${k === kelas ? "font-semibold text-foreground" : "text-muted-foreground"}`}>Kelas {k}</span>
            <span className="h-4 rounded-sm bg-muted">
              <span
                className="block h-full rounded-sm"
                style={{
                  width: `${(100 * p) / top}%`,
                  background: k === kelas ? (k === 5 ? "var(--orange)" : "var(--primary)") : "var(--border)",
                }}
              />
            </span>
            <span className="text-right text-sm tabular-nums text-foreground">{dec(p, 2)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-border pt-5 text-sm text-muted-foreground">
        <p>
          Skor ini peringkat risiko relatif, bukan peluang. Model dilatih dengan class weight agar kelas langka tertangkap, sehingga
          skornya condong ke kelas tinggi. Pada data uji, presisi kelas 5 hanya {dec(stats.model.precision_class_5 * 100, 1)}%.
        </p>
        <p className="mt-2">
          Jarak {num(input.distance)} mil dan durasi terjadwal {input.crs_elapsed} menit diambil dari data rute. Cuaca dan delay penerbangan
          sebelumnya tidak ikut dihitung.
        </p>
        <p className="mt-4">
          Sudah tahu lama delay-nya?{" "}
          <Link href="/kompensasi" className="font-semibold text-primary underline-offset-4 hover:underline">
            Hitung kompensasi
          </Link>
        </p>
      </div>
    </div>
  );
}
