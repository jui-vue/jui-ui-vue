<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

// 원본(select.js)은 커스텀 셀렉트박스로, title을 클릭하면 items 목록이 드롭다운으로 열리고
// 바깥을 클릭하면 닫힌다. text/html이 함수일 수도 있는 원본 렌더러 규칙을 그대로 옮겼다.
const props = defineProps({
    items: {
        // string[] 또는 { value, text?, html?, type?: 'divider' }[]
        type: Array,
        default: () => []
    },
    modelValue: {
        // multi=false: value 하나 / multi=true: value 배열
        type: [String, Number, Array],
        default: undefined
    },
    multi: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: "Select a item"
    },
    align: {
        type: String,
        default: "left" // left | right
    },
    valign: {
        type: String,
        default: "top" // top | bottom
    }
})

const emit = defineEmits(["update:modelValue", "change"])

// 원본처럼 문자열 아이템은 { text: it, value: it }로 정규화한다.
const normalizedItems = computed(() =>
    props.items.map((it) => (typeof it === "string" ? { text: it, value: it } : it))
)

function callOrValue(fn, item) {
    return typeof fn === "function" ? fn.call(item) : fn
}

const open = ref(false)
const rootRef = ref(null)

// modelValue 없이 쓰는 경우, items의 selected:true를 초기값으로 삼는다(원본 update()와 동일)
function initialValue() {
    if (props.multi) {
        return normalizedItems.value.filter((it) => it.selected).map((it) => it.value)
    }
    const selected = normalizedItems.value.find((it) => it.selected)
    return selected ? selected.value : undefined
}

const internalValue = ref(props.modelValue !== undefined ? props.modelValue : initialValue())
const currentValue = computed(() => (props.modelValue !== undefined ? props.modelValue : internalValue.value))

function isSelected(item) {
    // divider처럼 value가 없는 항목이, 아무것도 선택 안 된 상태(currentValue===undefined)일 때
    // undefined===undefined로 우연히 "선택됨"이 돼버리는 걸 막는다.
    if (item.type === "divider" || item.value === undefined) return false

    if (props.multi) {
        return Array.isArray(currentValue.value) && currentValue.value.includes(item.value)
    }
    return currentValue.value === item.value
}

function setValue(value) {
    const prevValue = currentValue.value
    internalValue.value = value
    emit("update:modelValue", value)
    emit("change", value, prevValue)
}

function onItemClick(item) {
    if (item.type === "divider") return

    if (props.multi) {
        const current = Array.isArray(currentValue.value) ? currentValue.value : []
        const next = current.includes(item.value)
            ? current.filter((v) => v !== item.value)
            : [...current, item.value]
        setValue(next)
    } else {
        setValue(item.value)
        open.value = false
    }
}

const selectedItems = computed(() => normalizedItems.value.filter((it) => isSelected(it)))

function onDocumentClick(e) {
    if (open.value && rootRef.value && !rootRef.value.contains(e.target)) {
        open.value = false
    }
}

onMounted(() => document.addEventListener("click", onDocumentClick))
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick))

/** 원본 getValue() */
function getValue() {
    return currentValue.value
}
/** 원본 setValue(value) */
function setValueApi(value) {
    setValue(value)
}
/** 원본 setSelectedIndex(index) */
function setSelectedIndex(index) {
    const item = normalizedItems.value[index]
    if (!item) return
    setValue(props.multi ? [item.value] : item.value)
}
/** 원본 getSelectedIndex() — multi가 아닐 때 현재 선택된 아이템의 인덱스 */
function getSelectedIndex() {
    return normalizedItems.value.findIndex((it) => it.value === currentValue.value)
}

defineExpose({ getValue, setValue: setValueApi, setSelectedIndex, getSelectedIndex })
</script>

<template>
    <div ref="rootRef" class="select" :class="[`select-${align}`, `select-${valign}`, { multi, open }]">
        <div class="title" @click="open = !open">
            <span class="title-content">
                <template v-if="selectedItems.length">
                    <span v-for="it in selectedItems" :key="it.value" class="item-view">
                        <span v-if="it.html != null" v-html="callOrValue(it.html, it)"></span>
                        <template v-else>{{ callOrValue(it.text, it) }}</template>
                    </span>
                </template>
                <template v-else>{{ placeholder }}</template>
            </span>
            <i class="icon-arrow2"></i>
        </div>
        <div class="items">
            <template v-for="(it, index) in normalizedItems" :key="it.value ?? index">
                <hr v-if="it.type === 'divider'" class="item divider" />
                <div
                    v-else
                    class="item option"
                    :class="{ selected: isSelected(it) }"
                    :data-index="index"
                    :value="it.value"
                    @click="onItemClick(it)"
                >
                    <span v-if="it.html != null" v-html="callOrValue(it.html, it)"></span>
                    <template v-else>{{ callOrValue(it.text, it) }}</template>
                </div>
            </template>
        </div>
    </div>
</template>
