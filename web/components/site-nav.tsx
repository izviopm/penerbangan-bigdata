"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// shortcut: hanya halaman yang sudah ada; Prediksi, Kompensasi, Model ditambahkan di fase 3
const LINKS = [
  { href: "/#cara-kerja", label: "Cara kerja" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteNav() {
  const path = usePathname();
  return (
    <header className="border-b border-border bg-card">
      <nav aria-label="Utama" className="mx-auto flex h-16 max-w-site items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/" aria-label="Beranda Penerbangan Big Data" className="whitespace-nowrap font-extrabold text-primary">
          Penerbangan Big Data
        </Link>
        <ul className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => {
            const active = path === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`${l.href.startsWith("/#") ? "hidden sm:inline-flex" : "inline-flex"} min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors duration-[var(--dur-short)] hover:bg-muted ${
                    active ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
