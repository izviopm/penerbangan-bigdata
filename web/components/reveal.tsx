"use client";

import { animate, inView, stagger } from "motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/**
 * Gerak halaman dengan motion.dev, sesuai hallmark craft §5:
 * - .flap: masuknya papan angka di hero saat halaman dibuka (sekali).
 * - [data-reveal]: satu pola reveal per halaman; anak [data-reveal-item] muncul berurutan saat grupnya terlihat.
 * Tanpa JavaScript atau dengan reduced motion, CSS tidak menyembunyikan apa pun (globals.css).
 */
export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const flaps = document.querySelectorAll<HTMLElement>(".flap");
    if (flaps.length)
      animate(flaps, { opacity: [0, 1], rotateX: [-90, 0] }, { duration: 0.42, delay: stagger(0.045, { startDelay: 0.15 }), ease: EASE_OUT });

    const stops = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-seen)")].map((group) =>
      inView(
        group,
        () => {
          group.classList.add("is-seen");
          const items = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
          const targets = items.length ? items : [group];
          // jeda antar-item 60 ms, total tetap di bawah 500 ms
          const gap = Math.min(0.06, 0.45 / targets.length);
          animate(targets, { opacity: [0, 1], y: [12, 0] }, { duration: 0.42, delay: stagger(gap), ease: EASE_OUT });
        },
        { margin: "0px 0px -15% 0px" },
      ),
    );
    return () => stops.forEach((stop) => stop());
  }, [path]);
  return null;
}
