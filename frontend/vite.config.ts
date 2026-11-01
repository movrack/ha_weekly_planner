import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: () => "weekly-planner-card.js" },
    outDir: "../custom_components/weekly_planner/frontend",
    emptyOutDir: false,
    minify: true,
    sourcemap: false,
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/__tests__/**", "src/**/*.test.ts"],
      reporter: ["text", "text-summary", "lcov", "html"],
      reportsDirectory: "coverage",
      // Floors just below the measured 59.1 / 49.4 / 49.2 / 62.0 (vitest 5 v8 coverage counts differently).
      thresholds: { statements: 58, branches: 48, functions: 48, lines: 61 },
    },
  },
});
