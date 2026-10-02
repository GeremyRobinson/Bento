/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// "preview" mode inlines everything into one HTML file so a build can be shared as a single page.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react(), ...(mode === "preview" ? [viteSingleFile()] : [])],
  // the preview inlines the fonts too, so the single file needs nothing else
  build: { target: ["es2020", "safari14"], outDir: mode === "preview" ? "dist-preview" : "dist", assetsInlineLimit: mode === "preview" ? 1e8 : 4096 },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
  },
}));
