<script setup>
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    size: {
        // examples/switch.html 의 .mini/.small/.large 변형과 동일
        type: String,
        default: "" // "" | "mini" | "small" | "large"
    },
    inner: {
        // examples/switch.html 의 .inner 변형과 동일
        type: Boolean,
        default: false
    },
    toggleEvent: {
        // 원본 opts.toggleEvent 와 동일 — 토글을 트리거할 이벤트명(기본 click)
        type: String,
        default: "click"
    }
})

const emit = defineEmits(["update:modelValue", "change"])

function toggle() {
    // 원본(src/components/switch.js) toggle()과 동일하게
    // v-model 갱신과 change 이벤트를 함께 내보낸다.
    const next = !props.modelValue
    emit("update:modelValue", next)
    emit("change", next)
}

// 원본의 getValue/setValue/toggle을 ref로 직접 호출할 수 있도록 노출한다.
// (v-model만으로 충분한 경우가 대부분이지만, 원본처럼 외부 트리거에서 명령형으로
// 제어하고 싶을 때를 위한 API — setValue(true/false)는 toggle과 달리 값을 직접 지정한다)
function getValue() {
    return props.modelValue
}

function setValue(value) {
    const next = !!value
    emit("update:modelValue", next)
    emit("change", next)
}

defineExpose({ getValue, setValue, toggle })
</script>

<template>
    <div class="switch" :class="[size, { on: modelValue, inner }]" v-on="{ [toggleEvent]: toggle }">
        <div class="area">
            <div class="bar">
                <div class="left"></div>
                <div class="right"></div>
            </div>
        </div>
        <div class="handle"></div>
    </div>
</template>
