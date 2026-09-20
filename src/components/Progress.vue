<script setup>
import { computed, ref, watch } from "vue"

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

/**
 * 원본 `progress.js`의 `this.setStriped(isStriped)`/`this.setAnimated(isAnimated)` 대응
 * (progress.js:89-103) - 완전성 감사에서 발견된, 문서화 안 된 API 축소를 보강.
 * `striped`/`animated` props는 초기값일 뿐, 이 메서드들로 언제든 prop과 무관하게 override 가능하도록
 * 로컬 ref로 소유 - 원본이 jQuery 위젯 인스턴스에 직접 상태를 들고 있던 것과 동일한 의미.
 * 인자 없이 호출하면(원본의 `typeof isStriped == "undefined"` 분기) 현재 prop 값으로 재동기화한다 -
 * 단순 toggle이 아니다.
 */
const localStriped = ref(props.striped)
const localAnimated = ref(props.animated)
watch(() => props.striped, (v) => { localStriped.value = v })
watch(() => props.animated, (v) => { localAnimated.value = v })

function setStriped(isStriped) {
    localStriped.value = isStriped === undefined ? props.striped : isStriped
}
function setAnimated(isAnimated) {
    localAnimated.value = isAnimated === undefined ? props.animated : isAnimated
}

defineExpose({ getValue, setValue, setStriped, setAnimated })
</script>

<template>
    <div class="progress" :class="[orient, variant]">
        <div class="area">
            <div class="bar" :class="{ striped: localStriped, animated: localAnimated }" :style="barStyle"></div>
        </div>
    </div>
</template>
