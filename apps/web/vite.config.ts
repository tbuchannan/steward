import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 9786,
    proxy: {
      "/api": {
        target: process.env.STEWARD_API_ORIGIN ?? "http://localhost:3000",
      },
    },
  },
  plugins: [react()],
});
