import { describe, expect, it } from "vitest";
import { btsDow, parseFlight } from "@/lib/flight";

describe("form prediksi → input model", () => {
  it("hari JavaScript ke konvensi BTS (Senin = 1)", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(btsDow)).toEqual([7, 1, 2, 3, 4, 5, 6]);
  });

  it("mengisi jarak & durasi dari rute, tanggal & jam ke fitur", () => {
    // 2024-07-09 adalah hari Selasa
    const r = parseFlight({ maskapai: "DL", asal: "EWR", tujuan: "MSP", tanggal: "2024-07-09", jam: "12:37" });
    expect(r).toEqual({
      input: { airline: "DL", origin: "EWR", dest: "MSP", month: 7, dow: 2, crs_dep: 1237, distance: 1008, crs_elapsed: 184 },
    });
  });

  it("form kosong belum dianggap error", () => {
    expect(parseFlight({})).toBeNull();
  });

  it("menolak input di luar daftar", () => {
    const r = parseFlight({ maskapai: "XX", asal: "EWR", tujuan: "ZZZ", tanggal: "2024-13-40", jam: "25:00" });
    expect(r && "errors" in r && Object.keys(r.errors).sort()).toEqual(["jam", "maskapai", "tanggal", "tujuan"]);
  });
});
