"use client";

import { useState } from "react";
import { dec } from "@/lib/format";

export type ModelView = {
  key: string;
  tab: string;
  name: string;
  note: string;
  recall: number[]; // recall kelas 0–5
  macroF1: number;
  accuracy: number;
};

export function ModelSwitcher({ views }: { views: ModelView[] }) {
  const [i, setI] = useState(0);
  const v = views[i];
  return (
    <div className="rounded-xl border border-border bg-card p-6 lg:p-8">
      <div role="tablist" aria-label="Pilih pendekatan" className="inline-flex rounded-lg bg-muted p-1">
        {views.map((m, k) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            id={`tab-${m.key}`}
            aria-selected={k === i}
            aria-controls={`panel-${m.key}`}
            onClick={() => setI(k)}
            className={`min-h-11 cursor-pointer whitespace-nowrap rounded-md px-4 text-sm font-semibold transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 duration-[var(--dur-short)] ${
              k === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.tab}
          </button>
        ))}
      </div>

      <div id={`panel-${v.key}`} role="tabpanel" aria-labelledby={`tab-${v.key}`} className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Recall per kelas pada 199.942 penerbangan data uji</p>
          <ul className="mt-4 space-y-3">
            {v.recall.map((r, k) => (
              <li key={k} className="grid grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] items-center gap-3">
                <span className="text-sm text-muted-foreground">Kelas {k}</span>
                <span className="h-5 rounded-sm bg-muted">
                  <span
                    className="block h-full rounded-sm"
                    style={{ width: `${Math.max(r * 100, r > 0 ? 1 : 0)}%`, background: k === 5 ? "var(--orange)" : "var(--secondary)" }}
                  />
                </span>
                <span className="text-right text-sm font-semibold tabular-nums text-foreground">{dec(r, 3)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <h3 className="text-2xl font-extrabold text-foreground">{v.name}</h3>
          <p className="mt-2 text-foreground">{v.note}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div className="border-t border-border pt-3">
              <dt className="text-sm text-muted-foreground">Akurasi</dt>
              <dd className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">{dec(v.accuracy, 3)}</dd>
            </div>
            <div className="border-t border-border pt-3">
              <dt className="text-sm text-muted-foreground">Macro F1</dt>
              <dd className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">{dec(v.macroF1, 3)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
