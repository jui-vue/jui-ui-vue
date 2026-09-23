import pluginVue from "eslint-plugin-vue"
import globals from "globals"

export default [
    {
        name: "app/files-to-lint",
        files: ["**/*.{js,mjs,vue}"]
    },
    {
        name: "app/files-to-ignore",
        ignores: ["**/dist/**", "**/dist-playground/**", "**/node_modules/**", "**/coverage/**"]
    },
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    ...pluginVue.configs["flat/recommended"],
    {
        // vitest 전역(describe/it/expect 등)은 테스트 파일에서만 허용
        files: ["tests/**/*.spec.js"],
        languageOptions: {
            globals: {
                ...globals.node,
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                vi: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly"
            }
        }
    },
    {
        rules: {
            // 이 프로젝트는 원본 jQuery 컴포넌트와의 1:1 동작 재현이 우선이라, 컴포넌트 크기/복잡도에
            // 대한 일반적 스타일 제약(vue/max-attributes-per-line 등)은 끔 — 가독성보다 원본과의
            // 대조 용이성을 우선한 코드 스타일(긴 인라인 스타일 바인딩 등)이 많기 때문.
            "vue/max-attributes-per-line": "off",
            "vue/singleline-html-element-content-newline": "off",
            "vue/multiline-html-element-content-newline": "off",
            "vue/html-self-closing": "off",
            "vue/attribute-hyphenation": "off",
            "vue/require-default-prop": "off",
            // 기존 코드 전체가 4-space 들여쓰기를 이미 일관되게 쓰고 있지만, eslint-plugin-vue의
            // vue/html-indent 계산 방식과 안 맞아(속성 줄바꿈 등에서) 1500개 넘는 오탐 warning이
            // 나옴 — 실제 들여쓰기 불일치가 아니라 규칙 자체의 오탐이라 끔.
            "vue/html-indent": "off",
            // 원본 jQuery 컴포넌트 이름(ui.window, ui.tree 등)과 1:1 대응시키려고 컴포넌트명을
            // 의도적으로 단일 단어로 지었다(Window, Tree, Tab, Switch...) — 네이티브/향후 HTML
            // 엘리먼트와의 충돌 방지 규칙이지만, 이 라이브러리는 이미 Vue 앱에 <Window>처럼
            // PascalCase로만 등록해서 쓰므로 실질 위험이 없다.
            "vue/multi-word-component-names": "off",
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]
        }
    }
]
