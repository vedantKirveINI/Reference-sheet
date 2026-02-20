import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  envPrefix: ['VITE_', 'REACT_APP_', 'REACT_'],
  plugins: [react(), tailwindcss()],
  server: {
    port: 5000,
    host: "0.0.0.0",
    open: false,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: ['**/.local/**', '**/node_modules/**', '**/legacy/**'],
    },
    proxy: {
      '/api': {
        target: 'https://sheet-v1.gofo.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
