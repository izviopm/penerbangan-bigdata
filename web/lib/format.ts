const nf = new Intl.NumberFormat("id-ID");

export const num = (v: number) => nf.format(Math.round(v));
export const dec = (v: number, d = 1) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (v: number, d = 2) => `${dec(v, d)}%`;
/** 20928579 → "20,9 juta" */
export const juta = (v: number) => `${dec(v / 1e6, 1)} juta`;
