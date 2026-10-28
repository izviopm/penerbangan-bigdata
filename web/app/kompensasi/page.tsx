import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { PM89, toClass } from "@/lib/pm89";

export const metadata: Metadata = {
  title: "Hitung kompensasi delay",
  description: "Masukkan lama keterlambatan untuk melihat kategori dan kompensasi menurut PM 89/2015.",
};

type Search = Promise<{ menit?: string }>;

export default function KompensasiPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto max-w-site px-4 py-10 md:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Hitung kompensasi delay</h1>
      <p className="mt-1 max-w-2xl text-muted-foreground">
        Masukkan lama keterlambatan dalam menit. Hitungan ini memakai aturan PM 89/2015 saja, tanpa model.
      </p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-xl bg-muted" aria-busy="true" aria-label="Memuat" />}>
        <Kompensasi searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Kompensasi({ searchParams }: { searchParams: Search }) {
  const { menit } = await searchParams;
  const raw = (menit ?? "").trim();
  const value = raw === "" ? null : Number(raw);
  const error = value !== null && (!Number.isInteger(value) || value < 0 || value > 2880) ? "Isi bilangan bulat 0 sampai 2.880 menit." : null;
  const kelas = value !== null && !error ? toClass(value) : null;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-labelledby="form-title" className="min-w-0 self-start rounded-xl border border-border bg-card p-6">
        <h2 id="form-title" className="text-xl font-semibold text-foreground">
          Lama keterlambatan
        </h2>
        <Form action="/kompensasi" className="mt-5" noValidate>
          <label htmlFor="menit" className="text-sm font-semibold text-foreground">
            Menit dari jadwal berangkat
          </label>
          <div className="mt-1 flex gap-3">
            <input
              id="menit"
              name="menit"
              type="number"
              inputMode="numeric"
              min={0}
              max={2880}
              step={1}
              defaultValue={raw}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "menit-err" : "menit-help"}
              className={`block min-h-12 w-full min-w-0 rounded-lg border bg-card px-3 text-lg tabular-nums text-foreground outline-offset-0 focus-visible:outline-2 focus-visible:outline-ring ${
                error ? "border-destructive" : "border-muted-foreground"
              }`}
            />
            <button
              type="submit"
              className="inline-flex min-h-12 shrink-0 cursor-pointer items-center rounded-lg bg-gold px-6 font-semibold text-gold-foreground transition-colors duration-[var(--dur-short)] hover:bg-orange active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
            >
              Hitung
            </button>
          </div>
          {error ? (
            <p id="menit-err" className="mt-1 text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p id="menit-help" className="mt-1 text-sm text-muted-foreground">
              Pasal 4: dihitung sejak pesawat dijadwalkan meninggalkan apron sampai benar-benar berangkat.
            </p>
          )}
        </Form>

        <div className="mt-8 space-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
          <p>Pasal 6: ganti rugi hanya wajib bila delay disebabkan faktor manajemen maskapai. Delay karena cuaca atau kondisi bandara dibebaskan.</p>
          <p>Pasal 9: untuk kategori 2 sampai 5, penumpang juga boleh dialihkan ke penerbangan berikutnya atau meminta refund.</p>
          <p>Pasal 10: bila delay lebih dari 6 jam dan penumpang butuh penginapan, maskapai wajib menyediakan akomodasi.</p>
          <p>Pasal 12: ganti rugi kategori 5 dibayar paling lambat 3 × 24 jam.</p>
        </div>
      </section>

      <section aria-labelledby="hasil-title" aria-live="polite" className="min-w-0 rounded-xl border border-border bg-card p-6 lg:p-8">
        {kelas === null ? (
          <h2 id="hasil-title" className="text-xl font-semibold text-foreground">
            Isi menit untuk menyorot kategorinya
          </h2>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">Delay {value!.toLocaleString("id-ID")} menit</p>
            <h2 id="hasil-title" className="mt-2 flex flex-wrap items-baseline gap-x-4">
              <span className={`text-6xl font-extrabold tabular-nums ${kelas === 5 ? "text-orange-text" : "text-primary"}`}>Kelas {kelas}</span>
              <span className="text-2xl font-semibold text-foreground">{PM89[kelas].rentang}</span>
            </h2>
            <p className="mt-3 text-lg text-foreground">{PM89[kelas].kompensasi}</p>
          </div>
        )}

        <ol className="mt-8 divide-y divide-border border-y border-border">
          {PM89.map((r) => {
            const on = r.kelas === kelas;
            return (
              <li
                key={r.kelas}
                aria-current={on ? "true" : undefined}
                className={`grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 px-3 py-3 sm:grid-cols-[3rem_8rem_minmax(0,1fr)] ${on ? "bg-muted" : ""}`}
              >
                <span className={`text-lg font-extrabold tabular-nums ${r.kelas === 5 ? "text-orange-text" : "text-primary"}`}>{r.kelas}</span>
                <span className="tabular-nums text-foreground">{r.rentang}</span>
                <span className={`col-start-2 sm:col-start-auto ${on ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.kompensasi}</span>
              </li>
            );
          })}
          <li className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 px-3 py-3 sm:grid-cols-[3rem_8rem_minmax(0,1fr)]">
            <span className="text-lg font-extrabold tabular-nums text-muted-foreground">6</span>
            <span className="text-foreground">Pembatalan</span>
            <span className="col-start-2 text-muted-foreground sm:col-start-auto">Dialihkan ke penerbangan berikutnya atau refund penuh.</span>
          </li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          Belum tahu lama delay-nya?{" "}
          <Link href="/prediksi" className="font-semibold text-primary underline-offset-4 hover:underline">
            Prediksi kategorinya dari jadwal
          </Link>
        </p>
      </section>
    </div>
  );
}
