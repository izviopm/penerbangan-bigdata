"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Menandai [data-reveal] dengan .is-seen saat masuk layar (sekali). CSS-nya di globals.css. */
export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-seen");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll("[data-reveal]:not(.is-seen)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}
