"use client";

import Form from "next/form";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { FieldErrors, FlightQuery } from "@/lib/flight";

export type RouteOptions = Record<string, [dest: string, distance: number, elapsed: number][]>;

type Props = {
  airlines: { code: string; name: string }[];
  airports: Record<string, string | null>;
  routes: RouteOptions;
  values: FlightQuery;
  errors: FieldErrors;
};

const field =
  "mt-1 block min-h-11 w-full rounded-lg border bg-card px-3 text-foreground outline-offset-0 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-55";

export function PredictForm({ airlines, airports, routes, values, errors }: Props) {
  const [asal, setAsal] = useState(values.asal ?? "");
  const [tujuan, setTujuan] = useState(values.tujuan ?? "");
  // Tanpa JavaScript tujuan tidak bisa disaring per asal: tampilkan semua, server yang memvalidasi rutenya
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);
  const allDests = useMemo(
    () => [...new Set(Object.values(routes).flatMap((r) => r.map(([d]) => d)))].sort().map((d) => [d, 0, 0] as [string, number, number]),
    [routes],
  );
  const dests = js ? (routes[asal] ?? []) : allDests;
  const route = (routes[asal] ?? []).find(([d]) => d === tujuan);
  const place = (c: string) => (airports[c] ? `${c}, ${airports[c]}` : c);

  const err = (k: keyof FlightQuery) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-1 text-sm text-destructive">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof FlightQuery) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${k}-err` : `${k}-help`,
    className: `${field} ${errors[k] ? "border-destructive" : "border-muted-foreground"}`,
  });

  return (
    <Form action="/prediksi" className="space-y-5" noValidate>
      <div>
        <label htmlFor="maskapai" className="text-sm font-semibold text-foreground">
          Maskapai
        </label>
        <select id="maskapai" name="maskapai" defaultValue={values.maskapai ?? ""} required {...aria("maskapai")}>
          <option value="" disabled>
            Pilih maskapai
          </option>
          {airlines.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name} ({a.code})
            </option>
          ))}
        </select>
        <p id="maskapai-help" className="sr-only">
          15 maskapai yang melapor ke BTS
        </p>
        {err("maskapai")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="asal" className="text-sm font-semibold text-foreground">
            Bandara asal
          </label>
          <select
            id="asal"
            name="asal"
            value={asal}
            onChange={(e) => {
              setAsal(e.target.value);
              setTujuan("");
            }}
            required
            {...aria("asal")}
          >
            <option value="" disabled>
              Pilih bandara
            </option>
            {Object.keys(routes).map((o) => (
              <option key={o} value={o}>
                {place(o)}
              </option>
            ))}
          </select>
          <p id="asal-help" className="sr-only">
            Kode IATA dan negara bagian
          </p>
          {err("asal")}
        </div>
        <div className="min-w-0">
          <label htmlFor="tujuan" className="text-sm font-semibold text-foreground">
            Bandara tujuan
          </label>
          <select id="tujuan" name="tujuan" value={tujuan} onChange={(e) => setTujuan(e.target.value)} disabled={js && !asal} required {...aria("tujuan")}>
            <option value="" disabled>
              {!js ? "Pilih bandara" : asal ? `${dests.length} tujuan dari ${asal}` : "Pilih asal dulu"}
            </option>
            {dests.map(([d]) => (
              <option key={d} value={d}>
                {place(d)}
              </option>
            ))}
          </select>
          {err("tujuan")}
        </div>
      </div>
      <p id="tujuan-help" className="min-h-[1lh] text-sm text-muted-foreground" aria-live="polite">
        {route
          ? `${route[1].toLocaleString("id-ID")} mil, durasi terjadwal ${route[2]} menit. Keduanya diisi otomatis dari data rute.`
          : "Jarak dan durasi terjadwal diisi otomatis setelah rute dipilih."}
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="tanggal" className="text-sm font-semibold text-foreground">
            Tanggal berangkat
          </label>
          <input id="tanggal" name="tanggal" type="date" defaultValue={values.tanggal} required {...aria("tanggal")} />
          <p id="tanggal-help" className="mt-1 text-sm text-muted-foreground">
            Model memakai bulan dan harinya.
          </p>
          {err("tanggal")}
        </div>
        <div className="min-w-0">
          <label htmlFor="jam" className="text-sm font-semibold text-foreground">
            Jam jadwal berangkat
          </label>
          <input id="jam" name="jam" type="time" defaultValue={values.jam} required {...aria("jam")} />
          <p id="jam-help" className="mt-1 text-sm text-muted-foreground">
            Waktu lokal bandara asal.
          </p>
          {err("jam")}
        </div>
      </div>

      <Submit />
    </Form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-busy={pending || undefined}
      className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-6 font-semibold text-gold-foreground transition-colors duration-[var(--dur-short)] hover:bg-orange active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 aria-busy:cursor-progress sm:w-auto"
    >
      {pending && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-gold-foreground border-t-transparent" />}
      {pending ? "Memprediksi…" : "Prediksi"}
    </button>
  );
}
