# web — Next.js

Aplikasi web proyek Penerbangan Big Data. Gambaran produk ada di [`../PRD.md`](../PRD.md), aturan tampilan di [`../UI_RULES.md`](../UI_RULES.md) (salinannya untuk hallmark: [`DESIGN.md`](DESIGN.md)).

## Menjalankan

```bash
cp .env.example .env.local   # isi URL & publishable key Supabase
npm install
npm run dev                  # http://localhost:3000
npm test                     # parity: fitur & prediksi web harus sama dengan Python
```

## Isi folder

| Path | Isi |
|---|---|
| `app/api/predict/route.ts` | POST prediksi kelas PM 89/2015 (validasi input, model ONNX) |
| `lib/features.ts` | Tiruan `make_features()` Python; dijaga oleh `tests/parity.test.ts` |
| `lib/predict.ts` | Menjalankan `models/model.onnx` dengan onnxruntime-web (WASM) |
| `lib/pm89.ts` | Kategori & kompensasi PM 89/2015 |
| `lib/supabase.ts`, `lib/data.ts` | Baca agregat schema `penerbangan` (read-only) |
| `models/`, `tests/parity_cases.json`, `content/pipeline-stats.json` | Salinan output notebook `04_export` |

Kalau notebook 04 dijalankan ulang, salin ulang file di `02 - Hasil Analisis/export/` ke `models/`, `tests/`, dan `content/`, lalu `npm test`.
