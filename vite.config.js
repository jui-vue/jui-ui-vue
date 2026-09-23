import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

export default defineConfig(({ command }) => ({
    plugins: [vue()],
    // dev 서버는 playground/를 루트로 사용, build/test는 워크스페이스 루트
    root: command === "serve" && !process.env.VITEST ? resolve(import.meta.dirname, "playground") : import.meta.dirname,
    build: {
        outDir: resolve(import.meta.dirname, "dist"),
        emptyOutDir: true,
        lib: {
            entry: resolve(import.meta.dirname, "src/index.js"),
            name: "JuiUiVue",
            fileName: (format) => `jui-ui-vue.${format}.js`
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: { vue: "Vue" },
                exports: "named",
                // Vite 8 defaults the lib CSS output to `jui-ui-vue.css` (matching the entry name)
                // instead of the fixed `style.css` this repo's package.json exports/consumers expect.
                assetFileNames: (asset) => (asset.names?.[0]?.endsWith(".css") ? "style.css" : "assets/[name][extname]")
            }
        }
    },
    test: {
        environment: "jsdom",
        include: ["tests/**/*.spec.js"]
    }
}))
