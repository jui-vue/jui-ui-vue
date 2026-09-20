<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, markRaw, nextTick } from "vue"

// 원본처럼 컴포넌트가 탭 목록을 직접 들고 있다가(localItems), 아래 defineExpose로
// update/insert/append/prepend/remove/move/enable/disable/show/activeIndex 메서드를 제공한다.
// items prop은 "초기값 + 외부에서 통째로 교체할 때"만 쓰고, 그 외 변경은 메서드로 한다.
//
// 탭 콘텐츠 연결 방식(둘 다 지원, item.content가 있으면 그쪽이 우선):
//   1) 정적으로 미리 아는 탭 → 부모 템플릿에 #panel-{value} 슬롯을 선언 (value 기준이라 순서가
//      바뀌어도 깨지지 않는다 — index 기준이면 move/insert 때 콘텐츠가 엉뚱한 탭에 붙는다)
//   2) append()/insert() 등으로 동적으로 추가하는 탭 → 슬롯을 미리 선언해둘 수 없으므로,
//      node에 content로 실제 컴포넌트(또는 렌더 함수)를 실어 보낸다. <component :is="item.content">
//      로 렌더링하므로, 그 자리에서 동적으로 만든 컴포넌트/템플릿을 그대로 지정할 수 있다.
const props = defineProps({
    items: {
        // { text, value, disabled?, content?, contentProps? }
        type: Array,
        required: true
    },
    modelValue: {
        // 활성 탭의 index
        type: Number,
        default: 0
    },
    position: {
        type: String,
        default: "top" // top | bottom
    },
    variant: {
        // examples/tab.html 의 .tab / .pill 두 스타일과 동일
        type: String,
        default: "tab" // "tab" | "pill"
    },
    drag: {
        // 원본 opts.drag — 마우스로 끌어서 탭 순서 재정렬
        type: Boolean,
        default: false
    },
    menu: {
        // 원본 tpl.menu 오버플로우 드롭다운에 대응. [{ text, value, divider? }]
        // 주어지면 탭 목록 끝에 "Menu" 항목이 추가된다.
        type: Array,
        default: undefined
    }
})

const emit = defineEmits([
    "update:modelValue",
    "update:items",
    "change",
    "click",
    "dragstart",
    "dragend",
    "menu",
    "changemenu"
])

// item 객체를 얕은 복사해서 들고 있는다 — enable/disable 등이 부모가 넘긴 원본 객체를
// 직접 mutate하지 않도록 하기 위함(props는 mutate하면 안 되므로).
// content(컴포넌트 정의)는 markRaw로 감싸서 반응형 프록시 대상에서 제외한다 —
// 안 그러면 Vue가 컴포넌트 객체 자체를 reactive()로 감싸려다 경고를 낸다.
function normalizeItem(item) {
    return item.content ? { ...item, content: markRaw(item.content) } : { ...item }
}

const localItems = ref(props.items.map(normalizeItem))
watch(
    () => props.items,
    (next) => {
        localItems.value = next.map(normalizeItem)
    }
)

function syncItems() {
    emit("update:items", localItems.value.slice())
}

// 원본 setActiveNode()와 동일한 안전장치 — modelValue가 가리키는 탭이 disabled면
// (또는 범위를 벗어나면) 첫 번째로 활성화 가능한 탭으로 자동 폴백한다.
// 렌더링은 항상 이 값을 기준으로 해서, 부모에게 보정값을 emit하는 왕복 없이 바로 맞는 화면을 그린다.
const effectiveIndex = computed(() => {
    const current = localItems.value[props.modelValue]
    if (current && !current.disabled) return props.modelValue

    const fallback = localItems.value.findIndex((item) => !item.disabled)
    return fallback === -1 ? props.modelValue : fallback
})
watch(
    effectiveIndex,
    (idx) => {
        if (idx !== props.modelValue) emit("update:modelValue", idx)
    },
    { immediate: true }
)

const suppressClick = ref(false)

// change/click 핸들러가 alert()처럼 동기적으로 화면을 멈추는 경우에도, 탭이 이미 전환된
// 상태로 "보이도록" 한다(원본은 jQuery로 DOM을 동기 조작한 뒤에 emit했지만, Vue는
// 리렌더링이 비동기라 순서를 맞춰줘야 한다).
// - nextTick(): Vue가 실제 DOM을 패치할 때까지 기다린다 (여기까지만 하면 DOM은 맞지만
//   브라우저가 그걸 화면에 "그리기" 전에 alert()이 열려버릴 수 있다)
// - requestAnimationFrame을 두 번 연속: 첫 rAF는 "다음 프레임이 그려지기 직전"에
//   불려서 아직 페인트 전이고, 그 안에서 또 rAF를 걸어야 그 프레임의 페인트가 끝난
//   뒤(두 번째 rAF)에야 실행된다 — 한 번만 기다리면(홑 rAF) 페인트 전에 alert()이
//   열려서 소용없었다.
function waitForPaint() {
    return nextTick().then(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    )
}

async function selectTab(index, item, e) {
    if (suppressClick.value || item.disabled || index === effectiveIndex.value) return

    emit("update:modelValue", index)
    await waitForPaint()
    emit("change", { index, item }, e)
    emit("click", { index, item }, e)
}

function reorder(fromIndex, toIndex) {
    if (fromIndex === toIndex) return

    const next = localItems.value.slice()
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    localItems.value = next

    // 옮긴 탭이 활성 탭이었다면 활성 인덱스도 새 위치를 따라간다.
    // (원본은 activeIndex를 targetIndex로 무조건 고정시키는데, 여기서는 실제로 옮긴 탭을
    //  기준으로 따라가게 해 어떤 탭을 옮기든 선택 상태가 예측 가능하게 유지되도록 했다.)
    if (effectiveIndex.value === fromIndex) {
        emit("update:modelValue", toIndex)
    }

    syncItems()
}

// --- 마우스 드래그 재정렬 ---
const dragIndex = ref(null)

function onDragStart(index, e) {
    if (!props.drag) return

    dragIndex.value = index
    emit("dragstart", index, e)
}

function onDragEnter(targetIndex) {
    if (dragIndex.value === null || dragIndex.value === targetIndex) return

    suppressClick.value = true
    reorder(dragIndex.value, targetIndex)
    dragIndex.value = targetIndex
}

function onDragEnd(e) {
    if (dragIndex.value === null) return

    emit("dragend", dragIndex.value, e)
    dragIndex.value = null

    // 드래그로 재정렬된 직후 동일 tick에 따라오는 click(selectTab)을 한 프레임 눌러둔다.
    requestAnimationFrame(() => {
        suppressClick.value = false
    })
}

// --- 오버플로우 메뉴(드롭다운) ---
const menuOpen = ref(false)
const tabRoot = ref(null)

function onMenuClick(e) {
    emit("menu", { text: "menu" }, e)
    menuOpen.value = !menuOpen.value
}

function onMenuItemClick(menuItem, index, e) {
    if (menuItem.divider) return

    menuOpen.value = false
    emit("changemenu", { index, value: menuItem.value, text: menuItem.text }, e)
}

function onDocumentClick(e) {
    if (menuOpen.value && tabRoot.value && !tabRoot.value.contains(e.target)) {
        menuOpen.value = false
    }
}

// setup() 최상위에서 바로 document를 참조하면 SSR(예: Nuxt) 환경에서 document가 없어 크래시난다 —
// onMounted 안에서만(브라우저에서만 실행됨을 보장) 등록한다.
onMounted(() => document.addEventListener("click", onDocumentClick))
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick))

// --- 원본 API와 동일한 명령형 메서드들 (템플릿 ref로 받아서 호출) ---

/** 원본 update(nodes) — 탭 목록을 통째로 교체. node = { text, value, disabled?, content?, contentProps? } */
function update(nodes) {
    localItems.value = nodes.map(normalizeItem)
    syncItems()
}

/** 원본 insert(index, node) — 지정 위치에 탭 추가 */
function insert(index, node) {
    const next = localItems.value.slice()
    next.splice(index, 0, normalizeItem(node))
    localItems.value = next
    syncItems()
}

/** 원본 append(node) — 맨 뒤에 탭 추가. 슬롯을 미리 못 선언하니 node.content로 컴포넌트를 실어 보내면 된다 */
function append(node) {
    localItems.value = [...localItems.value, normalizeItem(node)]
    syncItems()
}

/** 원본 prepend(node) — 맨 앞에 탭 추가 */
function prepend(node) {
    localItems.value = [normalizeItem(node), ...localItems.value]
    syncItems()
}

/** 원본 remove(index) — 지정 인덱스의 탭 제거 */
function remove(index) {
    const next = localItems.value.slice()
    next.splice(index, 1)
    localItems.value = next
    syncItems()
}

/** 원본 move(index, targetIndex) — 탭 위치 변경(드래그와 동일 로직, 이벤트는 emit하지 않음) */
function move(index, targetIndex) {
    reorder(index, targetIndex)
}

/** 원본 show(index) — 프로그래매틱하게 탭 활성화(click과 달리 change만 emit) */
async function show(index) {
    const item = localItems.value[index]
    if (!item || item.disabled || index === effectiveIndex.value) return

    emit("update:modelValue", index)
    await waitForPaint() // selectTab과 동일한 이유
    emit("change", { index, item })
}

/** 원본 enable(index) — 비활성 탭을 다시 활성화 가능하게 전환 */
function enable(index) {
    if (index === effectiveIndex.value || !localItems.value[index]) return
    localItems.value[index].disabled = false
    syncItems()
}

/** 원본 disable(index) — 탭을 비활성화(현재 선택된 탭은 비활성화 불가) */
function disable(index) {
    if (index === effectiveIndex.value || !localItems.value[index]) return
    localItems.value[index].disabled = true
    syncItems()
}

/** 원본 activeIndex() — 현재 활성 탭의 인덱스(disabled 폴백 반영된 실제 값) */
function activeIndex() {
    return effectiveIndex.value
}

defineExpose({ update, insert, append, prepend, remove, move, show, enable, disable, activeIndex })
</script>

<template>
    <div ref="tabRoot" class="jui-tab" @mouseup="onDragEnd">
        <ul :class="[variant, position]" :style="{ order: position === 'bottom' ? 2 : 1 }">
            <li
                v-for="(item, index) in localItems"
                :key="item.value ?? index"
                :class="{ active: index === effectiveIndex, disabled: item.disabled }"
                @click="selectTab(index, item, $event)"
                @mousedown="onDragStart(index, $event)"
                @mouseenter="onDragEnter(index)"
            >
                <a href="javascript:void(0)">{{ item.text }}</a>
            </li>
            <li v-if="menu && menu.length" class="menu" :class="{ checked: menuOpen }" @click="onMenuClick">
                <a href="javascript:void(0)">Menu <i class="icon-arrow1"></i></a>
                <div v-if="menuOpen" class="dropdown" style="display: block; left: 0; top: 100%;">
                    <div class="anchor"></div>
                    <ul style="position: static; min-width: 150px; white-space: nowrap;">
                        <li
                            v-for="(m, i) in menu"
                            :key="m.value ?? i"
                            :class="{ divider: m.divider }"
                            @click.stop="onMenuItemClick(m, i, $event)"
                        ><i v-if="m.icon" :class="`icon-${m.icon}`"></i>{{ m.divider ? "" : (m.icon ? " " : "") + m.text }}</li>
                    </ul>
                </div>
            </li>
        </ul>
        <div class="jui-tab-content" :style="{ order: position === 'bottom' ? 1 : 2 }">
            <div v-for="(item, idx) in localItems" v-show="idx === effectiveIndex" :key="item.value ?? idx">
                <component
                    :is="item.content"
                    v-if="typeof item.content === 'object' || typeof item.content === 'function'"
                    v-bind="item.contentProps"
                />
                <slot v-else :name="`panel-${item.value}`" :item="item" :index="idx" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.jui-tab {
    display: flex;
    flex-direction: column;
}
.jui-tab .menu {
    position: relative;
}
</style>
