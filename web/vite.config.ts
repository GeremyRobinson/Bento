/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// "preview" mode inlines everything into one HTML file so a build can be shared as a single page.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react(), ...(mode === "preview" ? [viteSingleFile()] : [])],
  build: { outDir: mode === "preview" ? "dist-preview" : "dist" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
  },
}));
