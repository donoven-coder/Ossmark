import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Ossmark Command",
        short_name: "Ossmark",
        description: "SCOUT + CLOSER outreach intelligence dashboard",
        theme_color: "#0B0A0F",
        background_color: "#0B0A0F",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
          { src: "icons/icon-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,png,woff,woff2}"],
        // Reads of already-synced data should still work offline; writes
        // never touch this cache — they go through the IndexedDB outbox
        // instead, since a stale POST/PATCH response would be actively
        // wrong, not just old.
        runtimeCaching: [
          {
            urlPattern: /^\/api\/(leads|deals|agents|files)(\?.*)?$/,
            handler: "NetworkFirst",
            method: "GET",
            options: {
              cacheName: "occ-api-reads",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
});
