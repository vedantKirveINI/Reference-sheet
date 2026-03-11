// import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import dotenv from "dotenv";
import { visualizer } from "rollup-plugin-visualizer";
import preload from "vite-plugin-preload";
import path from "path";
import { fileURLToPath } from 'url';
dotenv.config(); // load env vars from .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env vars with REACT_APP_ prefix
  const env = loadEnv(mode, __dirname, 'REACT_APP_');
  
  // Build define object with only REACT_APP_ variables
  const defineEnv = Object.keys(env).reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(env[key]);
    return acc;
  }, {});
  
  // Add NODE_ENV
  defineEnv['process.env.NODE_ENV'] = JSON.stringify(mode === "development" ? "development" : "production");
  
  const odsPath = path.resolve(__dirname, "./src/module/ods/index.jsx");
  
  return {
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
    }),
    svgr(),
    visualizer(),
    preload(),
    // sentryVitePlugin({
    //   org: "instinct-innovations",
    //   project: "javascript-react",
    // }),
    // Custom plugin to handle alias resolution
    {
      name: 'resolve-ods-alias',
      resolveId(id, importer) {
        if (id === '@src/module/ods') {
          return odsPath;
        }
        return null;
      },
    },
  ],
  define: defineEnv,
  build: {
    rollupOptions: {
      maxParallelFileOps: 1,
      treeshake: "recommended",
      output: {
        // Disable chunking in dev mode
        ...(mode === "development" ? {} : {
          manualChunks(id) {
            // Example: Separate all `node_modules` into a `vendor` chunk
            // if (id.includes("oute-ds-grid")) {
            //   return "oute-ds-grid";
            // }
            if (id.includes("gojs")) {
              return "gojs";
            }
          },
        }),
        // manualChunks(id) {
        //   if (id.includes("pages/ic-canvas")) {
        //     console.log("creating chunk");
        //     const chunkName = "page-ic-canvas";
        //     return chunkName;
        //   }
        //   if (id.includes("node_modules/@oute")) {
        //     console.log("ncsklandlsncdlsnvcfd");
        //     return "oute-vendor";
        //   }
        //   if (id.includes("node_modules/oute-ds")) {
        //     console.log("ncsklandlsncdlsnvcfd-oute-ds");
        //     return "oute-ds-vendor";
        //   }
        //   if (id.includes("node_modules")) {
        //     return "vendor";
        //   }
        //   // if (
        //   //   id.includes("node_modules") &&
        //   //   id.includes("oute-") &&
        //   //   !id.includes("@mui")
        //   // ) {
        //   //   const chunkName = id
        //   //     .toString()
        //   //     .split("node_modules/.pnpm/")[1]
        //   //     .split("/")[0]
        //   //     .toString();
        //   //   return chunkName;
        //   // }
        // },
      },
    },
    sourcemap: "hidden",
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: true,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  envPrefix: "REACT_APP_",
  css: {
    modules: {
      localsConvention: "dashes",
    },
    devSourcemap: false,
  },
  optimizeDeps: {
    include: ["oute-ds-loading-button", "react", "react-dom", "lodash-es"],
    force: true,
  },
  resolve: {
    dedupe: ["react", "react-dom", "@emotion/react"],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    alias: [
      { find: "@src/module/ods", replacement: path.resolve(__dirname, "./src/module/ods/index.jsx") },
      { find: "@src", replacement: path.resolve(__dirname, "./src") },
      { find: "lodash", replacement: "lodash-es" },
      { find: /^path$/, replacement: path.resolve(__dirname, "./src/polyfills/path.js") },
    ],
  },
  // rollupOptions: {
  //   output: {
  //     manualChunks(id) {
  //       console.log(id, "creating chunk harsh_test");
  //       // Example: Separate all `node_modules` into a `vendor` chunk
  //       if (id.includes("oute-ds-grid")) {
  //         return "oute-ds-grid";
  //       }
  //     },
  //     // manualChunks: {
  //     //   "oute-ds-grid": ["oute-ds-grid"],
  //     //   lodash: ["lodash"],
  //     // },
  //   },
  // },
  // manualChunks(id) {
  //   if (id.includes("oute-ds-grid")) {
  //     console.log(id, "creating chunk harsh_test");
  //     const chunkName = "oute-ds-grid";
  //     return chunkName;
  //   }
  // },
  };
});
