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
      // Floors just below the measured 50.6 / 80.3 / 47.7 / 50.6 (no regression).
      thresholds: { statements: 49, branches: 78, functions: 45, lines: 49 },
    },
  },
});
