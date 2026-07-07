import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: { usePolling: true },
    allowedHosts: true,
    proxy: {
      // En Docker el backend no es localhost: se apunta con VITE_PROXY_TARGET=http://backend:8000
      "/api": process.env.VITE_PROXY_TARGET || "http://localhost:8000",
    },
  },
});
