<script>
// 원본(dropdown.js)은 "동시에 하나만 열려있기" + "리스트 이외 영역 클릭 시 자동 닫힘" +
// "키보드 방향키로 열려있는 드롭다운 하나를 탐색"을 프로세스 전역(document/window 레벨
// 리스너 1개, 모든 ui.dropdown 인스턴스가 공유)으로 구현한다. Vue 버전도 동일하게
// 컴포넌트 인스턴스 밖의 모듈 스코프 상태로 구현해야 여러 Dropdown이 서로 올바르게
// 상호작용한다(하나가 열리면 이전에 열려있던 다른 Dropdown이 자동으로 닫히는 것 등).
let activeDropdown = null // 현재 열려 있는 드롭다운 인스턴스(최대 1개) — { hide, wheel }

function hideActive() {
    if (activeDropdown) activeDropdown.hide()
}

let globalListenersInstalled = false
function installGlobalListenersOnce() {
    if (globalListenersInstalled) return
    globalListenersInstalled = true

    document.addEventListener("click", (e) => {
        const tn = e.target.tagName
        if (tn !== "LI" && tn !== "INPUT" && tn !== "A" && tn !== "BUTTON" && tn !== "I") {
            hideActive()
        }
    })

    window.addEventListener("keydown", (e) => {
        if (activeDropdown) {
            activeDropdown.wheel(e.which, () => e.preventDefault())
        }
    })
}
</script>

<script setup>
// props.items가 주어지면 데이터 기반으로 <li>를 렌더링하고, 아니면 default 슬롯에 사용자가
// 작성한 <li> 마크업을 그대로 쓴다 — 어느 쪽이든 클릭/키보드 탐색은 ul에 이벤트 위임 1개로
// 동일하게 처리한다(원본이 $(...).find("li")로 마크업/데이터 렌더링 결과를 구분 없이 다루던
// 것과 같은 방식). 원본의 update(nodes) 메서드는 items를 reactive prop으로 바꾸는 것으로
// 대체했다(consumer가 items를 바꾸면 자동 반영 — Tab/Button items와 동일한 단순화).
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"

const props = defineProps({
    modelValue: { type: Boolean, default: false }, // 표시 여부(v-model)
    items: { type: Array, default: undefined }, // [{ value, text, disabled?, divider?, title? }]
    close: { type: Boolean, default: true }, // 항목 클릭 시 자동으로 닫힘
    keydown: { type: Boolean, default: false }, // 방향키로 탐색 가능
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
    anchor: { type: Boolean, default: false }, // 말풍선 꼬리 표시
    anchorRight: { type: Boolean, default: false },
    size: { type: String, default: "normal" }, // 'normal' | 'large'
    align: { type: String, default: "left" } // 'left' | 'right'
})

const emit = defineEmits(["update:modelValue", "change", "show", "hide", "click"])

const rootEl = ref(null)
const ulEl = ref(null)
const activeIndex = ref(-1)
const pos = ref({ left: props.left, top: props.top })

const rootStyle = computed(() => ({
    position: "absolute",
    display: props.modelValue ? "block" : "none",
    left: pos.value.left ? pos.value.left + "px" : undefined,
    top: pos.value.top ? pos.value.top + "px" : undefined,
    marginTop: props.anchor ? "10px" : undefined
}))

const menuStyle = computed(() => ({
    display: "block",
    width: props.width > 0 ? props.width + "px" : undefined,
    maxHeight: props.height > 0 ? props.height + "px" : undefined,
    overflow: props.height > 0 ? "auto" : undefined
}))

function isSelectable(li) {
    return li && !li.classList.contains("divider") && !li.classList.contains("title") && !li.classList.contains("disabled")
}

function onListClick(e) {
    const li = e.target.closest("li")
    if (!li || !ulEl.value || !ulEl.value.contains(li)) return
    if (!isSelectable(li)) return

    const index = Array.from(ulEl.value.children).indexOf(li)
    const text = li.textContent
    const value = li.getAttribute("value")

    emit("change", { index, value, text }, e)
    emit("click", { index, value, text }, e)

    if (props.close) hide()
    if (e.target.tagName === "A") e.preventDefault()
}

function onListMouseOver() {
    activeIndex.value = -1
}

watch(activeIndex, (idx) => {
    if (!ulEl.value) return
    Array.from(ulEl.value.children).forEach((li, i) => li.classList.toggle("active", i === idx))
    if (idx >= 0 && props.height > 0) {
        const li = ulEl.value.children[idx]
        if (li) ulEl.value.scrollTop = idx * li.offsetHeight
    }
})

function selectableCount() {
    return ulEl.value ? ulEl.value.children.length : 0
}

function wheel(key, callback) {
    if (!props.keydown) return

    if (key === 9) {
        // Tab
        hide()
        return
    }

    const count = selectableCount()
    if (count === 0) return

    if (key === 38 || key === -1) {
        // up — 선택 불가능한(divider/title/disabled) 항목은 건너뛴다
        let idx = activeIndex.value
        for (let tries = 0; tries < count; tries++) {
            idx = idx < 1 ? count - 1 : idx - 1
            if (isSelectable(ulEl.value.children[idx])) break
        }
        activeIndex.value = idx
        if (callback) callback()
    }

    if (key === 40 || key === 1) {
        // down
        let idx = activeIndex.value
        for (let tries = 0; tries < count; tries++) {
            idx = idx < count - 1 ? idx + 1 : 0
            if (isSelectable(ulEl.value.children[idx])) break
        }
        activeIndex.value = idx
        if (callback) callback()
    }

    if (key === 13 || key === 0 || !key) {
        // enter
        const li = ulEl.value.children[activeIndex.value]
        if (li) li.dispatchEvent(new MouseEvent("click", { bubbles: true }))
        activeIndex.value = -1
        if (callback) callback()
    }
}

function show(x, y) {
    hideActive()
    if (x !== undefined && y !== undefined) move(x, y)
    emit("update:modelValue", true)
}
function hide() {
    emit("update:modelValue", false)
}
function move(x, y) {
    pos.value = { left: x, top: y }
}

watch(
    () => props.modelValue,
    (v) => {
        if (v) {
            activeDropdown = { hide, wheel }
            emit("show")
        } else {
            if (activeDropdown && activeDropdown.hide === hide) activeDropdown = null
            activeIndex.value = -1
            emit("hide")
        }
    }
)

onMounted(() => {
    installGlobalListenersOnce()
})
onBeforeUnmount(() => {
    if (activeDropdown && activeDropdown.hide === hide) activeDropdown = null
})

defineExpose({ show, hide, move, wheel })
</script>

<template>
    <div ref="rootEl" class="dropdown" :class="[size, { right: align === 'right' }]" :style="rootStyle">
        <div v-if="anchor" class="anchor" :class="{ 'anchor-right': anchorRight }"></div>
        <ul ref="ulEl" :style="menuStyle" @click="onListClick" @mouseover="onListMouseOver">
            <template v-if="items">
                <li
                    v-for="(item, i) in items"
                    :key="i"
                    :value="item.value"
                    :class="{ divider: item.divider, title: item.title, disabled: item.disabled }"
                >
                    <a v-if="item.href !== undefined" :href="item.href">{{ item.text }}</a>
                    <template v-else>{{ item.text }}</template>
                </li>
            </template>
            <slot v-else />
        </ul>
    </div>
</template>
