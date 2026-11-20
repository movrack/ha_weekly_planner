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
      // Floors, each file and the total (owner, 2026-11-16): statements 90, branches 80, functions 80, lines 80. Measured with vitest 5: 95.1 / 90.9 / 92.7 / 96.7.
      thresholds: { statements: 90, branches: 80, functions: 80, lines: 80, perFile: true },
    },
  },
});
