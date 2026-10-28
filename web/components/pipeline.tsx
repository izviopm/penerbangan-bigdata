import Link from "next/link";
import { STEPS } from "@/content/pipeline";

/** Cara kerja di beranda (sticky diptych): kartu muncul saat terlihat dan nomornya terisi. */
export function Pipeline() {
  return (
    <ol className="spine relative space-y-6 lg:space-y-8">
      {STEPS.map((s, i) => (
        <li key={s.id} data-reveal className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4 md:gap-6">
          <span data-step-dot className="relative z-10 grid size-12 place-items-center rounded-full border-2 border-primary bg-primary text-lg font-extrabold tabular-nums text-primary-foreground ring-8 ring-background">
            {i + 1}
          </span>
          <div data-reveal-item className="min-w-0 rounded-xl border border-border bg-card p-6 transition-colors duration-[var(--dur-short)] hover:border-primary">
            <h3 className="text-xl font-semibold text-foreground">{s.title}</h3>
            <p className="mt-3 text-3xl font-extrabold tracking-[-0.02em] tabular-nums text-primary md:text-4xl">{s.figure}</p>
            <p className="text-sm text-muted-foreground">{s.figureLabel}</p>
            <p className="mt-4 text-foreground">{s.short}</p>
            <Link
              href={`/cara-kerja#${s.id}`}
              className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4 hover:text-foreground"
            >
              Penjelasan langkah {i + 1}
            </Link>
          </div>
        </li>
      ))}
    </ol>
  );
}
