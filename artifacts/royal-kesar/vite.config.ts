import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const port = Number(process.env.PORT || "5173");

export default defineConfig({
  base: "/",
  envDir: path.resolve(import.meta.dirname, "../../"),
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    // Build output goes into the root dist/public so it can serve them
    outDir: path.resolve(import.meta.dirname, "..", "..", "dist", "public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    strictPort: false,
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
