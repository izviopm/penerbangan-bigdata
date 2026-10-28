// 50 penerbangan nyata dari notebook 04: fitur & probabilitas web harus sama dengan Python.
import { describe, expect, it } from "vitest";
import cases from "./parity_cases.json";
import { makeFeatures } from "@/lib/features";
import { predict } from "@/lib/predict";
import { toClass } from "@/lib/pm89";

describe("parity Python ↔ web", () => {
  it("fitur identik", () => {
    for (const c of cases) {
      makeFeatures(c).forEach((v, k) => expect(v).toBeCloseTo(c.features[k], 5));
    }
  });

  it("probabilitas & kelas identik", async () => {
    const preds = await predict(cases);
    preds.forEach((p, i) => {
      expect(p.kelas).toBe(cases[i].predicted_class);
      p.probabilities.forEach((v, k) => expect(Math.abs(v - cases[i].probabilities[k])).toBeLessThan(1e-4));
    });
  }, 30_000);
});

describe("aturan kelas PM 89/2015", () => {
  it("batas kelas sama dengan to_class() Python", () => {
    const menit = [0, 29.9, 30, 60, 60.5, 120, 121, 180, 181, 240, 240.5, 999];
    expect(menit.map(toClass)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
});
