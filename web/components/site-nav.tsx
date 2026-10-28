"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const LINKS = [
  { href: "/#cara-kerja", label: "Cara kerja" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/prediksi", label: "Prediksi" },
  { href: "/kompensasi", label: "Kompensasi" },
  { href: "/model", label: "Model" },
];

const linkClass = (active: boolean) =>
  `inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors duration-[var(--dur-short)] hover:bg-muted ${
    active ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
  }`;

export function SiteNav() {
  const path = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  // tutup menu HP setelah pindah halaman
  useEffect(() => menu.current?.removeAttribute("open"), [path]);

  return (
    <header className="relative border-b border-border bg-card">
      <nav aria-label="Utama" className="mx-auto flex h-16 max-w-site items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/" aria-label="Beranda Penerbangan Big Data" className="whitespace-nowrap font-extrabold text-primary">
          Penerbangan Big Data
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={path === l.href ? "page" : undefined} className={linkClass(path === l.href)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* di bawah 60rem: menu <details>, tetap bisa dibuka tanpa JavaScript */}
        <details ref={menu} className="lg:hidden">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <ul className="absolute inset-x-0 top-full z-[100] border-b border-border bg-background px-4 py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={path === l.href ? "page" : undefined} className={`${linkClass(path === l.href)} w-full`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
}
