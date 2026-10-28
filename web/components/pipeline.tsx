"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { STEPS } from "@/content/pipeline";

const STEP_MS = 600; // 7 langkah ≈ 4,2 detik (UI_RULES §6: total < 6 detik)
const LAST = STEPS.length - 1;

export function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();
  // -1 = belum diputar: semua langkah tampil apa adanya (juga tanpa JavaScript)
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (inView && !reduce && active === -1) setPlaying(true);
  }, [inView, reduce, active]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      const next = active + 1;
      setActive(next);
      setSelected(next);
      if (next >= LAST) setPlaying(false);
    }, active === -1 ? 0 : STEP_MS);
    return () => clearTimeout(t);
  }, [playing, active]);

  const replay = () => {
    setActive(-1);
    setPlaying(!reduce);
  };
  const skip = () => {
    setPlaying(false);
    setActive(LAST);
    setSelected(LAST);
  };
  const pick = (i: number) => {
    setPlaying(false);
    setActive(Math.max(active, i));
    setSelected(i);
  };

  const progress = active < 0 ? 0 : active / LAST;
  const step = STEPS[selected];

  return (
    <div ref={ref}>
      <div className="relative">
        {/* jalur data: garis dasar, progres, dan satu titik yang bergerak (transform saja) */}
        <div aria-hidden className="absolute inset-x-[7%] top-6 hidden h-0.5 bg-border lg:block">
          <motion.div
            className="h-full origin-left bg-secondary"
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ duration: reduce ? 0 : STEP_MS / 1000, ease: [0.2, 0.7, 0.2, 1] }}
          />
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ x: `${progress * 100}%` }}
            transition={{ duration: reduce ? 0 : STEP_MS / 1000, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <span className="absolute -top-[5px] -left-1.5 size-3 rounded-full bg-orange" />
          </motion.div>
        </div>

        <ol className="relative grid gap-3 lg:grid-cols-7 lg:gap-4">
          {STEPS.map((s, i) => {
            const done = active >= i;
            const current = selected === i && active >= 0;
            const tone =
              i === LAST && done
                ? "bg-gold text-gold-foreground"
                : current
                  ? "bg-orange text-orange-foreground"
                  : done
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-primary border border-border";
            return (
              <li key={s.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={selected === i}
                  className="group flex w-full min-w-0 cursor-pointer gap-4 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 rounded-xl p-2 text-left transition-colors duration-[var(--dur-short)] hover:bg-card lg:flex-col lg:items-center lg:gap-3 lg:text-center aria-pressed:bg-card"
                >
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-full text-lg font-extrabold tabular-nums transition-colors duration-[var(--dur-short)] ${tone}`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">{s.title}</span>
                    <span className="mt-1 block text-2xl font-extrabold tabular-nums text-primary">{s.figure}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8 grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:p-8">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Langkah {selected + 1} dari {STEPS.length}
          </p>
          <h3 className="mt-1 text-2xl font-extrabold text-foreground">{step.title}</h3>
          <p className="mt-2 text-foreground">{step.line}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{step.figure}</span> {step.figureLabel}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={replay}
              className="min-h-11 cursor-pointer rounded-lg active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 border border-primary px-5 font-semibold text-primary transition-colors duration-[var(--dur-short)] hover:bg-muted"
            >
              Putar ulang
            </button>
            <button
              type="button"
              onClick={skip}
              className="min-h-11 cursor-pointer rounded-lg active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 px-5 font-semibold text-muted-foreground transition-colors duration-[var(--dur-short)] hover:bg-muted hover:text-foreground"
            >
              Lewati
            </button>
          </div>
        </div>
        <dl className="grid min-w-0 gap-4 sm:grid-cols-3">
          {(
            [
              ["Alat", step.tools],
              ["Masuk", step.input],
              ["Keluar", step.output],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="min-w-0 border-t border-border pt-3">
              <dt className="text-sm text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-semibold text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
