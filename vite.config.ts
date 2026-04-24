import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

function copyManifest() {
  return {
    name: "copy-manifest",
    writeBundle() {
      const outDir = resolve(rootDir, "dist");
      mkdirSync(outDir, { recursive: true });
      copyFileSync(resolve(rootDir, "manifest.json"), resolve(outDir, "manifest.json"));
    }
  };
}

export default defineConfig({
  root: resolve(rootDir, "src"),
  build: {
    outDir: resolve(rootDir, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(rootDir, "src/popup.html"),
        options: resolve(rootDir, "src/options.html"),
        background: resolve(rootDir, "src/background.ts")
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "background.js";
          }
          return "[name]-[hash].js";
        },
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash][extname]"
      }
    }
  },
  plugins: [copyManifest()]
});
