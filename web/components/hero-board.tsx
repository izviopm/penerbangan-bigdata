import { dec } from "@/lib/format";
import type { ModelView } from "@/components/model-switcher";

const pct = (r: number) => `${dec(r * 100, 1)}%`;
// sel lebih terang = lebih banyak penerbangan kelas itu ditebak benar; batas 55% agar teks putih tetap ≥4,5:1
const shade = (r: number) => `color-mix(in oklab, var(--secondary) ${Math.round(Math.min(r, 1) * 55)}%, var(--primary))`;

/** Signature hero: jawaban paper (regresi vs klasifikasi) sebagai recall per kelas PM 89 dua model terbaik. */
export function HeroBoard({ a, b }: { a: ModelView; b: ModelView }) {
  const lanes = [
    { v: a, label: "A. Regresi", how: "tebak menit" },
    { v: b, label: "B. Klasifikasi berbobot", how: "tebak kelas", used: true },
  ];
  return (
    <figure className="min-w-0 rounded-2xl bg-foreground p-5 md:p-7">
      <figcaption className="text-lg font-semibold">Tebakan benar per kelas PM 89/2015 (kelas 0 sampai 5), data uji</figcaption>

      <div className="mt-6 grid grid-cols-[repeat(6,minmax(0,1fr))] gap-1.5 text-center text-sm tabular-nums" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <span key={k} className={k === 5 ? "font-semibold text-gold" : ""}>
            {k}
          </span>
        ))}
      </div>

      {lanes.map(({ v, label, how, used }) => (
        <div key={v.key} className="mt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <p className="font-semibold">
              {label} <span className="font-normal">({how})</span>
            </p>
            {used && <p className="text-sm font-semibold text-gold">Dipakai website</p>}
          </div>
          <ol className="mt-2 grid grid-cols-[repeat(6,minmax(0,1fr))] gap-1.5 tabular-nums" aria-label={`${label}: recall per kelas`}>
            {v.recall.map((r, k) => {
              const heavy = k === 5;
              return (
                <li
                  key={k}
                  className={`hero-cell grid h-12 place-items-center rounded-md text-sm font-semibold md:h-14 md:text-base ${
                    heavy && r > 0 ? "bg-gold text-gold-foreground" : heavy ? "border-2 border-dashed border-orange text-primary-foreground" : "text-primary-foreground"
                  }`}
                  style={heavy ? undefined : { background: shade(r) }}
                >
                  <span className="sr-only">Kelas {k}: </span>
                  {pct(r)}
                </li>
              );
            })}
          </ol>
        </div>
      ))}

      <p className="mt-6 border-t border-primary pt-4">
        Delay di atas 240 menit hanya tertangkap oleh klasifikasi berbobot (<span className="font-semibold text-gold">{pct(b.recall[5])}</span>).
      </p>
    </figure>
  );
}
