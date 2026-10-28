"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { ICONS } from "@/components/icons";
import { ARCH } from "@/content/architecture";

const N = ARCH.length;
const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/**
 * Arsitektur sistem sebagai pola scroll hallmark (scroll-choreography §1, pinned chapter):
 * di layar ≥64rem panel menempel dan scroll menggerakkan data dari BTS sampai browser.
 * Di HP, tanpa JavaScript, atau dengan reduced motion: diagram lengkap dan diam.
 */
export function Architecture() {
  const track = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [stage, setStage] = useState(N - 1);
  const [sub, setSub] = useState(1);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  useEffect(() => {
    const ok = matchMedia("(min-width: 64rem) and (prefers-reduced-motion: no-preference)");
    const update = () => setLive(ok.matches);
    update();
    ok.addEventListener("change", update);
    return () => ok.removeEventListener("change", update);
  }, []);

  const place = (v: number) => {
    const x = Math.min(v * N, N - 0.001);
    setStage(Math.floor(x));
    setSub(x - Math.floor(x));
  };
  useMotionValueEvent(scrollYProgress, "change", (v) => live && place(v));
  // saat mode hidup menyala, langsung ikuti posisi scroll sekarang
  useEffect(() => {
    if (live) place(scrollYProgress.get());
  }, [live, scrollYProgress]);

  const current = live ? stage : N - 1;

  return (
    <div ref={track} className="relative lg:h-[400vh]">
      <div className="lg:sticky lg:top-15 lg:flex lg:min-h-[calc(100vh-3.75rem)] lg:items-center">
        <div className="mx-auto w-full max-w-site px-4 py-14 md:px-8">
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">Arsitektur sistem</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Dari sumber data sampai layar Anda. <span className="hidden lg:inline">Gulir pelan untuk mengikuti alirannya.</span>
          </p>

          <ol className="mt-10 flex flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1.15fr)_3rem_minmax(0,1.1fr)_3rem_minmax(0,1fr)_3rem_minmax(0,0.85fr)] lg:gap-0">
            {ARCH.map((s, i) => {
              const reached = i <= current;
              const active = live && i === stage;
              return (
                <Fragment key={s.id}>
                  {i > 0 && <Arrow progress={scrollYProgress} index={i - 1} live={live} />}
                  <li className="min-w-0">
                    <motion.div
                      initial={false}
                      animate={{ opacity: reached ? 1 : 0.3 }}
                      transition={{ duration: 0.22, ease: EASE_OUT }}
                      className="flex h-full flex-col"
                    >
                      <h3 className="text-sm font-semibold text-primary">{s.title}</h3>
                      <ul className="mt-3 space-y-2">
                        {s.nodes.map((n, k) => {
                          const Icon = ICONS[n.icon];
                          // notebook 01 sampai 04 menyala satu per satu selama panggung pengolahan
                          const on = !live || i < stage || (i === stage && (s.nodes.length === 1 || k <= Math.floor(sub * s.nodes.length)));
                          return (
                            <li
                              key={n.name}
                              className={`flex items-center gap-3 rounded-xl border-2 bg-card p-3 transition-colors duration-[var(--dur-long)] ${
                                active && on ? "border-gold" : "border-border"
                              }`}
                            >
                              <span
                                className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-[var(--dur-long)] ${
                                  on ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                                }`}
                              >
                                <Icon aria-hidden className="size-5" />
                              </span>
                              <span className="min-w-0">
                                <span className="block font-semibold text-foreground">{n.name}</span>
                                <span className="block text-sm text-muted-foreground">{n.note}</span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <p className={`mt-3 text-sm transition-colors duration-[var(--dur-long)] ${active || !live ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.caption}
                      </p>
                    </motion.div>
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

/** Panah antar-panggung: garis tergambar mengikuti scroll, lalu satu titik data emas lewat. */
function Arrow({ progress, index, live }: { progress: MotionValue<number>; index: number; live: boolean }) {
  const from = (index + 0.6) / N;
  const to = (index + 1) / N;
  const draw = useTransform(progress, [from, to], [0, 1]);
  const cx = useTransform(progress, [from, to], [4, 38]);
  const dot = useTransform(progress, [from, from + 0.005, to - 0.005, to], [0, 1, 1, 0]);
  return (
    <li aria-hidden className="flex justify-center lg:items-center">
      <svg viewBox="0 0 48 24" className="h-10 w-8 rotate-90 text-secondary lg:h-6 lg:w-12 lg:rotate-0">
        <path d="M4 12 H40 M34 6 L42 12 L34 18" fill="none" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <motion.path
          d="M4 12 H40 M34 6 L42 12 L34 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={live ? { pathLength: draw } : undefined}
        />
        {live && <motion.circle r="4" cy="12" fill="var(--gold)" style={{ cx, opacity: dot }} />}
      </svg>
    </li>
  );
}
