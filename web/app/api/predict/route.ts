import { CATEGORIES, type FlightInput } from "@/lib/features";
import { PM89 } from "@/lib/pm89";
import { predict } from "@/lib/predict";

type Field = keyof FlightInput;
const RANGES: Partial<Record<Field, [number, number]>> = {
  month: [1, 12],
  dow: [1, 7],
  crs_dep: [0, 2359],
  distance: [1, 6000],
  crs_elapsed: [10, 900],
};

// Validasi di batas kepercayaan: endpoint ini publik.
function parse(body: unknown): FlightInput | string {
  if (typeof body !== "object" || body === null) return "Body harus JSON objek.";
  const b = body as Record<string, unknown>;
  for (const f of ["airline", "origin", "dest"] as const) {
    if (typeof b[f] !== "string" || !CATEGORIES[f].includes(b[f] as string)) return `${f} tidak dikenal.`;
  }
  for (const [f, [lo, hi]] of Object.entries(RANGES) as [Field, [number, number]][]) {
    const v = b[f];
    if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > hi) return `${f} harus angka ${lo}–${hi}.`;
  }
  if ((b.crs_dep as number) % 100 > 59) return "crs_dep harus format HHMM.";
  return b as FlightInput;
}

export async function POST(req: Request) {
  const input = parse(await req.json().catch(() => null));
  if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
  const [p] = await predict([input]);
  return Response.json({ ...p, pm89: PM89[p.kelas] });
}
