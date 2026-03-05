// import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import dotenv from "dotenv";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env vars with REACT_APP_ prefix
  const env = loadEnv(mode, __dirname, "REACT_APP_");

  // Build define object with only REACT_APP_ variables
  const defineEnv = Object.keys(env).reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(env[key]);
    return acc;
  }, {});

  // Add NODE_ENV
  defineEnv["process.env.NODE_ENV"] = JSON.stringify(
    mode === "development" ? "development" : "production"
  );

  const odsPath = path.resolve(__dirname, "./src/module/ods/index.jsx");

  return {
    plugins: [
      react({
        // Using default React JSX (no Emotion)
        jsxRuntime: "automatic", // Explicitly set JSX runtime
        babel: {
          plugins: [],
        },
      }),
      svgr(),
      // visualizer(), // Disabled to reduce memory usage
      // Custom plugin to handle alias resolution
      {
        name: "resolve-ods-alias",
        resolveId(id) {
          if (id === "@src/module/ods") {
            return odsPath;
          }
          return null;
        },
      },
    ],
    define: defineEnv,
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        maxParallelFileOps: 1,
        treeshake: "recommended",
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("gojs")) return "vendor-gojs";
              return "vendor";
            }
          },
        },
      },
      sourcemap: "hidden",
      chunkSizeWarningLimit: 2000,
    },
    server: {
      port: 5000,
      host: "0.0.0.0",
      allowedHosts: true,
      cors: true,
      proxy: {
        "/api/ai-formula": {
          target: "http://localhost:3002",
          changeOrigin: true,
        },
        "/api/canvas-assistant": {
          target: "http://localhost:3003",
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyRes", (proxyRes) => {
              if (proxyRes.headers["content-type"]?.includes("text/event-stream")) {
                proxyRes.headers["cache-control"] = "no-cache, no-transform";
                proxyRes.headers["x-accel-buffering"] = "no";
              }
            });
          },
        },
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
      // Prevent module duplication in dev mode
      preTransformRequests: true,
      warmup: {
        clientFiles: ["./src/index.jsx"],
      },
      watch: {
        ignored: ["**/.local/**", "**/node_modules/.pnpm/**", "**/.pnpm-store/**"],
      },
    },
    envPrefix: ["REACT_APP_", "VITE_"],
    css: {
      modules: {
        localsConvention: "dashes",
      },
      devSourcemap: false,
    },
    optimizeDeps: {
      // Pre-bundle minimal deps to reduce memory usage
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
      ],
      holdUntilCrawlEnd: false,
      esbuildOptions: {
        alias: {
          "react-dom/server": path.resolve(
            __dirname,
            "./src/lib/mocks/react-dom-server.js"
          ),
          "@oute/oute-ds.core.constants": path.resolve(
            __dirname,
            "./src/module/constants"
          ),
          "@oute/oute-ds.common.core.utils": path.resolve(
            __dirname,
            "./src/module/utils"
          ),
          "@oute/oute-ds.core.contexts": path.resolve(
            __dirname,
            "./src/module/contexts"
          ),
          "@src/module": path.resolve(__dirname, "./src/module"),
          "@src": path.resolve(__dirname, "./src"),
        },
        mainFields: ["module", "main"],
        format: "esm",
        jsx: "automatic",
      },
      exclude: [
        "cmdk",
        "@radix-ui/react-collapsible",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-toggle",
        "@radix-ui/react-switch",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-toggle-group",
        "@radix-ui/react-tabs",
      ],
    },
    resolve: {
      // Deduplicate React to ensure single instance
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
      conditions: ["import", "module", "browser", "default"],
      alias: [
        {
          find: "@src/module/ods",
          replacement: path.resolve(__dirname, "./src/module/ods/index.jsx"),
        },
        { find: "@src", replacement: path.resolve(__dirname, "./src") },
        { find: "@", replacement: path.resolve(__dirname, "./src") },
        {
          find: "lodash",
          replacement: path.resolve(__dirname, "./node_modules/lodash-es"),
        },
        {
          find: /^path$/,
          replacement: path.resolve(__dirname, "./src/polyfills/path.js"),
        },
        {
          find: /^hoist-non-react-statics$/,
          replacement: path.resolve(
            __dirname,
            "./src/polyfills/hoist-non-react-statics.js"
          ),
        },
        // Map @oute/oute-ds.core.constants to local constants module
        {
          find: "@oute/oute-ds.core.constants",
          replacement: path.resolve(__dirname, "./src/module/constants"),
        },
        {
          find: "@oute/oute-ds.core.constants/constants",
          replacement: path.resolve(
            __dirname,
            "./src/module/constants/constants.ts"
          ),
        },
        {
          find: "@oute/oute-ds.core.constants/countries-list",
          replacement: path.resolve(
            __dirname,
            "./src/module/constants/countries-list.ts"
          ),
        },
        {
          find: "@oute/oute-ds.core.constants/imagePickerConstant",
          replacement: path.resolve(
            __dirname,
            "./src/module/constants/imagePickerConstant.tsx"
          ),
        },
        {
          find: "@oute/oute-ds.core.constants/shared/shared.css",
          replacement: path.resolve(
            __dirname,
            "./src/module/constants/shared/shared.css"
          ),
        },
        // Map @oute/oute-ds.common.molecule.tiny-auth to local tiny-auth-wrapper
        {
          find: "@oute/oute-ds.common.molecule.tiny-auth",
          replacement: path.resolve(
            __dirname,
            "./src/module/tiny-auth-wrapper"
          ),
        },
        // Map @oute/oute-ds.common.core.utils to local utils module
        {
          find: "@oute/oute-ds.common.core.utils",
          replacement: path.resolve(__dirname, "./src/module/utils"),
        },
        {
          find: "@oute/oute-ds.common.core.utils/services",
          replacement: path.resolve(__dirname, "./src/module/utils/services"),
        },
        // Map @oute/oute-ds.molecule.short-text to local short-text module
        {
          find: "@oute/oute-ds.molecule.short-text",
          replacement: path.resolve(__dirname, "./src/module/short-text"),
        },
        // Map @oute/oute-ds.core.contexts to local contexts module
        {
          find: "@oute/oute-ds.core.contexts",
          replacement: path.resolve(__dirname, "./src/module/contexts"),
        },
        // Map @oute/oute-ds.common.molecule.terminal to local terminal module
        {
          find: "@oute/oute-ds.common.molecule.terminal",
          replacement: path.resolve(__dirname, "./src/module/terminal"),
        },
        // Map @oute/oute-ds.skeleton.* to local skeleton modules
        {
          find: "@oute/oute-ds.skeleton.question-filler",
          replacement: path.resolve(__dirname, "./src/module/question-filler"),
        },
        {
          find: "@oute/oute-ds.skeleton.question-preview",
          replacement: path.resolve(__dirname, "./src/module/question-preview"),
        },
        {
          find: "@oute/oute-ds.skeleton.question-v2",
          replacement: path.resolve(__dirname, "./src/module/question-v2"),
        },
        {
          find: "@oute/oute-ds.skeleton.question-augmentor",
          replacement: path.resolve(
            __dirname,
            "./src/module/question-augmentor"
          ),
        },
        {
          find: "@oute/oute-ds.skeleton.question-creator",
          replacement: path.resolve(__dirname, "./src/module/question-creator"),
        },
        // Map @oute/oute-ds.common.molecule.integration-v2 to local integration-v2 module
        {
          find: "@oute/oute-ds.common.molecule.integration-v2",
          replacement: path.resolve(__dirname, "./src/module/integration-v2"),
        },
        // Map @oute/oute-ds.atom.image-picker to local image-picker module
        {
          find: "@oute/oute-ds.atom.image-picker",
          replacement: path.resolve(__dirname, "./src/module/image-picker"),
        },
        // Map all @oute/oute-ds.molecule.* packages to their local modules
        {
          find: "@oute/oute-ds.molecule.long-text",
          replacement: path.resolve(__dirname, "./src/module/long-text"),
        },
        {
          find: "@oute/oute-ds.molecule.picture",
          replacement: path.resolve(__dirname, "./src/module/picture"),
        },
        {
          find: "@oute/oute-ds.molecule.mcq",
          replacement: path.resolve(__dirname, "./src/module/mcq"),
        },
        {
          find: "@oute/oute-ds.molecule.filler-mcq-options-group",
          replacement: path.resolve(
            __dirname,
            "./src/module/filler-mcq-options-group"
          ),
        },
        {
          find: "@oute/oute-ds.molecule.phone-number",
          replacement: path.resolve(__dirname, "./src/module/phone-number"),
        },
        {
          find: "@oute/oute-ds.molecule.zip-code",
          replacement: path.resolve(__dirname, "./src/module/zip-code"),
        },
        {
          find: "@oute/oute-ds.molecule.dropdown",
          replacement: path.resolve(__dirname, "./src/module/dropdown"),
        },
        {
          find: "@oute/oute-ds.molecule.dropdown-static",
          replacement: path.resolve(__dirname, "./src/module/dropdown-static"),
        },
        {
          find: "@oute/oute-ds.molecule.yes-no",
          replacement: path.resolve(__dirname, "./src/module/yes-no"),
        },
        {
          find: "@oute/oute-ds.molecule.ranking",
          replacement: path.resolve(__dirname, "./src/module/ranking"),
        },
        {
          find: "@oute/oute-ds.molecule.connection",
          replacement: path.resolve(__dirname, "./src/module/connection"),
        },
        {
          find: "@oute/oute-ds.molecule.email",
          replacement: path.resolve(__dirname, "./src/module/email"),
        },
        {
          find: "@oute/oute-ds.molecule.ending",
          replacement: path.resolve(__dirname, "./src/module/ending"),
        },
        {
          find: "@oute/oute-ds.molecule.date",
          replacement: path.resolve(__dirname, "./src/module/date"),
        },
        {
          find: "@oute/oute-ds.molecule.currency",
          replacement: path.resolve(__dirname, "./src/module/currency"),
        },
        {
          find: "@oute/oute-ds.molecule.key-value-table",
          replacement: path.resolve(__dirname, "./src/module/key-value-table"),
        },
        {
          find: "@oute/oute-ds.molecule.number",
          replacement: path.resolve(__dirname, "./src/module/number"),
        },
        {
          find: "@oute/oute-ds.molecule.file-picker",
          replacement: path.resolve(__dirname, "./src/module/file-picker"),
        },
        {
          find: "@oute/oute-ds.molecule.time",
          replacement: path.resolve(__dirname, "./src/module/time"),
        },
        {
          find: "@oute/oute-ds.molecule.signature",
          replacement: path.resolve(__dirname, "./src/module/signature"),
        },
        {
          find: "@oute/oute-ds.molecule.address",
          replacement: path.resolve(__dirname, "./src/module/address"),
        },
        {
          find: "@oute/oute-ds.molecule.questions-grid",
          replacement: path.resolve(__dirname, "./src/module/questions-grid"),
        },
        {
          find: "@oute/oute-ds.molecule.autocomplete",
          replacement: path.resolve(__dirname, "./src/module/autocomplete"),
        },
        {
          find: "@oute/oute-ds.molecule.pdf-viewer",
          replacement: path.resolve(__dirname, "./src/module/pdf-viewer"),
        },
        {
          find: "@oute/oute-ds.molecule.question-repeater",
          replacement: path.resolve(
            __dirname,
            "./src/module/question-repeater"
          ),
        },
        {
          find: "@oute/oute-ds.molecule.text-preview",
          replacement: path.resolve(__dirname, "./src/module/text-preview"),
        },
        {
          find: "@oute/oute-ds.molecule.rating",
          replacement: path.resolve(__dirname, "./src/module/rating"),
        },
        {
          find: "@oute/oute-ds.molecule.opinion-scale",
          replacement: path.resolve(__dirname, "./src/module/opinion-scale"),
        },
        {
          find: "@oute/oute-ds.molecule.slider",
          replacement: path.resolve(__dirname, "./src/module/slider"),
        },
        {
          find: "@oute/oute-ds.molecule.filler-scq",
          replacement: path.resolve(__dirname, "./src/module/filler-scq"),
        },
        {
          find: "@oute/oute-ds.molecule.stripe-payment",
          replacement: path.resolve(__dirname, "./src/module/stripe-payment"),
        },
        {
          find: "@oute/oute-ds.molecule.terms-of-use",
          replacement: path.resolve(__dirname, "./src/module/terms-of-use"),
        },
        {
          find: "@oute/oute-ds.molecule.collect-payment",
          replacement: path.resolve(__dirname, "./src/module/collect-payment"),
        },
        // Map @oute/oute-sds.molecule.country-picker to local country-picker
        {
          find: "@oute/oute-sds.molecule.country-picker",
          replacement: path.resolve(__dirname, "./src/module/country-picker"),
        },
        // Map @oute/ic* packages to local stubs
        {
          find: "@oute/icconnection.skeleton.create-event-connection",
          replacement: path.resolve(__dirname, "./src/module/ic-connection"),
        },
        {
          find: "@oute/icdeployment.molecule.common-account-actions",
          replacement: path.resolve(
            __dirname,
            "./src/module/ic-deployment/common-account-actions/index.ts"
          ),
        },
        {
          find: "@oute/icdeployment.skeleton.test-case-run",
          replacement: path.resolve(
            __dirname,
            "./src/module/ic-deployment/test-case-run"
          ),
        },
        {
          find: "@oute/icdeployment.skeleton.test-case-setup",
          replacement: path.resolve(
            __dirname,
            "./src/module/ic-deployment/test-case-setup"
          ),
        },
        {
          find: "@oute/icdeployment.skeleton.setup-validator",
          replacement: path.resolve(__dirname, "./src/module/ic-deployment"),
        },
        // Map oute-ds-formula-bar to formula-fx module (point to index file)
        {
          find: "oute-ds-formula-bar",
          replacement: path.resolve(
            __dirname,
            "./src/components/formula-fx/src/index.jsx"
          ),
        },
        // Mock react-dom/server for ag-grid-react (browser environment doesn't need server-side rendering)
        {
          find: "react-dom/server",
          replacement: path.resolve(
            __dirname,
            "./src/lib/mocks/react-dom-server.js"
          ),
        },
      ],
    },
  };
});
