import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

// Builds playground/ as a standalone static app for GitHub Pages
// (https://juijs-vue.github.io/jui-ui-vue/), separate from vite.config.js's
// library build (dist/jui-ui-vue.*.js).
export default defineConfig({
    plugins: [vue()],
    root: resolve(import.meta.dirname, "playground"),
    base: "/jui-ui-vue/",
    build: {
        outDir: resolve(import.meta.dirname, "dist-playground"),
        emptyOutDir: true
    }
})
