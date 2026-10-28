import type { Metadata } from "next";
import stats from "@/content/pipeline-stats.json";
import { getModelResults, type ModelRow } from "@/lib/data";
import { dec, num } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tentang model",
  description: "Hasil 16 model regresi dan klasifikasi untuk kategori kompensasi PM 89/2015, dan alasan memilih model web.",
};

const SHORT: Record<string, string> = { lr: "LR", dt: "DT", rf: "RF", xgb: "XGBoost" };
const ALGO: Record<string, string> = { lr: "Linear/Logistic Regression", dt: "Decision Tree", rf: "Random Forest", xgb: "XGBoost" };
const SKENARIO: Record<string, string> = {
  S1: "Regresi, target menit asli",
  S2: "Regresi, target log",
  S3: "Klasifikasi tanpa bobot",
  S4: "Klasifikasi dengan class weight",
};
const ORDER = ["S1", "S2", "S3", "S4"].flatMap((s) => ["lr", "dt", "rf", "xgb"].map((a) => `${s}-${a}`));

const shade = (p: number) => `color-mix(in oklab, var(--primary) ${Math.round(Math.min(100, p))}%, var(--card))`;

function Confusion({ model, title }: { model: ModelRow; title: string }) {
  const cm = model.metrics.confusion_matrix;
  return (
    <figure className="min-w-0">
      <figcaption className="font-semibold text-foreground">{title}</figcaption>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-center text-xs tabular-nums sm:text-sm">
          <caption className="sr-only">Persen per kelas aktual; baris kelas aktual, kolom kelas prediksi</caption>
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="py-2 text-left font-semibold">
                Aktual
              </th>
              {cm.map((_, j) => (
                <th key={j} scope="col" className="py-2 font-semibold">
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cm.map((row, i) => {
              const total = row.reduce((a, b) => a + b, 0);
              return (
                <tr key={i}>
                  <th scope="row" className="py-1 pr-2 text-left font-semibold text-muted-foreground">
                    {i}
                  </th>
                  {row.map((v, j) => {
                    const p = (100 * v) / total;
                    const hit = i === 5 && j === 5;
                    return (
                      <td
                        key={j}
                        className={`border border-card py-2 ${hit ? "font-extrabold text-orange-foreground" : p > 45 ? "text-primary-foreground" : "text-foreground"}`}
                        style={{ background: hit ? "var(--orange)" : shade(p) }}
                      >
                        {dec(p, 0)}%
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export default async function ModelPage() {
  const rows = await getModelResults();
  const by = new Map(rows.map((r) => [`${r.scenario}-${r.algorithm}`, r]));
  const ordered = ORDER.map((k) => by.get(k)).filter((r): r is ModelRow => !!r);
  const a = by.get("S1-xgb");
  const b = by.get("S4-xgb");

  if (ordered.length === 0 || !a || !b) {
    return (
      <div className="mx-auto max-w-site px-4 py-10 md:px-8">
        <h1 className="text-3xl font-extrabold text-foreground">Hasil model belum tersedia</h1>
        <p className="mt-2 text-muted-foreground">Tabel model_results di Supabase kosong. Jalankan notebook 04_export untuk mengisinya.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-site space-y-8 px-4 py-10 md:px-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Tentang model</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          16 model diuji pada sampel {num(stats.model.n_sample)} penerbangan, dibagi {num(stats.model.n_train)} data latih dan{" "}
          {num(stats.model.n_test)} data uji yang sama untuk semua model. Hyperparameter dibuat sama untuk kedua pendekatan.
        </p>
      </div>

      <section aria-labelledby="tabel-title" className="rounded-xl border border-border bg-card p-6">
        <h2 id="tabel-title" className="text-xl font-semibold text-foreground">
          16 model pada data uji
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm sm:min-w-[52rem]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="hidden py-3 pr-4 font-semibold sm:table-cell">Skenario</th>
                <th className="py-3 pr-4 font-semibold">Algoritma</th>
                <th className="hidden py-3 pr-4 text-right font-semibold sm:table-cell">Akurasi</th>
                <th className="py-3 pr-4 text-right font-semibold">Macro F1</th>
                <th className="py-3 pr-4 text-right font-semibold">Recall kelas 5</th>
                <th className="hidden py-3 pr-4 text-right font-semibold sm:table-cell">Presisi kelas 5</th>
                <th className="hidden py-3 text-right font-semibold sm:table-cell">MAE</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((r) => {
                const m = r.metrics;
                return (
                  <tr key={`${r.scenario}-${r.algorithm}`} className={`border-b border-border last:border-0 ${r.is_best ? "bg-background" : ""}`}>
                    <td className="hidden py-3 pr-4 sm:table-cell">
                      <span className="font-semibold text-foreground">{r.scenario}</span>
                      <span className="ml-2 hidden text-muted-foreground sm:inline">{SKENARIO[r.scenario]}</span>
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      <span className="sm:hidden">
                        <span className="font-semibold">{r.scenario}</span> {SHORT[r.algorithm]}
                      </span>
                      <span className="hidden sm:inline">{ALGO[r.algorithm]}</span>
                      {r.is_best && <span className="ml-2 font-semibold text-primary">dipakai web</span>}
                    </td>
                    <td className="hidden py-3 pr-4 text-right tabular-nums text-foreground sm:table-cell">{dec(m.accuracy, 3)}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-foreground">{dec(m.macro_f1, 3)}</td>
                    <td className={`py-3 pr-4 text-right tabular-nums ${m.recall_class_5 > 0 ? "font-extrabold text-orange-text" : "text-muted-foreground"}`}>
                      {dec(m.recall_class_5, 3)}
                    </td>
                    <td className="hidden py-3 pr-4 text-right tabular-nums text-foreground sm:table-cell">{dec(m.precision_class_5, 3)}</td>
                    <td className="hidden py-3 text-right tabular-nums text-foreground sm:table-cell">{m.mae === undefined ? "" : `${dec(m.mae, 2)} menit`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted-foreground sm:hidden">
          S1 regresi target asli, S2 regresi target log, S3 klasifikasi tanpa bobot, S4 klasifikasi dengan class weight.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Delapan model mencapai akurasi 0,862 karena selalu menebak kelas 0. Recall kelas 5 di atas nol hanya muncul pada skenario S4.
        </p>
      </section>

      <section aria-labelledby="cm-title" className="rounded-xl border border-border bg-card p-6">
        <h2 id="cm-title" className="text-xl font-semibold text-foreground">
          Ke mana delay berat diprediksi
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Persen per kelas aktual. Kotak oranye adalah kelas 5 yang terdeteksi benar.</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <Confusion model={a} title="A-S1 XGBoost: regresi lalu dikonversi" />
          <Confusion model={b} title="B-S4 XGBoost: klasifikasi dengan class weight" />
        </div>
      </section>

      <section aria-labelledby="h-title" className="rounded-xl border border-border bg-card p-6">
        <h2 id="h-title" className="text-xl font-semibold text-foreground">
          Hipotesis: ketiganya diterima sebagian
        </h2>
        <dl className="mt-5 divide-y divide-border">
          {[
            ["H1. Random Forest dan XGBoost lebih baik dari baseline", "Macro F1 tertinggi memang milik model ensemble, tetapi selisih MAE dengan baseline kurang dari 0,25 menit, dan recall kelas 5 tertinggi justru Logistic Regression (0,329)."],
            ["H2. Klasifikasi lebih baik dari regresi", "Klasifikasi berbobot menangkap kelas 5 (recall 0,129 sampai 0,329), regresi tidak sama sekali. Macro F1 tertinggi tetap milik regresi A-S1 XGBoost (0,180 dibanding 0,169)."],
            ["H3. Class weight menaikkan recall kelas 5 dengan sedikit pengorbanan akurasi", "Recall kelas 5 naik dari 0 ke 0,129 sampai 0,329, tetapi akurasi turun dari 0,862 ke 0,272 sampai 0,481."],
          ].map(([h, d]) => (
            <div key={h} className="grid gap-2 py-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-8">
              <dt className="font-semibold text-foreground">{h}</dt>
              <dd className="text-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="web-title" className="rounded-xl border border-border bg-card p-6">
        <h2 id="web-title" className="text-xl font-semibold text-foreground">
          Kenapa web memakai B-S4 XGBoost
        </h2>
        <p className="mt-2 max-w-3xl text-foreground">
          Hanya pendekatan ini yang bisa memberi peringatan delay lebih dari 240 menit. Recall kelas 5-nya {dec(b.metrics.recall_class_5, 3)} dengan
          presisi {dec(b.metrics.precision_class_5, 3)}, sekitar dua kali lebih baik dari menebak acak. Karena itu hasilnya ditampilkan sebagai
          skor risiko, dan model dijalankan dari file ONNX {dec(stats.export.onnx_mb, 1)} MB yang hasilnya sama dengan Python.
        </p>
      </section>
    </div>
  );
}
