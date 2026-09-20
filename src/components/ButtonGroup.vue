<script setup>
import { ref, computed } from "vue"

const props = defineProps({
    items: {
        // { text?, value, disabled?, icon?, iconExtra? } — icon은 "icon-" 접두사를 뺀 이름(예: "home"),
        // text 없이 icon만 주면 아이콘 전용 버튼이 된다
        type: Array,
        required: true
    },
    type: {
        type: String,
        default: "radio", // "radio" | "check"
        validator: (v) => v === "radio" || v === "check"
    },
    modelValue: {
        // radio: 단일 value / check: value 배열
        type: [String, Number, Array],
        default: undefined
    },
    index: {
        // 원본 opts.index 대응 — modelValue를 안 넘겼을 때 인덱스로 초기 선택
        // (원본 UI.setup()의 기본값 index: 0 과 동일하게, radio는 안 주면 0번째가 기본 선택)
        type: [Number, Array],
        default: undefined
    },
    size: {
        type: String,
        default: "normal" // large | normal | small | mini
    },
    disabled: {
        // 원본 enable(isActive)에 대응 — 그룹 전체를 한번에 비활성화
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(["update:modelValue", "change", "click"])

function indexToValue(idx) {
    return props.items[idx] ? props.items[idx].value : undefined
}

function indexInitialValue() {
    if (props.type === "check") {
        return Array.isArray(props.index) ? props.index.map(indexToValue).filter((v) => v !== undefined) : []
    }
    return typeof props.index === "number" ? indexToValue(props.index) : indexToValue(0)
}

// modelValue를 넘기지 않고 쓰는(v-model 없이 index/이벤트만 쓰는) 경우를 위한 내부 상태.
// modelValue가 주어지면 항상 그쪽이 우선한다.
const internalValue = ref(props.modelValue !== undefined ? props.modelValue : indexInitialValue())
const currentValue = computed(() => (props.modelValue !== undefined ? props.modelValue : internalValue.value))

function isActive(item) {
    if (props.type === "check") {
        return Array.isArray(currentValue.value) && currentValue.value.includes(item.value)
    }
    return currentValue.value === item.value
}

function onClick(item, e) {
    if (props.disabled || item.disabled) return

    let nextValue

    if (props.type === "check") {
        const current = Array.isArray(currentValue.value) ? currentValue.value : []
        nextValue = current.includes(item.value)
            ? current.filter((v) => v !== item.value)
            : [...current, item.value]
    } else {
        nextValue = item.value
    }

    internalValue.value = nextValue
    emit("update:modelValue", nextValue)
    emit("change", { item, value: nextValue }, e)
    emit("click", { item, value: nextValue }, e)
}

// 원본(button.js)의 setValue/setIndex/getValue/getData 대응 — v-model 밖에서
// ref로 직접 그룹을 제어하고 싶을 때 쓰는 명령형 API.
function setValueInternal(value) {
    internalValue.value = value
    emit("update:modelValue", value)
    emit("change", { item: undefined, value }, undefined)
}

function setValue(value) {
    setValueInternal(value)
}

function setIndex(indexList) {
    if (props.type === "check") {
        const list = Array.isArray(indexList) ? indexList : [indexList]
        setValueInternal(list.map(indexToValue).filter((v) => v !== undefined))
    } else {
        setValueInternal(indexToValue(indexList))
    }
}

function getValue() {
    return currentValue.value
}

function getData() {
    if (props.type === "check") {
        return (Array.isArray(currentValue.value) ? currentValue.value : []).map((v) =>
            props.items.find((it) => it.value === v)
        )
    }
    return props.items.find((it) => it.value === currentValue.value)
}

defineExpose({ setValue, setIndex, getValue, getData })
</script>

<template>
    <div class="group">
        <a
            v-for="item in items"
            :key="item.value"
            class="btn"
            :class="[size, { active: isActive(item), disabled: disabled || item.disabled }]"
            :value="item.value"
            href="javascript:void(0)"
            @click="onClick(item, $event)"
        ><i v-if="item.icon" :class="[`icon-${item.icon}`, item.iconExtra]"></i>{{ item.icon && item.text ? " " : "" }}{{ item.text || "" }}</a>
    </div>
</template>
