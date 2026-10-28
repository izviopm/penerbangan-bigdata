import { ImageResponse } from "next/og";
import stats from "@/content/pipeline-stats.json";
import { num } from "@/lib/format";

export const alt = "Penerbangan Big Data: prediksi kategori delay PM 89/2015";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// warna = token UI_RULES §2 (primary, gold, foreground); ImageResponse tidak membaca CSS
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#1e3a8a", color: "#ffffff" }}>
        <div style={{ fontSize: 34, fontWeight: 700 }}>Penerbangan Big Data</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>Regresi atau klasifikasi untuk delay pesawat?</div>
          <div style={{ marginTop: 28, fontSize: 32 }}>{`16 model, ${num(stats.ingest.rows)} penerbangan, kategori kompensasi PM 89/2015`}</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Dashboard", "Prediksi", "Kompensasi"].map((t) => (
            <div key={t} style={{ padding: "12px 26px", borderRadius: 12, background: "#f5b700", color: "#0b1b3f", fontSize: 28, fontWeight: 700 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
