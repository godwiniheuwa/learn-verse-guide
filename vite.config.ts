
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configure to work with PHP backend
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost', // Local PHP server
        changeOrigin: true,
      },
    }
  },
  build: {
    outDir: 'dist', // Output to dist folder
    emptyOutDir: true,
  }
});
