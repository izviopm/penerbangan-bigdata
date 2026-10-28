// Grafik SVG di server: tanpa library chart, tanpa JavaScript di browser.
// Warna hanya lewat token (UI_RULES §2); tooltip memakai <title> bawaan SVG.
import { pct } from "@/lib/format";

const SHADES = ["--muted", "--border", "--secondary", "--primary"];

/** 0–1 → campuran token kartu ke primary (untuk heatmap & tingkat kelas). */
const mix = (t: number) => `color-mix(in oklab, var(--primary) ${Math.round(Math.min(1, Math.max(0, t)) * 100)}%, var(--card))`;

type LineProps = {
  values: number[];
  labels: string[];
  /** indeks titik yang diberi penanda dan label nilai */
  marks?: number[];
  /** indeks label sumbu-x yang ditampilkan */
  ticks?: number[];
  height?: number;
  title: string;
  unit?: string;
  yMin?: number;
};

/** Garis satu seri: 2px, penanda hanya di titik yang dianotasi, 3–4 garis grid. */
export function LineChart({ values, labels, marks = [], ticks, height = 220, title, unit = "%", yMin = 0 }: LineProps) {
  const W = 640;
  const H = height;
  const pad = { l: 40, r: 16, t: 28, b: 28 };
  const max = Math.ceil(Math.max(...values) / 5) * 5;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, values.length - 1);
  const y = (v: number) => pad.t + (1 - (v - yMin) / (max - yMin)) * (H - pad.t - pad.b);
  const grid = [0, 1, 2, 3].map((k) => yMin + (k * (max - yMin)) / 3);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const show = ticks ?? values.map((_, i) => i);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="h-auto w-full text-muted-foreground">
      <title>{title}</title>
      {grid.map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="var(--border)" strokeWidth={1} />
          <text x={pad.l - 6} y={y(g) + 4} textAnchor="end" fontSize={11} fill="currentColor" className="tabular-nums">
            {Math.round(g)}
            {unit}
          </text>
        </g>
      ))}
      <path className="draw" pathLength={1} d={d} fill="none" stroke="var(--secondary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={6} fill="transparent">
          <title>{`${labels[i]}: ${pct(v)}`}</title>
        </circle>
      ))}
      {marks.map((i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(values[i])} r={4} fill="var(--orange)" stroke="var(--card)" strokeWidth={2} />
          <text x={x(i)} y={y(values[i]) - 10} textAnchor={i === 0 ? "start" : i === values.length - 1 ? "end" : "middle"} fontSize={12} fontWeight={800} fill="var(--foreground)" className="tabular-nums">
            {pct(values[i])}
          </text>
        </g>
      ))}
      {show.map((i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === values.length - 1 ? "end" : "middle"} fontSize={11} fill="currentColor">
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}

/** Heatmap hari × jam: signature dashboard. */
export function HourDowHeatmap({ grid, title }: { grid: number[][]; title: string }) {
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const cw = 24;
  const ch = 22;
  const W = 40 + 24 * cw;
  const H = 7 * ch + 22;
  const flat = grid.flat();
  const lo = Math.min(...flat);
  const hi = Math.max(...flat);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="h-auto w-full text-muted-foreground">
      <title>{title}</title>
      {grid.map((row, d) => (
        <g key={d}>
          <text x={32} y={d * ch + ch / 2 + 4} textAnchor="end" fontSize={11} fill="currentColor">
            {days[d]}
          </text>
          {row.map((v, h) => (
            <rect key={h} x={40 + h * cw} y={d * ch} width={cw - 2} height={ch - 2} rx={3} fill={mix((v - lo) / (hi - lo))}>
              <title>{`${days[d]} pukul ${String(h).padStart(2, "0")}.00: ${pct(v)} delay ≥ 30 menit`}</title>
            </rect>
          ))}
        </g>
      ))}
      {[0, 6, 12, 18, 23].map((h) => (
        <text key={h} x={40 + h * cw + cw / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="currentColor">
          {String(h).padStart(2, "0")}
        </text>
      ))}
    </svg>
  );
}

/** Bagian dari keseluruhan: bar horizontal bertumpuk; kelas 5 selalu oranye (UI_RULES §7). */
export function ClassBar({ shares }: { shares: number[] }) {
  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded-md" role="img" aria-label="Sebaran kelas PM 89/2015">
        {shares.map((s, k) => (
          <span
            key={k}
            title={`Kelas ${k}: ${pct(s)}`}
            className="h-full"
            style={{ width: `${s}%`, background: k === 5 ? "var(--orange)" : `var(${SHADES[Math.min(k, 3)]})` }}
          />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
        {shares.map((s, k) => (
          <div key={k} className="min-w-0">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: k === 5 ? "var(--orange)" : `var(${SHADES[Math.min(k, 3)]})` }}
              />
              Kelas {k}
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-foreground">{pct(s)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
