import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export default defineConfig({
        plugins: [
                tailwindcss(),
                react(),
        ],
        define: {
                "process.env": {
                        ...process.env,
                },
        },
        server: {
                port: 5000,
                host: "0.0.0.0",
                strictPort: true,
                allowedHosts: true,
        },
        build: {
                outDir: "dist",
                sourcemap: true,
                minify: "esbuild",
                rollupOptions: {
                        external: [
                                "@oute/oute-ds.common.molecule.tiny-auth",
                                "@oute/oute-ds.molecule.signature",
                                "@oute/icdeployment.molecule.common-account-actions",
                        ],
                        output: {
                                manualChunks: {
                                        "react-vendor": ["react", "react-dom"],
                                        router: ["react-router-dom"],
                                        socket: ["socket.io-client"],
                                },
                        },
                },
        },
        resolve: {
                alias: {
                        "@": path.resolve(__dirname, "./src"),
                        "@oute/oute-ds.common.molecule.tiny-auth": path.resolve(__dirname, "./src/stubs/tiny-auth.tsx"),
                        "@oute/oute-ds.molecule.signature": path.resolve(__dirname, "./src/stubs/signature.tsx"),
                        "@oute/icdeployment.molecule.common-account-actions": path.resolve(__dirname, "./src/stubs/common-account-actions.tsx"),
                },
        },
});
