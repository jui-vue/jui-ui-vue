<script setup>
// 원본(slider.js)은 jui.include("util.math")(juijs 코어의 정밀 산술 유틸, 이 리포에
// vendoring 안 됨)로 step 스냅 시 부동소수점 오차를 피했다 — 같은 목적을 stepValue()에서
// step의 소수 자릿수만큼 반올림하는 방식으로 재구현했다.
// 원본은 from/to 두 핸들의 값을 getFromValue()/getToValue()/setFromValue()/setToValue()로
// 다뤘는데, Vue 버전은 from/to를 각각 v-model:from / v-model:to로 노출해 선언적으로 쓸 수
// 있게 하면서, 동일한 이름의 명령형 메서드도 그대로 노출한다.
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue"

const props = defineProps({
    type: { type: String, default: "single" }, // 'single' | 'double'
    orient: { type: String, default: "horizontal" }, // 'horizontal' | 'vertical'
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10 },
    step: { type: Number, default: 1 },
    from: { type: Number, default: 0 }, // v-model:from
    to: { type: Number, default: 10 }, // v-model:to (double일 때만 사용)
    tooltip: { type: Boolean, default: true },
    progress: { type: Boolean, default: true },
    format: { type: Function, default: null }
})
const emit = defineEmits(["update:from", "update:to", "change"])

const isDouble = computed(() => props.type === "double")
const isVertical = computed(() => props.orient === "vertical")

const rootEl = ref(null)
const trackEl = ref(null)
const fromTooltipEl = ref(null)
const toTooltipEl = ref(null)

// 원본은 초기화 시 setFromValue() -> setToValue() 순서로 호출되는데, 이때 checkMaxFromTo()가
// 아직 그려지지 않은 반대쪽 핸들의 CSS 값을 읽어 parseFloat(undefined)=NaN을 얻고, NaN과의
// 비교는 항상 false이므로 첫 호출에서는 clamp가 걸리지 않는다. NaN으로 시작해 그 동작을
// 그대로 재현한다(0으로 시작하면 setFromValue()가 아직 계산 전인 toDist=0에 걸려 clamp되어버림).
const fromDist = ref(NaN) // 0~100(%)
const toDist = ref(NaN)
const fromMessage = ref("")
const toMessage = ref("")
const fromTooltipClass = ref({})
const toTooltipClass = ref({})
const fromTooltipStyle = ref({})
const toTooltipStyle = ref({})
const showTooltip = ref(false)
const selecting = ref(null) // 'from' | 'to' | null

let preFromValue
let preToValue

function stepValue(value) {
    const step = props.step
    const remain = value % step
    let result = value - remain
    if (remain > step / 2) result += step
    const decimals = (String(step).split(".")[1] || "").length
    return Number(result.toFixed(decimals))
}

function distToValue(dist) {
    const raw = props.min + (props.max - props.min) * dist
    return stepValue(raw)
}

function checkMaxFromTo(dist, type) {
    if (!isDouble.value) return dist
    if (type === "from" && dist >= toDist.value) return toDist.value
    if (type === "to" && dist <= fromDist.value) return fromDist.value
    return dist
}

async function setViewStatus(distPercent, type) {
    let value = distToValue(distPercent / 100)
    if (value < props.min) value = props.min
    if (value > props.max) value = props.max

    let dist = ((value - props.min) / (props.max - props.min)) * 100
    dist = checkMaxFromTo(dist, type)
    value = distToValue(dist / 100)

    if (type === "from") fromDist.value = dist
    else toDist.value = dist

    if (props.tooltip) {
        let displayValue = value
        if (typeof props.format === "function") displayValue = props.format(value)

        if (type === "from") fromMessage.value = displayValue
        else toMessage.value = displayValue

        showTooltip.value = true
        await nextTick()
        positionTooltip(type, dist)
    }

    if (type === "from") {
        if (preFromValue !== value) {
            emit("update:from", value)
            emit("change", { type, from: value, to: getToValue() })
            preFromValue = value
        }
    } else {
        if (preToValue !== value) {
            emit("update:to", value)
            emit("change", { type, from: getFromValue(), to: value })
            preToValue = value
        }
    }
}

function positionTooltip(type, dist) {
    const tooltipEl = type === "from" ? fromTooltipEl.value : toTooltipEl.value
    const styleRef = type === "from" ? fromTooltipStyle : toTooltipStyle
    const classRef = type === "from" ? fromTooltipClass : toTooltipClass
    if (!tooltipEl || !trackEl.value) return

    if (isVertical.value) {
        styleRef.value = {
            bottom: trackEl.value.offsetHeight * (dist / 100) + "px",
            marginBottom: -(tooltipEl.offsetHeight / 2) + "px"
        }
        classRef.value = {}
    } else {
        const trackWidth = trackEl.value.offsetWidth
        const handleWidth = 13
        const tooltipWidth = tooltipEl.offsetWidth
        const xPos = trackWidth * (dist / 100)
        const lastPos = xPos + tooltipWidth / 2
        const firstPos = xPos - tooltipWidth / 2

        if (lastPos >= trackWidth) {
            styleRef.value = { left: trackWidth - tooltipWidth + handleWidth / 2 + "px", marginLeft: "0" }
            classRef.value = { last: true }
        } else if (firstPos <= 0) {
            styleRef.value = { left: -handleWidth / 2 + "px", marginLeft: "0" }
            classRef.value = { first: true }
        } else {
            styleRef.value = { left: dist + "%", marginLeft: -(tooltipWidth / 2) + "px" }
            classRef.value = {}
        }
    }
}

function setHandlePosition(e, type) {
    if (!trackEl.value) return
    const rect = trackEl.value.getBoundingClientRect()
    let dist

    if (isVertical.value) {
        const min = rect.top
        const max = min + rect.height
        const current = e.clientY
        if (current <= min) dist = 100
        else if (current >= max) dist = 0
        else dist = ((max - current) / (max - min)) * 100
    } else {
        const min = rect.left
        const max = min + rect.width
        const current = e.clientX
        if (current < min) dist = 0
        else if (current > max) dist = 100
        else dist = ((current - min) / (max - min)) * 100
    }

    setViewStatus(dist, type)
}

function onHandleMouseDown(type) {
    selecting.value = type
    document.body.classList.add("slider-cursor")
}
function onTrackMouseDown(e) {
    document.body.classList.add("slider-cursor")
    if (!isDouble.value) {
        selecting.value = "from"
        setHandlePosition(e, "from")
    }
}
function onDocMouseUp() {
    selecting.value = null
    document.body.classList.remove("slider-cursor")
}
function onDocMouseMove(e) {
    if (selecting.value === "from") setHandlePosition(e, "from")
    else if (selecting.value === "to") setHandlePosition(e, "to")
}

function getFromValue() {
    return distToValue(fromDist.value / 100)
}
function getToValue() {
    return isDouble.value ? distToValue(toDist.value / 100) : getFromValue()
}
function setFromValue(value) {
    const from = value !== undefined ? value : props.from
    setViewStatus(((from - props.min) / (props.max - props.min)) * 100, "from")
}
function setToValue(value) {
    if (!isDouble.value) return
    const to = value !== undefined ? value : props.to
    setViewStatus(((to - props.min) / (props.max - props.min)) * 100, "to")
}

onMounted(() => {
    document.addEventListener("mouseup", onDocMouseUp)
    document.addEventListener("mousemove", onDocMouseMove)
    setFromValue()
    setToValue()
})
onBeforeUnmount(() => {
    document.removeEventListener("mouseup", onDocMouseUp)
    document.removeEventListener("mousemove", onDocMouseMove)
})

watch([() => props.min, () => props.max, () => props.step, () => props.type], () => {
    setFromValue(getFromValue())
    setToValue(getToValue())
})

const progressStyle = computed(() => {
    if (!isDouble.value) {
        return isVertical.value ? { height: fromDist.value + "%", bottom: "0" } : { width: fromDist.value + "%" }
    }
    return isVertical.value
        ? { height: toDist.value - fromDist.value + "%", bottom: fromDist.value + "%" }
        : { width: toDist.value - fromDist.value + "%", left: fromDist.value + "%" }
})
const fromHandleStyle = computed(() => (isVertical.value ? { bottom: fromDist.value + "%" } : { left: fromDist.value + "%" }))
const toHandleStyle = computed(() => (isVertical.value ? { bottom: toDist.value + "%" } : { left: toDist.value + "%" }))

defineExpose({ setFromValue, setToValue, getFromValue, getToValue })
</script>

<template>
    <div ref="rootEl" class="slider" :class="[orient, { 'has-tooltip': tooltip }]">
        <div ref="trackEl" class="track" @mousedown="onTrackMouseDown">
            <div v-if="progress" class="progress" :style="progressStyle"></div>
            <div class="handle from" :style="fromHandleStyle" @mousedown.stop="onHandleMouseDown('from')"></div>
            <div
                v-if="isDouble"
                class="handle to"
                :style="toHandleStyle"
                @mousedown.stop="onHandleMouseDown('to')"
            ></div>
        </div>
        <div v-if="tooltip" class="tooltip-track">
            <div
                ref="fromTooltipEl"
                class="tooltip"
                :class="[isVertical ? 'right' : 'top', fromTooltipClass]"
                :style="[fromTooltipStyle, { display: showTooltip ? '' : 'none' }]"
            >
                <div class="message">{{ fromMessage }}</div>
            </div>
            <div
                v-if="isDouble"
                ref="toTooltipEl"
                class="tooltip"
                :class="[isVertical ? 'right' : 'top', toTooltipClass]"
                :style="[toTooltipStyle, { display: showTooltip ? '' : 'none' }]"
            >
                <div class="message">{{ toMessage }}</div>
            </div>
        </div>
    </div>
</template>
