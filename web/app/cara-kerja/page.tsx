import type { Metadata } from "next";
import Link from "next/link";
import { FlowDiagram } from "@/components/flow-diagram";
import { STEPS } from "@/content/pipeline";

export const metadata: Metadata = {
  title: "Cara kerja",
  description: "Enam langkah dari data penerbangan BTS sampai prediksi kelas kompensasi PM 89/2015, dengan alasan setiap pilihan teknologinya.",
};

export default function CaraKerjaPage() {
  return (
    <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-[-0.02em] text-primary md:text-5xl">Cara kerja website ini</h1>
        <p className="mt-4 text-lg text-foreground">
          Enam langkah dari data mentah sampai prediksi. Setiap langkah menjelaskan apa yang dikerjakan, alasannya, dan batasannya.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Langkah" className="lg:sticky lg:top-24 lg:self-start">
          <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-foreground transition-colors duration-[var(--dur-short)] hover:bg-card"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold tabular-nums text-primary-foreground">{i + 1}</span>
                  <span className="min-w-0">{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-20">
          {STEPS.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
              <div data-reveal className="max-w-3xl">
                <h2 id={`${s.id}-h`} className="flex gap-4 text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">
                  <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-gold text-xl tabular-nums text-gold-foreground">{i + 1}</span>
                  <span className="min-w-0">{s.heading}</span>
                </h2>
                <p className="mt-4 text-lg text-foreground">{s.lead}</p>
              </div>

              <div className="mt-8">
                <FlowDiagram flow={s.flow} />
              </div>

              <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
                <div className="min-w-0 max-w-[65ch] space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">Apa yang dikerjakan</h3>
                    {s.what.map((t) => (
                      <p key={t} className="text-foreground">{t}</p>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">Kenapa begini</h3>
                    {s.why.map((t) => (
                      <p key={t} className="text-foreground">{t}</p>
                    ))}
                  </div>
                </div>

                <aside className="min-w-0 space-y-6">
                  <dl data-reveal className="rounded-xl border border-border bg-card p-6">
                    {s.facts.map(([k, v]) => (
                      <div key={k} className="border-b border-border py-3 first:pt-0 last:border-0 last:pb-0">
                        <dt className="text-sm text-muted-foreground">{k}</dt>
                        <dd className="mt-1 font-semibold text-foreground">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {s.limits && (
                    <div data-reveal className="rounded-xl border border-orange bg-card p-6">
                      <h3 className="font-semibold text-foreground">Batasan</h3>
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

          <div className="flex flex-col items-start gap-6 border-t border-border pt-12 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[22ch] text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">Sekarang coba modelnya sendiri.</p>
            <Link
              href="/prediksi"
              className="inline-flex min-h-12 shrink-0 items-center whitespace-nowrap rounded-lg bg-gold px-6 font-semibold text-gold-foreground transition-colors duration-[var(--dur-short)] hover:bg-orange active:translate-y-px"
            >
              Coba prediksi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
