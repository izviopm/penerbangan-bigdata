import Link from "next/link";
import { LineChart } from "@/components/charts";
import { ModelSwitcher, type ModelView } from "@/components/model-switcher";
import { Pipeline } from "@/components/pipeline";
import stats from "@/content/pipeline-stats.json";
import { delayByHour, getHourDow, getModelResults } from "@/lib/data";
import { dec, juta, pct } from "@/lib/format";
import { PM89 } from "@/lib/pm89";

// OTP sektor transportasi udara Indonesia, Laporan Kinerja Ditjen Perhubungan Udara 2023 (Kemenhub, 2024)
const OTP = { labels: ["2020", "2021", "2022", "2023"], values: [86.01, 81.57, 76.62, 72.46] };

const btnPrimary =
  "inline-flex min-h-12 items-center rounded-lg bg-gold px-6 font-semibold text-gold-foreground transition-colors duration-[var(--dur-short)] hover:bg-orange active:translate-y-px";
const btnOutline =
  "inline-flex min-h-12 items-center rounded-lg border border-primary px-6 font-semibold text-primary transition-colors duration-[var(--dur-short)] hover:bg-card";

export default async function Home() {
  const [hourDow, models] = await Promise.all([getHourDow(), getModelResults()]);
  const byHour = delayByHour(hourDow);
  const find = (a: string, s: string) => models.find((m) => m.approach === a && m.scenario === s && m.algorithm === "xgb")!;
  const views: ModelView[] = [
    { key: "a", tab: "A: regresi", model: find("regression", "S1"), name: "Regresi lalu dikonversi", note: "Model menebak menit delay, lalu hasilnya dipetakan ke kelas. Tebakannya berkumpul di kelas 0 dan 1." },
    { key: "b", tab: "B: klasifikasi", model: find("classification", "S4"), name: "Klasifikasi dengan class weight", note: "Model menebak kelas secara langsung. Website ini memakai model tersebut untuk prediksi." },
  ].map(({ model, ...v }) => ({
    ...v,
    recall: [0, 1, 2, 3, 4, 5].map((k) => model.metrics.per_class[String(k)].recall),
    macroF1: model.metrics.macro_f1,
    accuracy: model.metrics.accuracy,
  }));
  const classPct = Object.values(stats.eda.class_pct);

  return (
    <>
      {/* Hero: Banner, tanpa visual; bagian Cara Kerja mulai terlihat di layar pertama */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-site px-4 pb-16 pt-20 md:px-8 md:pt-28">
          <h1 className="max-w-[16ch] text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-primary md:text-7xl">
            Membaca delay dari {juta(stats.ingest.rows)} penerbangan
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-foreground">
            Regresi atau klasifikasi: mana yang lebih tepat menebak kategori kompensasi PM 89/2015?
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className={btnPrimary}>
              Buka dashboard
            </Link>
            <Link href="#cara-kerja" className={btnOutline}>
              Lihat cara kerja
            </Link>
          </div>
        </div>
      </section>

      {/* Signature: alur data dengan angka asli */}
      <section id="cara-kerja" className="scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto max-w-site px-4 md:px-8">
          <h2 className="max-w-[24ch] text-4xl font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">Dari 36 file CSV ke prediksi</h2>
          <div className="mt-12">
            <Pipeline />
          </div>
        </div>
      </section>

      {/* Bento: empat temuan dari data */}
      <section className="border-y border-border bg-card/60 py-20 md:py-28">
        <div className="mx-auto max-w-site px-4 md:px-8">
          <h2 className="max-w-[24ch] text-4xl font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">
            Yang terlihat dari {juta(stats.eda.rows_operated)} penerbangan
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <figure className="min-w-0 rounded-xl border border-border bg-card p-6 lg:col-span-8 lg:p-8">
              <h3 className="text-2xl font-extrabold text-foreground">Delay naik sepanjang hari</h3>
              <div className="mt-6">
                <LineChart
                  values={byHour}
                  labels={byHour.map((_, h) => `${String(h).padStart(2, "0")}.00`)}
                  marks={[5, byHour.indexOf(Math.max(...byHour.slice(5)))]}
                  ticks={[0, 5, 10, 15, 20, 23]}
                  title="Persentase penerbangan delay minimal 30 menit menurut jam jadwal berangkat"
                />
              </div>
              <figcaption className="mt-3 text-sm text-muted-foreground">Delay minimal 30 menit menurut jam jadwal berangkat, semua hari.</figcaption>
            </figure>
            <div className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-card p-6 lg:col-span-4 lg:p-8">
              <p className="text-6xl font-extrabold tracking-[-0.03em] tabular-nums text-primary">{pct(classPct[0])}</p>
              <p className="mt-6 text-lg text-foreground">penerbangan tepat waktu atau terlambat kurang dari 30 menit (kelas 0).</p>
            </div>
            <div className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-card p-6 lg:col-span-4 lg:p-8">
              <p className="text-6xl font-extrabold tracking-[-0.03em] tabular-nums text-orange-text">{dec(stats.eda.imbalance_ratio_0_vs_5, 0)} kali</p>
              <p className="mt-6 text-lg text-foreground">lebih banyak kelas 0 daripada kelas 5. Model yang selalu menebak kelas 0 sudah mendapat akurasi 86%.</p>
            </div>
            <figure className="min-w-0 rounded-xl border border-border bg-card p-6 lg:col-span-8 lg:p-8">
              <h3 className="text-2xl font-extrabold text-foreground">OTP Indonesia turun dari 86% ke 72%</h3>
              <div className="mt-6">
                <LineChart values={OTP.values} labels={OTP.labels} marks={[0, 3]} yMin={60} height={180} title="On-time performance penerbangan Indonesia 2020 sampai 2023" />
              </div>
              <figcaption className="mt-3 text-sm text-muted-foreground">
                On-time performance sektor transportasi udara. Sumber: Laporan Kinerja Ditjen Perhubungan Udara 2023. Sumbu dimulai dari 60%.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Switcher: pendekatan A vs B */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-site px-4 md:px-8">
          <h2 className="max-w-[24ch] text-4xl font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">Hanya satu pendekatan menangkap kelas 5</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Bandingkan recall per kelas dua model XGBoost terbaik dari 16 model yang diuji.</p>
          <div className="mt-12">
            <ModelSwitcher views={views} />
          </div>
        </div>
      </section>

      {/* Tabel PM 89/2015 dengan porsi nyata di data */}
      <section className="border-t border-border bg-card/60 py-20 md:py-28">
        <div className="mx-auto max-w-site px-4 md:px-8">
          <h2 className="max-w-[24ch] text-4xl font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">Kategori kompensasi PM 89/2015</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Kelas 1 sampai 5 mengikuti Pasal 3 dan Pasal 9. Kelas 0 kami tambahkan untuk delay di bawah 30 menit.</p>
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="py-3 pr-4 font-semibold">Kelas</th>
                  <th className="py-3 pr-4 font-semibold">Lama delay</th>
                  <th className="py-3 pr-4 font-semibold">Kompensasi</th>
                  <th className="py-3 text-right font-semibold">Porsi di data</th>
                </tr>
              </thead>
              <tbody>
                {PM89.map((r) => (
                  <tr key={r.kelas} className="border-b border-border">
                    <td className={`py-4 pr-4 text-lg font-extrabold tabular-nums ${r.kelas === 5 ? "text-orange-text" : "text-primary"}`}>{r.kelas}</td>
                    <td className="py-4 pr-4 tabular-nums text-foreground">{r.rentang}</td>
                    <td className="py-4 pr-4 text-foreground">{r.kompensasi}</td>
                    <td className="py-4 text-right tabular-nums text-foreground">{pct(classPct[r.kelas])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Penutup: aksi yang sama dengan hero */}
      <section className="border-t border-border py-20 md:py-24">
        <div className="mx-auto flex max-w-site flex-col items-start gap-8 px-4 md:px-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-[22ch] text-4xl font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">
            Bandingkan maskapai, bandara, dan jam rawan di dashboard.
          </p>
          <Link href="/dashboard" className={btnPrimary}>
            Buka dashboard
          </Link>
        </div>
      </section>
    </>
  );
}
