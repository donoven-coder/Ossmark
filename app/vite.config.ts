import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves this repo at /Ossmark/, so the production build needs
// that as its base path. The dev server stays at root.
const BASE_PATH = "/Ossmark/";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? BASE_PATH : "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Fitness Command Center",
        short_name: "FitCmd",
        description: "Daily checklist + n-Suns 531 LP tracker",
        theme_color: "#080E1A",
        background_color: "#080E1A",
        display: "standalone",
        orientation: "portrait",
        start_url: BASE_PATH,
        scope: BASE_PATH,
        icons: [
          { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
          { src: "icons/icon-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,png}"],
      },
    }),
  ],
}));
