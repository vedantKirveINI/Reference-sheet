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
      ignored: ['**/.local/**', '**/.cache/**', '**/.git/**', '**/dist/**', '**/node_modules/**', '**/legacy/**', '**/sheets-backend/**', '.replit', 'replit.nix'],
    },
    proxy: {
      '/api': {
        target: 'https://sheet-v1.gofo.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'https://sheet-v1.gofo.app',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
