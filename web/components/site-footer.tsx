import Link from "next/link";

const COLUMNS = [
  {
    title: "Halaman",
    links: [
      { href: "/", label: "Beranda" },
      { href: "/cara-kerja", label: "Cara kerja" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/prediksi", label: "Prediksi" },
      { href: "/kompensasi", label: "Kompensasi" },
      { href: "/model", label: "Model" },
    ],
  },
  {
    title: "Sumber",
    links: [
      { href: "https://www.transtats.bts.gov/", label: "Data BTS" },
      { href: "https://jdih.dephub.go.id/", label: "PM 89/2015" },
      { href: "https://github.com/izviopm/penerbangan-bigdata", label: "Kode di GitHub" },
    ],
  },
  {
    title: "Kelompok 2",
    links: [{ label: "Recky Arisenta" }, { label: "Izvio Prijaya Mumin" }, { label: "Safira Alisha Aqista" }],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] md:px-8">
        <div className="min-w-0">
          <p className="font-extrabold text-primary">Penerbangan Big Data</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Tugas Manajemen Big Data dan Analitik Bisnis, Magister Ilmu Komputer Universitas Budi Luhur.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title} className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {"href" in l && l.href ? (
                    <Link href={l.href} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                      {l.label}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">{l.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-site border-t border-border px-4 py-5 text-sm text-muted-foreground md:px-8">
        Data penerbangan domestik Amerika Serikat 2023 sampai 2025. Kelas kompensasi PM 89/2015 dipakai sebagai studi kasus;
        penumpang di Amerika Serikat tidak menerima kompensasi ini.
      </p>
    </footer>
  );
}
