<script setup>
import { ref, computed, watch } from "vue"

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
let timer = null

function doShow(e) {
    if (internalText.value === "") return
    visible.value = true
    emit("show", e)
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
            class="tooltip"
            :class="position"
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
                }[position])
            }"
        >
            <div class="anchor"></div>
            <slot name="tooltip">
                <div class="message" :style="{ backgroundColor: color || undefined }">{{ internalText }}</div>
            </slot>
        </div>
    </span>
</template>
