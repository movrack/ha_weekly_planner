import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: () => "weekly-planner-card.js" },
    outDir: "../custom_components/weekly_planner/frontend",
    emptyOutDir: false,
    minify: true,
    sourcemap: false,
  },
});
