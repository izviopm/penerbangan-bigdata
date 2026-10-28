"use client";

import { Highlight, HighlightItem } from "@animate-ui/react/primitives/effects/highlight";
import { useEffect, useRef, useState } from "react";

/** Bar langkah /cara-kerja yang menempel: penanda animate-ui bergeser ke bab yang sedang dibaca. */
export function StepNav({ steps }: { steps: { id: string; title: string }[] }) {
  const [active, setActive] = useState(steps[0].id);
  const list = useRef<HTMLOListElement>(null);

  // di HP bar bisa digeser: bawa langkah aktif ke tampilan
  useEffect(() => {
    const li = list.current?.querySelector<HTMLElement>(`[href="#${active}"]`)?.closest("li");
    if (li && list.current) list.current.scrollTo({ left: li.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -60% 0px" },
    );
    steps.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [steps]);

  return (
    <nav aria-label="Langkah" className="sticky top-0 z-40 border-b border-border bg-background">
      <ol ref={list} className="relative mx-auto flex max-w-site gap-1 overflow-x-auto px-4 py-2 md:px-8">
        <Highlight value={active} controlledItems hover={false} click={false} className="inset-0 rounded-lg bg-primary" transition={{ type: "tween", duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}>
          {steps.map((s, i) => (
            <HighlightItem key={s.id} value={s.id} as="li" className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "step" : undefined}
                className={`relative z-10 flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors duration-[var(--dur-short)] ${
                  active === s.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="tabular-nums">{i + 1}</span>
                {s.title}
              </a>
            </HighlightItem>
          ))}
        </Highlight>
      </ol>
    </nav>
  );
}
