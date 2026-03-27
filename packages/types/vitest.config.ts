import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/schemas/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/__tests__/**", "src/zod-shim.d.ts"],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
