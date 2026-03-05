import { defineConfig } from 'vite'
import { extname, relative, resolve } from 'path'
import { fileURLToPath } from 'node:url'
import { glob } from 'glob'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import svgr from 'vite-plugin-svgr'
import pkg from './package.json'
// import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { visualizer } from 'rollup-plugin-visualizer'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr(),
        visualizer(),
        libInjectCss(),
        dts({insertTypesEntry: true,}),
        // libAssetsPlugin({
        //   include: /\.svg(\?.*)?$/,
        //   name: 'images/[name].[ext]'
        // })
        viteStaticCopy({
            targets: [
                {
                    src: './assets/images/*.svg', // this is a placeholder string, so we have this script to be executed once
                    dest: 'assets/images/',
                },
                {
                    src: './vite-env*.d.ts', // this is a placeholder string, so we have this script to be executed once
                    dest: '.',
                },
                {
                    src: './vite-env*.d.ts', // God save us all
                    dest: 'assets/images/',
                }
            ]
        }),
    ],
    build: {
        sourcemap: false,
        minify: false,
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'index.jsx'),
            formats: ['es']
        },
        rollupOptions: {
            external: [/^@oute\/oute-ds.*/,/^oute-ds-.*/,/^oute-services-.*/, "@oute/oute-ds.atom.editor", "oute-ds-grid", "ag-grid-community", "oute-ds-formula-bar", "oute-ds-dialog",  "oute-ds-alert", "react-datepicker",  "oute-ds-text-field", 
                // ...Object.keys(pkg['dependencies'] || {}),
                'react',
                'react/jsx-runtime',
                'react-dom',
                '@emotion/react',
                '@emotion/styled',      
                '@emotion/react/jsx-runtime',
                'styled-components',
                'lodash'
                // /^node_modules\/.*/, // Exclude all node_modules
            ],
            input: Object.fromEntries(
                // https://rollupjs.org/configuration-options/#input
                glob.sync('**/*.{ts,tsx,js,jsx}', {
                    ignore: ["*.d.ts", "*.composition.*", "*.stories.*", "*.spec.*", "vite.config.ts", "./node_modules/**", "./dist/**", "./stories/**"],
                }).map(file => [
                    // 1. The name of the entry point
                    // lib/nested/foo.js becomes nested/foo
                    relative(
                        '.',
                        file.slice(0, file.length - extname(file).length)
                    ),
                    // 2. The absolute path to the entry file
                    // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
                    fileURLToPath(new URL(file, import.meta.url))
                ])
            ),
            output: {
                assetFileNames: '[name][extname]',
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
            }
        }
    }
})