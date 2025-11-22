import { defineConfig } from "vitest/config";
import path from "path";
// vitest config isolada dos tipos duplicados do Vite

// O erro de tipos sobre Vite ocorre devido a múltiplas versões de tipos em vitest/node_modules.
// Ignoramos a checagem de tipos para a seção de coverage apenas para evitar ruído.
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    isolate: false,
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "src/**/__tests__/**/*.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@core": path.resolve(__dirname, "src/core"),
      "@application": path.resolve(__dirname, "src/application"),
      "@infra": path.resolve(__dirname, "src/infra"),
      "@features": path.resolve(__dirname, "src/features"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
});
