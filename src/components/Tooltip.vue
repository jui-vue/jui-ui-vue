<script setup>
import { ref, computed, watch, nextTick } from "vue"

// 원본(tooltip.js)은 body에 절대좌표(getBoundingClientRect 기반)로 툴팁을 붙였다.
// Vue 버전은 트리거를 감싸는 wrapper를 position:relative로 두고 CSS만으로 4방향에 붙인다
// (Tab 메뉴/AutoComplete 드롭다운과 같은 패턴) — 레이아웃이 바뀌어도 재계산이 필요 없어 더 견고하다.
// 커스텀 마크업(원본 예시의 popover 템플릿 같은 것)은 문자열 템플릿 대신 #tooltip 슬롯으로 대체한다.
const props = defineProps({
    text: {
        // 원본의 title 속성/opts.title에 대응하는 툴팁 내용
        type: String,
        default: ""
    },
    position: {
        type: String,
        default: "top" // top | bottom | left | right
    },
    color: {
        type: String,
        default: null
    },
    width: {
        type: Number,
        default: 150
    },
    align: {
        type: String,
        default: "left" // left | right | center
    },
    delay: {
        type: Number,
        default: 0
    },
    showType: {
        type: String,
        default: "mouseover" // mouseover | click
    },
    hideType: {
        type: String,
        default: "mouseout" // mouseout | click
    }
})

const emit = defineEmits(["show", "hide"])

// 원본 update(newTitle)로 프로그래매틱하게 바꿀 수 있어서(ButtonGroup/AutoComplete와 동일한 이유로)
// text는 prop을 초기값으로 삼는 내부 상태로 관리한다.
const internalText = ref(props.text)
watch(
    () => props.text,
    (v) => {
        internalText.value = v
    }
)

const visible = ref(false)
const bubbleRef = ref(null)
// position prop대로 뒀을 때 뷰포트 밖으로 나가 완전히 안 보이는 경우를 위한 폴백 - 트리거가
// 뷰포트 가장자리에 붙어있으면("top"인데 위쪽 공간이 아예 없는 경우 등) 실제로 재현됨(예:
// tooltip_1 데모의 "Top" 버튼은 페이지 맨 위에 있어 위로 띄우면 전부 화면 밖으로 나간다).
// 원본(tooltip.js)은 좌표를 1px로 clamp하는데, 그러면 대신 트리거 자체와 겹쳐서 깜빡이는
// 버그가 생긴다(겹친 툴팁이 커서를 가려 mouseout이 발동) - 겹치지 않고 반대쪽으로 뒤집는다.
const effectivePosition = ref(props.position)
let timer = null

function adjustForViewport() {
    const el = bubbleRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    // 살짝 걸치는 정도(서브픽셀~몇 px)로는 뒤집지 않는다 - 절반 넘게 잘려서 사실상 안 보일
    // 때만 반대쪽으로 옮긴다("Left"가 뷰포트 경계에 1px 못 미치게 겹친다고 "Right"로 바뀌어
    // 버리면, 요청하지도 않은 위치 변경이 된다).
    if (effectivePosition.value === "top" && rect.top < -rect.height / 2) effectivePosition.value = "bottom"
    else if (effectivePosition.value === "bottom" && rect.bottom > window.innerHeight + rect.height / 2) effectivePosition.value = "top"
    else if (effectivePosition.value === "left" && rect.left < -rect.width / 2) effectivePosition.value = "right"
    else if (effectivePosition.value === "right" && rect.right > window.innerWidth + rect.width / 2) effectivePosition.value = "left"
}

async function doShow(e) {
    if (internalText.value === "") return
    effectivePosition.value = props.position
    visible.value = true
    emit("show", e)
    await nextTick()
    adjustForViewport()
}

function doHide(e) {
    clearTimeout(timer)
    timer = null
    if (visible.value) {
        visible.value = false
        emit("hide", e)
    }
}

function onShowTrigger(e) {
    if (timer == null) {
        timer = setTimeout(() => doShow(e), props.delay)
    } else if (props.showType === props.hideType) {
        doHide(e)
    }
}

function onHideTrigger(e) {
    doHide(e)
}

// showType/hideType은 mouseover/mouseout/click 같은 네이티브 DOM 이벤트명을 그대로 쓴다.
const triggerHandlers = computed(() => {
    const handlers = { [props.showType]: onShowTrigger }
    if (props.showType !== props.hideType) {
        handlers[props.hideType] = onHideTrigger
    }
    return handlers
})

/** 원본 update(newTitle) — 툴팁 내용을 프로그래매틱하게 교체 */
function update(newText) {
    internalText.value = newText
}

defineExpose({ update })
</script>

<template>
    <span class="tooltip-trigger" style="position: relative; display: inline-block;" v-on="triggerHandlers">
        <slot />
        <div
            v-if="visible"
            ref="bubbleRef"
            class="tooltip"
            :class="effectivePosition"
            :style="{
                // width:max-content가 없으면, 이 박스의 containing block(트리거 span, 보통 아주 좁음)
                // 기준으로 left:50% 지점부터 남는 공간만으로 shrink-to-fit 폭을 계산해버려서
                // 글자 수만큼 세로로 쪼개지는 버그가 있었다(폭이 몇 px로 찌그러짐).
                width: 'max-content',
                maxWidth: `${width}px`,
                textAlign: align,
                backgroundColor: color || undefined,
                ...({
                    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
                    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)' },
                    left: { right: '100%', top: '50%', transform: 'translateY(-50%)' },
                    right: { left: '100%', top: '50%', transform: 'translateY(-50%)' }
                }[effectivePosition])
            }"
        >
            <div class="anchor"></div>
            <slot name="tooltip">
                <div class="message" :style="{ backgroundColor: color || undefined }">{{ internalText }}</div>
            </slot>
        </div>
    </span>
</template>
