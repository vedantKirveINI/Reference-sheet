import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { visualizer } from 'rollup-plugin-visualizer';

// Load environment variables
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// Bundle analyzer - generates stats.html
		visualizer({
			open: false,  // Opens browser automatically
			filename: 'dist/stats.html',  // Output file
			gzipSize: true,  // Show gzipped sizes
			brotliSize: true,  // Show brotli sizes
		}),
	],
	define: {
		"process.env": {
			...process.env,
		},
	},
	server: {
		port: parseInt(process.env.PORT || '3000', 10),
		open: true,
		host: true,
		strictPort: true,
		allowedHosts: [
			'sheet-v1.oute.app',
			'localhost',
			'127.0.0.1',
		],
	},
	build: {
		outDir: "dist",
		sourcemap: true,
		// Optimize build
        minify: 'esbuild',  
		rollupOptions: {
			output: {
				// Manual chunk splitting for better caching
				manualChunks: {
					'react-vendor': ['react', 'react-dom'],
					'router': ['react-router-dom'],
					'socket': ['socket.io-client'],
					'mui': ['@mui/material', '@mui/icons-material'],
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});