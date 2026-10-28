import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // onnxruntime-web dimuat dari node_modules apa adanya (memuat .wasm-nya sendiri), bukan di-bundle
  serverExternalPackages: ["onnxruntime-web"],
  outputFileTracingIncludes: {
    "/api/predict": ["./models/model.onnx", "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.{wasm,mjs}"],
  },
};

export default nextConfig;
