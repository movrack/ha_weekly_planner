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
      // Floors (measured with vitest 5: 80.7 / 73.0 / 75.6 / 82.7 statements/branches/functions/lines).
      thresholds: { statements: 80, branches: 60, functions: 60, lines: 80 },
    },
  },
});
