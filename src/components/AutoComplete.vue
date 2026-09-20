<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue"

// 원본(autocomplete.js)은 ui.dropdown(키보드 내비게이션 + body에 append하는 절대좌표 포지셔닝)에
// 의존했다. Vue 버전은 Tab의 오버플로우 메뉴와 같은 방식으로 — 루트를 position:relative로 두고
// 드롭다운을 top:100%로 CSS만으로 붙인다. target 옵션(특정 하위 input 지정)은 컴포넌트 자체가
// input 하나로 단순화됐으므로 필요 없다 — NumberChecker처럼 이 컴포넌트가 곧 input 한 개다.
// class/style은 기본대로 루트(.ac)에 붙는다 — 원본의 ".ac.group" 래퍼처럼 label과 함께 묶을 때
// 필요해서다. input 자체의 너비 등은 따로 inputStyle prop으로 받는다.
const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    },
    words: {
        type: Array,
        default: () => []
    },
    showAll: {
        // focus 시 입력값이 비어있으면 전체 목록을 보여준다
        type: Boolean,
        default: false
    },
    height: {
        // 드롭다운 최대 높이(px). "auto"면 제한 없음
        type: [String, Number],
        default: "auto"
    },
    inputStyle: {
        // input 자체에 줄 style(너비 등) — style/class는 기본적으로 루트(.ac)에 붙기 때문에 별도로 받는다
        type: [String, Object, Array],
        default: undefined
    }
})

const emit = defineEmits(["update:modelValue", "change"])

const localWords = ref(props.words.slice())
const open = ref(false)
const highlighted = ref(-1)
let blurTimer = null

// 입력 중인 텍스트는 내부 상태를 원본으로 삼는다(ButtonGroup과 동일한 이유) — modelValue prop만
// 보고 있으면 부모가 v-model로 즉시 되돌려주지 않는 한(또는 테스트에서 prop을 안 갱신하면)
// 타이핑한 게 화면/필터링에 반영되지 않는다. 외부에서 prop을 바꾸면 그쪽을 따라간다.
const internalValue = ref(props.modelValue ?? "")
watch(
    () => props.modelValue,
    (v) => {
        if (v !== undefined) internalValue.value = v
    }
)

const visibleList = computed(() => {
    const word = internalValue.value
    if (word === "") return props.showAll ? localWords.value : []

    const w = word.toLowerCase()
    return localWords.value.filter((o) => o.toLowerCase().includes(w))
})

function onInput(e) {
    internalValue.value = e.target.value
    emit("update:modelValue", internalValue.value)
    highlighted.value = -1
}

// visibleList는 modelValue에 파생되므로, 입력 직후(다음 tick) 목록 유무로 open을 갱신한다.
function syncOpenFromList() {
    open.value = visibleList.value.length > 0
}

function onKeyup(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter") return
    syncOpenFromList()
}

function onFocus() {
    if (props.showAll && internalValue.value === "") {
        syncOpenFromList()
    }
}

function onBlur() {
    // 드롭다운 항목 클릭(mousedown)이 blur보다 먼저 처리되도록 살짝 늦춘다
    blurTimer = setTimeout(() => {
        open.value = false
    }, 150)
}

function selectWord(word, e) {
    internalValue.value = word
    emit("update:modelValue", word)
    emit("change", word, e)
    open.value = false
    highlighted.value = -1
}

function onKeydown(e) {
    if (!open.value || visibleList.value.length === 0) return

    if (e.key === "ArrowDown") {
        highlighted.value = Math.min(highlighted.value + 1, visibleList.value.length - 1)
        e.preventDefault()
    } else if (e.key === "ArrowUp") {
        highlighted.value = Math.max(highlighted.value - 1, 0)
        e.preventDefault()
    } else if (e.key === "Enter") {
        if (highlighted.value >= 0) {
            selectWord(visibleList.value[highlighted.value], e)
            e.preventDefault()
        }
    } else if (e.key === "Escape") {
        open.value = false
    }
}

onBeforeUnmount(() => clearTimeout(blurTimer))

/** 원본 update(newWords) — 자동완성 대상 단어 목록을 교체 */
function update(newWords) {
    localWords.value = newWords
}

/** 원본 close() — 드롭다운 닫기 */
function close() {
    open.value = false
}

/** 원본 list() — 현재 필터링된 단어 목록 */
function list() {
    return visibleList.value
}

defineExpose({ update, close, list })
</script>

<template>
    <div class="ac" style="position: relative; display: inline-block;">
        <slot name="prefix" />
        <input
            class="input"
            type="text"
            :style="inputStyle"
            :value="internalValue"
            @input="onInput"
            @keyup="onKeyup"
            @keydown="onKeydown"
            @focus="onFocus"
            @blur="onBlur"
        />
        <div
            v-if="open && visibleList.length > 0"
            class="dropdown"
            style="display: block; left: 0; top: 100%;"
            :style="height !== 'auto' ? { maxHeight: `${height}px`, overflowY: 'auto' } : {}"
        >
            <ul style="position: static;">
                <li
                    v-for="(w, i) in visibleList"
                    :key="w"
                    :class="{ active: i === highlighted }"
                    @mousedown.prevent="selectWord(w, $event)"
                >{{ w }}</li>
            </ul>
        </div>
    </div>
</template>
