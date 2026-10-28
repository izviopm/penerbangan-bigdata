import type { Metadata } from "next";
import Link from "next/link";
import { Architecture } from "@/components/architecture";
import { FlowDiagram } from "@/components/flow-diagram";
import { StepNav } from "@/components/step-nav";
import { GLOSSARY } from "@/content/architecture";
import { STEPS } from "@/content/pipeline";

export const metadata: Metadata = {
  title: "Cara kerja",
  description: "Enam langkah dari data penerbangan BTS sampai prediksi kelas kompensasi PM 89/2015, dengan alasan setiap pilihan teknologinya.",
};

export default function CaraKerjaPage() {
  return (
    <>
      <div className="mx-auto max-w-site px-4 pb-10 pt-12 md:px-8 md:pt-16">
        <h1 className="max-w-[18ch] text-4xl font-extrabold tracking-[-0.02em] text-primary md:text-6xl">Cara kerja website ini</h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground">
          Enam langkah dari data mentah sampai prediksi. Setiap langkah menjelaskan apa yang dikerjakan, alasannya, dan batasannya.
        </p>
      </div>

      <StepNav steps={[{ id: "arsitektur", title: "Arsitektur" }, ...STEPS.map(({ id, title }, i) => ({ id, title, num: i + 1 }))]} />

      <section id="arsitektur" aria-label="Arsitektur sistem" className="scroll-mt-15 border-b border-border bg-card">
        <Architecture />
        <div className="mx-auto max-w-site px-4 pb-14 md:px-8">
          <h3 className="text-xl font-semibold text-foreground">Istilah yang dipakai</h3>
          <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
            {GLOSSARY.map(([term, meaning]) => (
              <div key={term} className="min-w-0 border-t-2 border-primary pt-3">
                <dt className="font-semibold text-primary">{term}</dt>
                <dd className="mt-1 text-sm text-foreground">{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {STEPS.map((s, i) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-15">
          {/* pita biru tua: judul, ringkasan, dan diagram alur langkah ini */}
          <div className="bg-primary text-primary-foreground">
            <div className="mx-auto max-w-site px-4 py-14 md:px-8 md:py-20">
              <div className="flex max-w-4xl flex-col gap-5 sm:flex-row">
                <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-gold text-2xl font-extrabold tabular-nums text-gold-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h2 id={`${s.id}-h`} className="text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">
                    {s.heading}
                  </h2>
                  <p className="mt-4 max-w-3xl text-lg">{s.lead}</p>
                  <ul aria-label="Dijalankan di dan alat" className="mt-5 flex flex-wrap gap-2 text-sm">
                    <li className="rounded-full bg-gold px-3 py-1 font-semibold text-gold-foreground">{s.where}</li>
                    {s.stack.map((t) => (
                      <li key={t} className="rounded-full border border-primary-foreground px-3 py-1">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-10">
                <FlowDiagram flow={s.flow} />
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-site gap-10 px-4 py-14 md:px-8 md:py-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
            <div className="min-w-0 max-w-[65ch] space-y-8">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-primary">Apa yang dikerjakan</h3>
                {s.what.map((t) => (
                  <p key={t} className="text-foreground">{t}</p>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-primary">Kenapa begini</h3>
                {s.why.map((t) => (
                  <p key={t} className="text-foreground">{t}</p>
                ))}
              </div>
            </div>

            <aside className="min-w-0 space-y-6">
              <dl className="rounded-xl border border-border bg-card p-6">
                {s.facts.map(([k, v]) => (
                  <div key={k} className="border-b border-border py-3 first:pt-0 last:border-0 last:pb-0">
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="mt-1 text-lg font-extrabold tabular-nums text-primary">{v}</dd>
                  </div>
                ))}
              </dl>
              {s.limits && (
                <div className="rounded-xl border-2 border-orange bg-card p-6">
                  <h3 className="font-semibold text-orange-text">Batasan</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
                    {s.limits.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </section>
      ))}

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-site flex-col items-start gap-6 px-4 py-16 md:px-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-[22ch] text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">Sekarang coba modelnya sendiri.</p>
          <Link
            href="/prediksi"
            className="inline-flex min-h-12 shrink-0 items-center whitespace-nowrap rounded-lg bg-gold px-6 font-semibold text-gold-foreground transition-colors duration-[var(--dur-short)] hover:bg-orange active:translate-y-px"
          >
            Coba prediksi
          </Link>
        </div>
      </div>
    </>
  );
}
