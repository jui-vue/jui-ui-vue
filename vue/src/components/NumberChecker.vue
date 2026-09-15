<script setup>
import { ref } from "vue"

// 원본(src/components/numberchecker.js)은 `numberchecker("input", opts)`처럼
// 마크업의 input 하나(또는 매치된 각각)에 유효성 검사를 붙이는 방식이었다.
// Vue 버전은 컴포넌트 하나 = input 하나로, 여러 개 필요하면 v-for로 반복해서 쓴다.
const props = defineProps({
    modelValue: {
        type: [Number, String],
        default: null
    },
    integer: {
        type: Boolean,
        default: true
    },
    min: {
        // null이면 제한 없음
        type: [Number, String],
        default: null
    },
    max: {
        type: [Number, String],
        default: null
    },
    empty: {
        // 값이 비거나 잘못됐을 때 blur 시 되돌릴 대상 — "min" | "max" | "value" | null(=invalid 상태로 표시)
        type: String,
        default: null
    },
    message: {
        // invalid 상태일 때 보여줄 placeholder
        type: String,
        default: "Invalid number"
    },
    size: {
        type: String,
        default: "normal" // large | normal | small | mini
    }
})

const emit = defineEmits(["update:modelValue"])

function isValidNumber(value) {
    const regex = props.integer ? /^[-]?\d+$/ : /^[-]?\d+(?:[.]\d+)?$/
    return regex.test(value)
}

function toNumber(value) {
    return props.integer ? parseInt(value, 10) : parseFloat(value)
}

function hasMin() {
    return props.min !== null && props.min !== ""
}
function hasMax() {
    return props.max !== null && props.max !== ""
}

const display = ref(props.modelValue != null ? String(props.modelValue) : "")
const invalid = ref(false)
const placeholder = ref("")

// 원본 init()의 초기값 검증과 동일 — 빈 값도 정규식을 통과 못 해서 invalid로 처리된다
// (modelValue를 아예 안 줬으면 처음부터 invalid + placeholder로 시작한다)
if (!isValidNumber(display.value)) {
    invalid.value = true
    display.value = ""
    placeholder.value = props.message
}

function onInput() {
    if (!isValidNumber(display.value)) return

    const value = toNumber(display.value)

    if (hasMin() && hasMax()) {
        if (value >= toNumber(props.min) && value <= toNumber(props.max)) emit("update:modelValue", value)
    } else if (hasMin() && !hasMax()) {
        if (value >= toNumber(props.min)) emit("update:modelValue", value)
    } else if (!hasMin() && hasMax()) {
        if (value <= toNumber(props.max)) emit("update:modelValue", value)
    } else {
        emit("update:modelValue", value)
    }
}

function onFocus() {
    invalid.value = false
    placeholder.value = ""
}

function onBlur() {
    if (!isValidNumber(display.value)) {
        if (props.empty != null) {
            const fallback = props.empty === "min" ? props.min : props.empty === "max" ? props.max : props.modelValue
            display.value = fallback === null || fallback === "" ? "" : String(fallback)
            if (isValidNumber(display.value)) emit("update:modelValue", toNumber(display.value))
        } else {
            invalid.value = true
            display.value = ""
            placeholder.value = props.message
        }
        return
    }

    let value = toNumber(display.value)
    if (hasMin() && value < toNumber(props.min)) value = toNumber(props.min)
    else if (hasMax() && value > toNumber(props.max)) value = toNumber(props.max)

    display.value = String(value)
    emit("update:modelValue", value)
}
</script>

<template>
    <input
        v-model="display"
        class="input"
        :class="[size, { invalid }]"
        type="text"
        :placeholder="placeholder"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
    />
</template>
