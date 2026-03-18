import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";

export default defineConfig({
  envPrefix: ['VITE_', 'REACT_APP_', 'REACT_'],
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.SENTRY_AUTH_TOKEN ? [sentryVitePlugin({
      org: "ankit-solanki",
      project: "tinytable-backend",
      url: "https://app.analytics.tinycommand.com",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })] : []),
  ],
  server: {
    port: 5000,
    host: "0.0.0.0",
    open: false,
    strictPort: false,
    allowedHosts: true,
    watch: {
      ignored: ['**/.local/**', '**/.cache/**', '**/.git/**', '**/dist/**', '**/node_modules/**', '**/legacy/**', '**/sheets-backend/**', '.replit', 'replit.nix'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4545',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ai-api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-api/, ''),
      },
      '/socket.io': {
        target: 'http://localhost:4545',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: "hidden",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
