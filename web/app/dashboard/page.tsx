import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClassBar, HourDowHeatmap, LineChart } from "@/components/charts";
import {
  getAirlineMonthly,
  getAirlines,
  getAirports,
  getHourDow,
  getOriginMonthly,
  sumRows,
  type StatRow,
} from "@/lib/data";
import { dec, num, pct } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard keterlambatan",
  description: "Delay penerbangan domestik Amerika Serikat 2023 sampai 2025 per bulan, maskapai, bandara, dan jam.",
};

const YEARS = ["semua", "2023", "2024", "2025"] as const;
const TABS = ["maskapai", "bandara"] as const;
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

type Search = Promise<{ tahun?: string; tabel?: string }>;

export default function DashboardPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="mx-auto max-w-site px-4 py-10 md:px-8">
      <Suspense fallback={<Skeleton />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const href = (tahun: string, tabel: string) => `/dashboard?tahun=${tahun}&tabel=${tabel}`;

async function Dashboard({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const tahun = (YEARS as readonly string[]).includes(sp.tahun ?? "") ? sp.tahun! : "semua";
  const tabel = (TABS as readonly string[]).includes(sp.tabel ?? "") ? sp.tabel! : "maskapai";
  const inYear = <T extends StatRow>(rows: T[]) => (tahun === "semua" ? rows : rows.filter((r) => r.year === Number(tahun)));

  const [airlineRows, originRows, airlines, airports, hourDow] = await Promise.all([
    getAirlineMonthly(),
    getOriginMonthly(),
    getAirlines(),
    getAirports(),
    getHourDow(),
  ]);
  const rows = inYear(airlineRows);
  const label = tahun === "semua" ? "2023 sampai 2025" : `tahun ${tahun}`;

  const t = sumRows(rows);
  if (t.operated === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <h1 className="text-3xl font-extrabold text-foreground">Belum ada data untuk {label}</h1>
        <p className="mt-2 text-muted-foreground">Tabel agregat di Supabase kosong untuk pilihan ini. Jalankan ulang notebook 04_export atau pilih periode lain.</p>
        <Link href={href("semua", tabel)} className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-primary px-5 font-semibold text-primary hover:bg-muted">
          Tampilkan semua tahun
        </Link>
      </div>
    );
  }

  // tren bulanan
  const months = [...new Set(rows.map((r) => r.year * 100 + r.month))].sort((a, b) => a - b);
  const trend = months.map((ym) => {
    const s = sumRows(rows.filter((r) => r.year * 100 + r.month === ym));
    return (100 * s.delayed30) / s.operated;
  });
  const trendLabels = months.map((ym) => `${BULAN[(ym % 100) - 1]} ${Math.floor(ym / 100)}`);
  const peak = trend.indexOf(Math.max(...trend));
  const low = trend.indexOf(Math.min(...trend));

  // heatmap hari × jam (tabel ini tidak dipecah per tahun)
  const grid = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      const r = hourDow.find((x) => x.dow === d + 1 && x.hour === h);
      return r && r.flights ? (100 * r.delayed_30) / r.flights : 0;
    }),
  );

  // tabel maskapai / bandara
  const groupBy = <T extends StatRow>(src: T[], key: (r: T) => string) => {
    const m = new Map<string, T[]>();
    for (const r of src) m.set(key(r), [...(m.get(key(r)) ?? []), r]);
    return [...m.entries()].map(([k, rs]) => ({ k, s: sumRows(rs), cancelled: rs.reduce((a, r) => a + r.cancelled, 0) }));
  };
  const minFlights = Math.round((20000 * months.length) / 36); // ambang bandara: 20.000 penerbangan per 3 tahun
  const table =
    tabel === "maskapai"
      ? groupBy(rows as (StatRow & { airline: string })[], (r) => r.airline).map((g) => ({ ...g, name: airlines[g.k] ?? g.k, sub: g.k }))
      : groupBy(inYear(originRows), (r) => r.origin)
          .filter((g) => g.s.flights >= minFlights)
          .map((g) => ({ ...g, name: g.k, sub: airports[g.k] ?? "" }));
  table.sort((a, b) => b.s.delayed30 / b.s.operated - a.s.delayed30 / a.s.operated);
  const shown = tabel === "maskapai" ? table : table.slice(0, 15);

  const figures = [
    { label: "Penerbangan", value: num(t.flights) },
    { label: "Delay minimal 30 menit", value: pct((100 * t.delayed30) / t.operated) },
    { label: "Rata-rata delay berangkat", value: `${dec(t.delaySum / t.operated, 1)} menit` },
    { label: "Delay lebih dari 240 menit (kelas 5)", value: num(t.class5), accent: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Dashboard keterlambatan</h1>
          <p className="mt-1 text-muted-foreground">Penerbangan domestik Amerika Serikat, {label}.</p>
        </div>
        <nav aria-label="Periode" className="inline-flex self-start rounded-lg bg-muted p-1">
          {YEARS.map((y) => (
            <Link
              key={y}
              href={href(y, tabel)}
              aria-current={y === tahun ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-md px-4 text-sm font-semibold active:translate-y-px aria-disabled:cursor-not-allowed aria-disabled:opacity-55 transition-colors duration-[var(--dur-short)] ${
                y === tahun ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {y === "semua" ? "Semua" : y}
            </Link>
          ))}
        </nav>
      </div>

      <dl className="grid grid-cols-2 gap-y-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-4">
        {figures.map((f, i) => (
          // garis pemisah hanya di antara item: 2 kolom di HP (item 1 & 3), 4 kolom di layar lebar (item 1–3)
          <div key={f.label} className={["min-w-0 border-border", ["pr-4", "border-l px-4", "pr-4 lg:border-l lg:px-4", "border-l px-4"][i]].join(" ")}>
            <dt className="text-sm text-muted-foreground">{f.label}</dt>
            <dd className={`mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl ${f.accent ? "text-orange-text" : "text-foreground"}`}>{f.value}</dd>
          </div>
        ))}
      </dl>

      <figure className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-foreground">Jam dan hari paling rawan delay</h2>
          <p className="text-sm text-muted-foreground">Makin gelap, makin sering delay minimal 30 menit</p>
        </div>
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[36rem]">
            <HourDowHeatmap grid={grid} title="Persentase delay minimal 30 menit menurut hari dan jam jadwal berangkat" />
          </div>
        </div>
        <figcaption className="mt-3 text-sm text-muted-foreground">
          Jam jadwal berangkat, waktu lokal bandara. Heatmap ini memakai seluruh periode 2023 sampai 2025 karena tabelnya tidak dipecah per tahun.
        </figcaption>
      </figure>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <figure className="min-w-0 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">Delay minimal 30 menit per bulan</h2>
          <div className="mt-5">
            <LineChart
              values={trend}
              labels={trendLabels}
              marks={[peak, low]}
              ticks={months.length > 12 ? months.map((_, i) => i).filter((i) => i % 6 === 0) : months.map((_, i) => i).filter((i) => i % 2 === 0)}
              title={`Persentase delay minimal 30 menit per bulan, ${label}`}
            />
          </div>
          <figcaption className="mt-3 text-sm text-muted-foreground">
            Tertinggi {trendLabels[peak]} ({pct(trend[peak])}), terendah {trendLabels[low]} ({pct(trend[low])}).
          </figcaption>
        </figure>
        <figure className="min-w-0 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">Sebaran kelas PM 89/2015</h2>
          <div className="mt-6">
            <ClassBar shares={t.classes.map((c) => (100 * c) / t.operated)} />
          </div>
          <figcaption className="mt-4 text-sm text-muted-foreground">Dari {num(t.operated)} penerbangan yang beroperasi (tanpa batal dan dialihkan).</figcaption>
        </figure>
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {tabel === "maskapai" ? "Maskapai menurut delay minimal 30 menit" : "15 bandara asal paling sering delay"}
          </h2>
          <nav aria-label="Tabel" className="inline-flex self-start rounded-lg bg-muted p-1">
            {TABS.map((tb) => (
              <Link
                key={tb}
                href={href(tahun, tb)}
                aria-current={tb === tabel ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-md px-4 text-sm font-semibold active:translate-y-px aria-disabled:cursor-not-allowed aria-disabled:opacity-55 capitalize transition-colors duration-[var(--dur-short)] ${
                  tb === tabel ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tb}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="py-3 pr-4 font-semibold">{tabel === "maskapai" ? "Maskapai" : "Bandara asal"}</th>
                <th className="py-3 pr-4 text-right font-semibold">Penerbangan</th>
                <th className="py-3 pr-4 text-right font-semibold">Delay ≥ 30 menit</th>
                <th className="hidden sm:table-cell py-3 pr-4 text-right font-semibold">Kelas 5</th>
                <th className="hidden sm:table-cell py-3 pr-4 text-right font-semibold">Rata-rata delay</th>
                <th className="hidden sm:table-cell py-3 text-right font-semibold">Batal</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.k} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-foreground">{r.name}</span>
                    {r.sub && <span className="ml-2 text-sm text-muted-foreground">{r.sub}</span>}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-foreground">{num(r.s.flights)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums font-semibold text-foreground">{pct((100 * r.s.delayed30) / r.s.operated)}</td>
                  <td className="hidden sm:table-cell py-3 pr-4 text-right tabular-nums text-foreground">{pct((100 * r.s.class5) / r.s.operated)}</td>
                  <td className="hidden sm:table-cell py-3 pr-4 text-right tabular-nums text-foreground">{dec(r.s.delaySum / r.s.operated, 1)} menit</td>
                  <td className="hidden sm:table-cell py-3 text-right tabular-nums text-foreground">{pct((100 * r.cancelled) / r.s.flights)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tabel === "bandara" && (
          <p className="mt-3 text-sm text-muted-foreground">Hanya bandara dengan minimal {num(minFlights)} penerbangan pada periode ini.</p>
        )}
      </section>

      <p className="text-sm text-muted-foreground">
        Sumber: U.S. Bureau of Transportation Statistics, On-Time Performance. Diolah di notebook 01 sampai 04, disimpan di Supabase.
      </p>
    </div>
  );
}

function Skeleton() {
  const block = "animate-pulse rounded-xl bg-muted";
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Memuat dashboard">
      <div className={`${block} h-16 w-80`} />
      <div className={`${block} h-28`} />
      <div className={`${block} h-72`} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className={`${block} h-80`} />
        <div className={`${block} h-80`} />
      </div>
    </div>
  );
}
