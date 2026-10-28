import fs from "node:fs/promises";
import path from "node:path";
import * as ort from "onnxruntime-web";
import { makeFeatures, type FlightInput } from "@/lib/features";

// onnxruntime-web (WASM), bukan onnxruntime-node: paket node 307 MB melebihi batas fungsi Vercel 250 MB.
ort.env.wasm.numThreads = 1;

let session: Promise<ort.InferenceSession> | undefined;

function getSession() {
  // dimuat sekali per instance fungsi (±1,2 detik), lalu dipakai ulang
  session ??= fs
    .readFile(path.join(process.cwd(), "models", "model.onnx"))
    .then((buf) => ort.InferenceSession.create(buf));
  return session;
}

export type Prediction = { kelas: number; probabilities: number[] };

export async function predict(inputs: FlightInput[]): Promise<Prediction[]> {
  const s = await getSession();
  const X = new Float32Array(inputs.flatMap(makeFeatures));
  const out = await s.run({ input: new ort.Tensor("float32", X, [inputs.length, 10]) });
  const p = out.probabilities.data as Float32Array;
  return inputs.map((_, i) => {
    const row = Array.from(p.subarray(i * 6, i * 6 + 6));
    return { kelas: row.indexOf(Math.max(...row)), probabilities: row };
  });
}
