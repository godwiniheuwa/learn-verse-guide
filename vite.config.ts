import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy all /backend/api/* calls to your XAMPP PHP backend
      "/backend/api": {
        // Point at the folder under htdocs where your PHP lives:
        //   C:\xampp\htdocs\learn-verse-guide\backend\api
        target: "http://localhost/learn-verse-guide",
        changeOrigin: true,
        // Leave the URL path intact, so:
        //  /backend/api/auth/login → http://localhost:8080/learn-verse-guide/backend/api/auth/login
        rewrite: (path) => path,
      },
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
