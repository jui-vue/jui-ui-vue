import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

export default defineConfig(({ command }) => ({
    plugins: [vue()],
    // dev 서버는 playground/를 루트로 사용, build/test는 워크스페이스 루트
    root: command === "serve" && !process.env.VITEST ? resolve(__dirname, "playground") : __dirname,
    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
        lib: {
            entry: resolve(__dirname, "src/index.js"),
            name: "JuiUiVue",
            fileName: (format) => `jui-ui-vue.${format}.js`
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: { vue: "Vue" },
                exports: "named"
            }
        }
    },
    test: {
        environment: "jsdom",
        include: ["tests/**/*.spec.js"]
    }
}))
