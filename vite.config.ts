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
      ignored: ['**/.local/**', '**/node_modules/**', '**/legacy/**', '**/sheets-backend/**'],
    },
    proxy: {
      '/ai-api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-api/, ''),
      },
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
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
