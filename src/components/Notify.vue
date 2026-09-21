<script setup>
import { ref, computed } from "vue"

// 원본(notify.js)은 알림들을 담는 컨테이너 div를 만들고 그 안에 알림을 prepend(top-*)/
// append(bottom-*)하는 방식이었다. Vue 버전은 items 배열의 삽입 순서로 그걸 그대로 재현하고,
// 보이기/숨기기는 jQuery .animate()/.slideUp() 대신 CSS 트랜지션(Vue <TransitionGroup>)으로 처리한다.
// show 이벤트는 원본처럼 "보이기 애니메이션이 끝난 뒤"가 아니라 add() 호출 시점에 바로 emit한다
// (애니메이션 종료 콜백에 맞추려면 트랜지션 훅을 items 엔트리별로 추적해야 해서 배보다 배꼽이 큼).
// scrollTop 보정(스크롤 컨테이너 안에서 알림이 뷰포트에 붙어있게 하는 것)도 이번 포팅 범위 밖이다.
const props = defineProps({
    position: {
        type: String,
        default: "top-right" // top | top-left | top-right | bottom | bottom-left | bottom-right
    },
    padding: {
        // 숫자 또는 { top?, bottom?, left?, right? } 형태로 특정 방향만 오버라이드
        type: [Number, Object],
        default: 12
    },
    distance: {
        type: Number,
        default: 5
    },
    timeout: {
        type: Number,
        default: 3000
    },
    showDuration: {
        type: Number,
        default: 500
    },
    hideDuration: {
        type: Number,
        default: 500
    },
    showEasing: {
        // jQuery의 "swing" 근사치로 CSS ease를 쓴다
        type: String,
        default: "ease"
    },
    hideEasing: {
        type: String,
        default: "linear"
    }
})

const emit = defineEmits(["show", "hide", "select"])

const items = ref([])
let seq = 0

function isTop() {
    return props.position.indexOf("top") === 0
}

// 원본 paddingObj 테이블. 단, 원본의 bottom-left는 right까지 padding 값을 넣는 복붙 버그가 있어서
// (그러면 절대위치 left+right가 동시에 잡혀 폭이 늘어나버림, top-left와 대칭이 안 맞음) right: "auto"로 고쳤다.
const resolvedPos = computed(() => {
    const p = typeof props.padding === "number" ? props.padding : 12
    const table = {
        top: { top: p, bottom: "auto", left: p, right: p },
        "top-right": { top: p, bottom: "auto", left: "auto", right: p },
        "top-left": { top: p, bottom: "auto", left: p, right: "auto" },
        bottom: { top: "auto", bottom: p, left: p, right: p },
        "bottom-right": { top: "auto", bottom: p, left: "auto", right: p },
        "bottom-left": { top: "auto", bottom: p, left: p, right: "auto" }
    }
    let pos = table[props.position] ?? table["top-right"]
    if (typeof props.padding === "object") pos = { ...pos, ...props.padding }
    return pos
})

const containerStyle = computed(() => {
    const pos = resolvedPos.value
    const toCss = (v) => (v === "auto" ? "auto" : `${v}px`)
    return {
        position: "absolute",
        zIndex: 3000,
        top: toCss(pos.top),
        bottom: toCss(pos.bottom),
        left: toCss(pos.left),
        right: toCss(pos.right),
        display: "flex",
        flexDirection: "column",
        gap: `${props.distance}px`
    }
})

// 원본(notify.js)의 add()는 position이 "top"/"bottom"(가운데로 폭 전체를 쓰는 배치)일 때만
// 알림 하나하나에 $container.width() - (padding.right || DEF_PADDING) * 3 만큼의 outerWidth를
// 직접 박아넣는다 - 코너 배치(top-right 등)는 .notify의 고정폭(268px)을 그대로 쓴다.
function isCentered() {
    return props.position === "top" || props.position === "bottom"
}
const centerWidth = ref(null)
function measureCenterWidth() {
    if (!isCentered()) {
        centerWidth.value = null
        return
    }
    const pos = resolvedPos.value
    const left = typeof pos.left === "number" ? pos.left : 0
    const right = typeof pos.right === "number" ? pos.right : 0
    const containerWidth = document.body.clientWidth - left - right
    centerWidth.value = containerWidth - right * 3
}

const itemStyle = computed(() => ({
    transitionDuration: `${props.showDuration}ms, ${props.hideDuration}ms`,
    transitionTimingFunction: `${props.showEasing}, ${props.hideEasing}`,
    // 원본은 jQuery $alarm.outerWidth(containerWidth - padding.right*3)를 호출하는데, 실측해보니
    // (uiplay.jui.io) 이 값이 그대로 CSS width(content-box)로 들어가고 실제 렌더 폭은 거기에
    // padding/border가 더 얹어진 값이 된다 - "outerWidth 계산값 = 최종 렌더 폭"이 아니다. 그대로
    // width에 꽂아서 재현한다(box-sizing은 .notify의 기본값 content-box를 그대로 둔다).
    width: centerWidth.value !== null ? `${centerWidth.value}px` : undefined
}))

/** 원본 add(data, timeout) — 알림 하나를 추가하고 emit("show", data) */
function add(data, timeoutOverride) {
    measureCenterWidth()
    const id = ++seq
    const delay = typeof timeoutOverride === "number" && !Number.isNaN(timeoutOverride) ? timeoutOverride : props.timeout
    const entry = { id, data }

    if (isTop()) items.value.unshift(entry)
    else items.value.push(entry)

    emit("show", data)

    if (delay > 0) {
        setTimeout(() => removeItem(id), delay)
    }

    return id
}

function removeItem(id) {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx === -1) return
    const [removed] = items.value.splice(idx, 1)
    emit("hide", removed.data)
}

function onItemClick(entry, e) {
    emit("select", entry.data, e)
    removeItem(entry.id)
}

/** 원본 reset() — 모든 알림 제거 */
function reset() {
    items.value = []
}

defineExpose({ add, reset })
</script>

<template>
    <TransitionGroup tag="div" name="notify" :style="containerStyle">
        <div
            v-for="entry in items"
            :key="entry.id"
            class="notify"
            :class="entry.data.color"
            :style="itemStyle"
            @click="onItemClick(entry, $event)"
        >
            <div class="title">{{ entry.data.title }}</div>
            <div class="message">{{ entry.data.message }}</div>
        </div>
    </TransitionGroup>
</template>

<style scoped>
.notify-enter-active,
.notify-leave-active {
    transition-property: opacity;
}
.notify-enter-from {
    opacity: 0;
}
.notify-leave-to {
    opacity: 0;
}
.notify-leave-active {
    position: absolute;
}
</style>
