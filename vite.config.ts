
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configure to work with PHP backend
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/backend/api': {
        target: 'http://localhost', // Local PHP server
        changeOrigin: true,
      },
    }
  },
  build: {
    outDir: 'dist', // Output to dist folder
    emptyOutDir: true,
  }
}));
