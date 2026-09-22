<script setup>
// 원본(colorpicker.js)은 jui.include("util.color")(juijs 코어의 색상 유틸)에 의존한다 —
// 이제 같은 유틸을 그대로 포팅한 jui-core-ts에서 가져와 쓴다(예전엔 이 리포에
// vendoring 안 돼 있어서 ../utils/color.js에 독자적으로 재구현했었음).
// 드래그 좌표계(사각형/hue바/opacity바의 픽셀 위치 → HSV → RGB 계산)는 원본의
// setMainColor/setHueColor/setOpacity/calculateColor 알고리즘을 그대로 옮겼다.
// 원본은 마크업 전체를 JS로 생성했지만(selectDom 헬퍼로 30개 가까운 div/input을 직접
// append), Vue 버전은 동일한 DOM 구조를 <template>으로 선언적으로 작성한다(스타일이
// 정확한 클래스/중첩 구조에 의존하므로 구조 자체는 원본과 동일하게 유지).
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { rgb as parseRgb, format as formatRgb, HSVtoRGB, RGBtoHSV, scale } from "jui-core-ts"

// hex 출력은 이 컴포넌트의 기존 UI 규약(소문자)을 유지한다 - jui-core-ts의 format()은
// 원본 jui-core 그대로 대문자 hex를 반환하므로(#FFFFFF) 여기서만 소문자로 맞춘다.
// rgb()/rgba() 출력은 원래 소문자라 toLowerCase()가 영향 없음.
function formatColor(color, type) {
    return formatRgb(color, type).toLowerCase()
}

const SIZE = {
    colorWidth: 226,
    colorHeight: 145,
    hueWidth: 157,
    opacityWidth: 119,
    dragBarWidth: 12,
    opacityDragBarWidth: 12
}

const HUE_STOPS = [
    { rgb: "#ff0000", start: 0 },
    { rgb: "#ffff00", start: 0.17 },
    { rgb: "#00ff00", start: 0.33 },
    { rgb: "#00ffff", start: 0.5 },
    { rgb: "#0000ff", start: 0.67 },
    { rgb: "#ff00ff", start: 0.83 },
    { rgb: "#ff0000", start: 1 }
]

function checkHueColor(p) {
    let startColor, endColor
    for (let i = 0; i < HUE_STOPS.length; i++) {
        if (HUE_STOPS[i].start >= p) {
            startColor = HUE_STOPS[i - 1]
            endColor = HUE_STOPS[i]
            break
        }
    }
    if (startColor && endColor) {
        const colorScale = scale().domain(startColor.rgb, endColor.rgb)
        return colorScale((p - startColor.start) / (endColor.start - startColor.start), "hex").toLowerCase()
    }
    return null
}

const props = defineProps({
    modelValue: { type: String, default: "#FF0000" } // v-model — hex 또는 rgba() 문자열
})
const emit = defineEmits(["update:modelValue", "change", "enter"])

const colorEl = ref(null)
const hueContainerEl = ref(null)
const opacityEl = ref(null) // 원본이 setOpacity()에서 $opacity(패딩 포함 바깥 div) 기준으로
// offset().left를 재는 것과 동일하게 맞추기 위한 ref — .container가 아니라 .opacity 자체.

const dragPos = ref({ x: 0, y: 0 }) // 사각형 내부 픽셀 좌표
const huePos = ref({ x: 0 })
const opacityPos = ref({ x: 0 })
const hueBg = ref(props.modelValue) // .color 사각형의 배경색(순수 hue만 반영, 드래그로 갱신)

const hexInput = ref("")
const rInput = ref("")
const gInput = ref("")
const bInput = ref("")
const opacityText = ref("100%")
const controlColorBg = ref(props.modelValue)

function calculateOpacity() {
    return Math.round((opacityPos.value.x / SIZE.opacityWidth) * 100) / 100
}

function calculateColor() {
    const h = (huePos.value.x / SIZE.hueWidth) * 360
    const s = dragPos.value.x / SIZE.colorWidth
    const v = (SIZE.colorHeight - dragPos.value.y) / SIZE.colorHeight
    const rgb = HSVtoRGB(h, s, v)
    rgb.a = calculateOpacity()
    return rgb
}

function getColor(type) {
    const rgb = calculateColor()
    if (type) {
        if (type === "hex" && rgb.a < 1) type = "rgb"
        return formatColor(rgb, type)
    }
    return rgb
}

function setInputColor(evtType) {
    let rgb
    if (evtType === "hex") {
        rgb = parseRgb(hexInput.value)
        rInput.value = String(rgb.r)
        gInput.value = String(rgb.g)
        bInput.value = String(rgb.b)
    } else if (evtType === "rgb") {
        hexInput.value = formatColor(
            { r: parseInt(rInput.value, 10) || 0, g: parseInt(gInput.value, 10) || 0, b: parseInt(bInput.value, 10) || 0 },
            "hex"
        )
        rgb = parseRgb(hexInput.value)
    } else {
        const str = getColor("hex")
        hexInput.value = str
        rgb = parseRgb(hexInput.value)
        rInput.value = String(rgb.r)
        gInput.value = String(rgb.g)
        bInput.value = String(rgb.b)
    }

    rgb.a = calculateOpacity()
    controlColorBg.value = formatColor(rgb, "hex")
    opacityText.value = Math.floor(rgb.a * 100) + "%"

    const out = rgb.a < 1 ? formatColor(rgb, "rgb") : formatColor(rgb, "hex")
    emit("update:modelValue", out)
    emit("change", out, rgb)
}

function initColor(newColor, evtType) {
    const c = newColor || props.modelValue
    const rgb = parseRgb(c)

    hueBg.value = c

    const hsv = RGBtoHSV(rgb.r, rgb.g, rgb.b)
    dragPos.value = { x: SIZE.colorWidth * hsv.s, y: SIZE.colorHeight * (1 - hsv.v) }
    huePos.value = { x: SIZE.hueWidth * (hsv.h / 360) }
    opacityPos.value = { x: SIZE.opacityWidth * (rgb.a || 0) }

    setInputColor(evtType)
}

// ---- 드래그 처리 ----
const dragging = ref(null) // 'color' | 'hue' | 'opacity' | null

function setMainColor(e) {
    const rect = colorEl.value.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    if (x < 0) x = 0
    else if (x > SIZE.colorWidth) x = SIZE.colorWidth
    if (y < 0) y = 0
    else if (y > SIZE.colorHeight) y = SIZE.colorHeight

    dragPos.value = { x, y }
    setInputColor()
}

function setHueColor(e) {
    const min = hueContainerEl.value.getBoundingClientRect().left
    const max = min + SIZE.hueWidth
    let dist
    if (e.clientX < min) dist = 0
    else if (e.clientX > max) dist = 100
    else dist = ((e.clientX - min) / (max - min)) * 100

    huePos.value = { x: SIZE.hueWidth * (dist / 100) }
    hueBg.value = checkHueColor(dist / 100)
    setInputColor()
}

function setOpacity(e) {
    const min = opacityEl.value.getBoundingClientRect().left
    const max = min + SIZE.opacityWidth
    let dist
    if (e.clientX < min) dist = 0
    else if (e.clientX > max) dist = 100
    else dist = ((e.clientX - min) / (max - min)) * 100

    opacityPos.value = { x: SIZE.opacityWidth * (dist / 100) }
    setInputColor()
}

function onColorMouseDown(e) {
    dragging.value = "color"
    setMainColor(e)
}
function onHueContainerMouseDown(e) {
    dragging.value = "hue"
    setHueColor(e)
}
function onOpacityContainerMouseDown(e) {
    dragging.value = "opacity"
    setOpacity(e)
}
function onDragBarMouseDown(e) {
    e.preventDefault()
    dragging.value = "hue"
}
function onOpacityDragBarMouseDown(e) {
    e.preventDefault()
    dragging.value = "opacity"
}
function onDocMouseMove(e) {
    if (dragging.value === "color") setMainColor(e)
    else if (dragging.value === "hue") setHueColor(e)
    else if (dragging.value === "opacity") setOpacity(e)
}
function onDocMouseUp() {
    dragging.value = null
}

onMounted(() => {
    document.addEventListener("mousemove", onDocMouseMove)
    document.addEventListener("mouseup", onDocMouseUp)
    initColor(props.modelValue)
})
onBeforeUnmount(() => {
    document.removeEventListener("mousemove", onDocMouseMove)
    document.removeEventListener("mouseup", onDocMouseUp)
})

// ---- 텍스트 입력(HEX/R/G/B) ----
function checkNumberKey(e) {
    const code = e.which
    const isExcept = code === 37 || code === 39 || code === 8 || code === 46 || code === 9
    if (!isExcept && (code < 48 || code > 57)) e.preventDefault()
}
function onHexKeydown(e) {
    if (e.which < 65 || e.which > 70) checkNumberKey(e)
}
function onHexKeyup(e) {
    if (e.which === 13) {
        const code = hexInput.value
        if (code.charAt(0) === "#" && (code.length === 7 || code.length === 4)) {
            initColor(code, "hex")
            emit("enter", code, parseRgb(code))
        }
    }
}
function onRgbKeyup() {
    const clampByte = (v) => (v === "" ? v : String(Math.min(255, parseInt(v, 10) || 0)))
    rInput.value = clampByte(rInput.value)
    gInput.value = clampByte(gInput.value)
    bInput.value = clampByte(bInput.value)
    if (rInput.value === "" || gInput.value === "" || bInput.value === "") return

    initColor(
        formatColor({ r: parseInt(rInput.value, 10), g: parseInt(gInput.value, 10), b: parseInt(bInput.value, 10) }, "hex"),
        "rgb"
    )
}

// 원본의 opts.color는 초기값으로만 쓰이고 이후 재반영되지 않는다(반응형 감시 없음) —
// modelValue 이후 변경은 setColor() 노출 메서드나 내부 상호작용으로만 반영된다.

// ---- 스타일 ----
const dragPointerStyle = computed(() => ({ left: dragPos.value.x - 5 + "px", top: dragPos.value.y - 5 + "px" }))
const dragBarStyle = computed(() => ({ left: huePos.value.x - Math.ceil(SIZE.dragBarWidth / 2) + "px" }))
const opacityDragBarStyle = computed(() => ({
    left: opacityPos.value.x - Math.ceil(SIZE.opacityDragBarWidth / 2) + "px"
}))
const colorBgStyle = computed(() => ({ backgroundColor: hueBg.value }))
// 원본 CSS에 정의만 되어 있고 어디에도 쓰이지 않던 .opacity_gradient() 믹스인을 실제로 적용한다 -
// 불투명도 바를 현재 색조에서 투명까지 흐르는 그라데이션으로 보여줘서 어떤 값인지 미리보기가
// 되도록(빈 회색 막대 뒤로는 .container의 체크무늬 배경이 비쳐 보인다).
const opacityBarStyle = computed(() => ({ backgroundImage: `linear-gradient(to right, transparent, ${hueBg.value})` }))
const controlColorStyle = computed(() => ({ backgroundColor: controlColorBg.value }))

function setColor(value) {
    if (typeof value === "object" && value !== null) {
        if (!value.r || !value.g || !value.b) return
        initColor(formatColor(value, "hex"))
    } else if (typeof value === "string") {
        if (value.charAt(0) !== "#") return
        initColor(value)
    }
}

defineExpose({ setColor, getColor })
</script>

<template>
    <div class="colorpicker">
        <div ref="colorEl" class="color" :style="colorBgStyle" @mousedown="onColorMouseDown">
            <div class="saturation">
                <div class="value">
                    <div class="drag-pointer" :style="dragPointerStyle"></div>
                </div>
            </div>
        </div>

        <div class="control">
            <div class="hue">
                <div ref="hueContainerEl" class="container" @mousedown="onHueContainerMouseDown">
                    <div class="drag-bar" :style="dragBarStyle" @mousedown="onDragBarMouseDown"></div>
                </div>
            </div>
            <div ref="opacityEl" class="opacity">
                <div class="container" @mousedown="onOpacityContainerMouseDown">
                    <div class="gradient" :style="opacityBarStyle"></div>
                    <div class="drag-bar2" :style="opacityDragBarStyle" @mousedown="onOpacityDragBarMouseDown"></div>
                </div>
            </div>
            <input class="input" type="text" disabled :value="opacityText" />
            <div class="empty"></div>
            <div class="color" :style="controlColorStyle"></div>
        </div>

        <div class="information">
            <input v-model="hexInput" class="input" type="text" maxlength="7" @keydown="onHexKeydown" @keyup="onHexKeyup" />
            <input v-model="rInput" class="input" type="text" maxlength="3" @keydown="checkNumberKey" @keyup="onRgbKeyup" />
            <input v-model="gInput" class="input" type="text" maxlength="3" @keydown="checkNumberKey" @keyup="onRgbKeyup" />
            <input v-model="bInput" class="input" type="text" maxlength="3" @keydown="checkNumberKey" @keyup="onRgbKeyup" />
            <div class="title">HEX</div>
            <div class="title">R</div>
            <div class="title">G</div>
            <div class="title">B</div>
        </div>
    </div>
</template>
