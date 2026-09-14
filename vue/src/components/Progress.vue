<script setup>
import { computed } from "vue"

const props = defineProps({
    modelValue: {
        type: Number,
        default: 0
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    },
    orient: {
        type: String,
        default: "horizontal" // horizontal | vertical
    },
    variant: {
        // 원본 opts.type — "" | "flat" | "simple" | "simple flat"
        type: String,
        default: ""
    },
    striped: {
        type: Boolean,
        default: false
    },
    animated: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(["update:modelValue"])

const percent = computed(() => {
    const range = props.max - props.min
    if (range === 0) return 0
    return ((props.modelValue - props.min) / range) * 100
})

const barStyle = computed(() =>
    props.orient === "vertical" ? { height: `${percent.value}%` } : { width: `${percent.value}%` }
)

/** 원본 getValue()/setValue() 대응 */
function getValue() {
    return props.modelValue
}
function setValue(v) {
    emit("update:modelValue", v)
}

defineExpose({ getValue, setValue })
</script>

<template>
    <div class="progress" :class="[orient, variant]">
        <div class="area">
            <div class="bar" :class="{ striped, animated }" :style="barStyle"></div>
        </div>
    </div>
</template>
