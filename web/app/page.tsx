// shortcut: halaman sementara untuk uji fondasi (Supabase + model); diganti beranda versi hallmark di fase 2
import { getTotals } from "@/lib/data";

export default async function Home() {
  const t = await getTotals();
  const fmt = new Intl.NumberFormat("id-ID");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-24">
      <h1 className="text-3xl font-bold text-primary">Penerbangan Big Data</h1>
      <p className="mt-4 text-muted-foreground">Website sedang dibangun. Data dari Supabase sudah terbaca:</p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <dt className="text-sm text-muted-foreground">Penerbangan 2023–2025</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums">{fmt.format(t.flights)}</dd>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <dt className="text-sm text-muted-foreground">Delay lebih dari 240 menit (kelas 5)</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums text-orange">{fmt.format(t.class5)}</dd>
        </div>
      </dl>
    </main>
  );
}
