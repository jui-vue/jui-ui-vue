<script setup>
// 원본(property.js)은 렌더러(renderer.text/select/number/range/checkbox/switch/date/
// color/colors/property/html/textarea)마다 마크업을 직접 jQuery로 조립했고, switch/
// datepicker/colorpicker 타입은 jui.create()로 각 컴포넌트를 재활용했다. Vue 버전도 동일한
// 재사용 전략을 쓴다 — Switch.vue/Datepicker.vue/Colorpicker.vue를 그대로 가져다 쓰고,
// property 타입은 이 컴포넌트 자신을 재귀적으로 사용한다(Vue SFC는 파일명 기준으로
// 자기 자신을 자동 등록하므로 별도 설정 없이 <Property> 재귀 참조가 가능하다).
// 원본은 items를 DOM에 직접 그려 넣고(jQuery), 그룹 접기/펼치기도 이후 형제 DOM 노드를
// while로 순회하며 show/hide 했다 — Vue 버전은 "각 행이 속한 그룹"을 미리 계산해두고
// collapsedGroups(Set)에 따라 v-show로 표시 여부만 반응형으로 바꾼다.
import { reactive, ref, computed } from "vue"
import Switch from "./Switch.vue"
import Datepicker from "./Datepicker.vue"
import Colorpicker from "./Colorpicker.vue"

const props = defineProps({
    items: { type: Array, default: () => [] }
})
const emit = defineEmits(["change", "load-items"])

function debounce(fn, wait) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), wait)
    }
}

const localItems = reactive([])
const collapsedGroups = ref(new Set())
const nestedPropertyRefs = ref({}) // index -> 중첩 Property 인스턴스(nested의 getAllValue 조회용)

function loadItems(newItems) {
    localItems.splice(
        0,
        localItems.length,
        ...(newItems || []).map((it) => {
            const item = { ...it }
            // 원본: renderer.date는 초기 표시 텍스트를 $valueText.html(datepicker.getDate())로
            // 채운다 — item.value가 없으면(날짜를 아직 안 골랐으면) datepicker 컴포넌트의 기본값인
            // "오늘"이 Date 객체 그대로(toString()) 표시된다(선택 후에는 포맷된 문자열로 바뀜).
            if (item.type === "date" && !item.value) item.value = String(new Date())
            return item
        })
    )
    collapsedGroups.value = new Set()
    emit("load-items")
}
loadItems(props.items)

function addItem(item) {
    const arr = Array.isArray(item) ? item : [item]
    localItems.push(...arr.map((it) => ({ ...it })))
}

function removeItem(item) {
    const idx = localItems.findIndex((it) => it.key === item.key || it.title === item.title)
    if (idx >= 0) localItems.splice(idx, 1)
}

// 각 행(row)이 속한 그룹의 인덱스(그 그룹이 접히면 이 행도 숨는다) — 그룹 자신과, 어떤
// 그룹보다도 앞에 있는 행은 항상 보인다.
const rowGroupIndex = computed(() => {
    let current = null
    return localItems.map((item, i) => {
        if (item.type === "group") {
            current = i
            return null
        }
        return current
    })
})
function isVisible(i) {
    const g = rowGroupIndex.value[i]
    return g === null || !collapsedGroups.value.has(g)
}

function getGroupList() {
    return localItems
        .map((it, i) => ({ item: it, index: i }))
        .filter((x) => x.item.type === "group")
        .map((x) => ({ name: x.item.title, id: x.index }))
}

function collapsed(index) {
    const next = new Set(collapsedGroups.value)
    next.add(index)
    collapsedGroups.value = next
}
function expanded(index) {
    const next = new Set(collapsedGroups.value)
    next.delete(index)
    collapsedGroups.value = next
}
function toggleGroup(index) {
    if (collapsedGroups.value.has(index)) expanded(index)
    else collapsed(index)
}

function findIndexByKey(key) {
    return localItems.findIndex((it) => it.key === key)
}
function getItem(keyOrIndex) {
    if (typeof keyOrIndex === "number") return localItems[keyOrIndex]
    return localItems[findIndexByKey(keyOrIndex)]
}

function refreshValue(index, newValue) {
    const item = localItems[index]
    if (!item) return
    const oldValue = item.value
    item.value = newValue
    emit("change", item, newValue, oldValue)
}

function updateValue(key, value) {
    const index = findIndexByKey(key)
    if (index < 0) return
    refreshValue(index, value)
}

function getValue(key) {
    if (key) return getItem(key)?.value
    return getAllValue()
}
function getAllValue() {
    const result = {}
    localItems.forEach((item) => {
        if (item.type !== "group") result[item.key] = item.value
    })
    return result
}
function setValue(obj) {
    obj = obj || {}
    Object.keys(obj).forEach((key) => updateValue(key, obj[key]))
}
function initValue(obj) {
    localItems.forEach((item) => (item.value = ""))
    if (obj) setValue(obj)
}

const debouncedText = debounce((index, value) => refreshValue(index, value), 250)
const debouncedCheckbox = debounce((index, value) => refreshValue(index, value), 100)

function str2array(value, splitter = ",") {
    return typeof value === "string" ? value.split(splitter) : value
}

function onTextInput(index, e) {
    const item = localItems[index]
    const value = Array.isArray(item.value) ? str2array(e.target.value) : e.target.value
    debouncedText(index, value)
}
function onHtmlInput(index, e) {
    debouncedText(index, e.target.innerHTML)
}
function onNumberInput(index, e) {
    debouncedText(index, +e.target.value)
}
function onSelectChange(index, e) {
    const item = localItems[index]
    const value = Array.isArray(item.value) ? str2array(e.target.value) : e.target.value
    refreshValue(index, value)
}
function selectOptions(item) {
    return (item.items || []).map((it) => (typeof it === "string" ? { text: it, value: it } : it))
}
function toggleCheckbox(index) {
    const item = localItems[index]
    const next = !(item.value === true || item.value === "true")
    debouncedCheckbox(index, next)
}

// ---- range ----
function rangeValue(item) {
    const raw = item.value
    const postfix = item.postfix || ""
    const num = typeof raw === "string" && postfix ? raw.replace(postfix, "") : raw
    return +num || 0
}
const RANGE_INPUT_WIDTH = 100 // px — 원본이 인라인으로 고정한 input[type=range]의 너비
function rangeProgressPct(item) {
    const min = item.min || 0,
        max = item.max || 100
    // 원본 공식 그대로: value/(max-min) * inputWidth (min을 빼지 않는다 — min!=0일 때도 동일)
    return (rangeValue(item) / (max - min)) * RANGE_INPUT_WIDTH
}
function onRangeInput(index, e) {
    const item = localItems[index]
    const value = +e.target.value
    item.value = value + (item.postfix || "") // 즉시 시각 반영(progress bar/텍스트)
    debouncedText(index, value + (item.postfix || ""))
}

// ---- date popup ----
const openDatePopup = ref(null) // 열려있는 date 편집기의 index
function toggleDate(index) {
    openDatePopup.value = openDatePopup.value === index ? null : index
}
function onDateSelect(index, formatted) {
    refreshValue(index, formatted)
    openDatePopup.value = null
}

// ---- color / colors popup ----
const openColorPopup = ref(null) // "index" 또는 "index:subIndex"(colors 타입)
function toggleColor(key) {
    openColorPopup.value = openColorPopup.value === key ? null : key
}
function onColorChange(index, hex) {
    refreshValue(index, hex)
}
function onColorsChange(index, subIndex, hex) {
    const item = localItems[index]
    const colors = [...item.value]
    colors[subIndex] = hex
    refreshValue(index, colors)
}
function clearColor(index) {
    refreshValue(index, "")
}

// 원본 getDefaultValue() — 현재 값이 아니라 props.items에 처음 주어진 초기값 스냅샷을
// 돌려준다(예: "변경사항이 있는지" 비교, "기본값으로 되돌리기" 용도).
function getDefaultValue() {
    const result = {}
    props.items.forEach((it) => {
        if (it.type !== "group" && it.value !== undefined) result[it.key] = it.value
    })
    return result
}

defineExpose({
    loadItems,
    addItem,
    removeItem,
    getGroupList,
    collapsed,
    expanded,
    getValue,
    getAllValue,
    getDefaultValue,
    setValue,
    initValue,
    updateValue,
    getItem
})
</script>

<template>
    <div class="property-table" style="position: relative;">
        <template v-for="(item, index) in localItems" :key="index">
            <div v-show="isVisible(index)" class="property-item" :class="{ 'property-header-item': item.type === 'group', expanded: item.type === 'group' && !collapsedGroups.has(index), collapsed: item.type === 'group' && collapsedGroups.has(index), vertical: item.vertical || (item.type !== 'group' && Array.isArray(item.value)) }" :data-key="item.key" @click="item.type === 'group' ? toggleGroup(index) : null">
                <template v-if="item.type === 'group'">
                    <div class="property-header">
                        {{ item.title }}
                        <small v-if="item.description" class="description">{{ item.description }}</small>
                        <a class="expand-btn"><i :class="collapsedGroups.has(index) ? 'icon-plus' : 'icon-minus'"></i></a>
                    </div>
                </template>
                <template v-else>
                    <div class="property-title">{{ item.title }}</div>
                    <div class="property-render">
                        <div class="item">
                            <!-- text (기본) -->
                            <input
                                v-if="!item.type || item.type === 'text'"
                                type="text"
                                placeholder="Type here"
                                :readonly="item.readonly"
                                :value="item.value"
                                @input="onTextInput(index, $event)"
                            />

                            <textarea
                                v-else-if="item.type === 'textarea'"
                                :style="{ height: (item.height || 100) + 'px' }"
                                placeholder="Type here"
                                :readonly="item.readonly"
                                :value="item.value"
                                @input="onTextInput(index, $event)"
                            ></textarea>

                            <!-- 'html' 타입은 원본(renderer.html)도 $input.html(item.value)로 동일하게 동작했다.
                                 rich-text 편집기 자리라 HTML을 그대로 렌더링하는 게 기능 자체다 — items를
                                 신뢰할 수 없는 소스(사용자 입력, 외부 API 등)로 채운다면 호출 측에서 반드시
                                 sanitize한 값만 넘겨야 한다. -->
                            <!-- eslint-disable vue/no-v-html -->
                            <div
                                v-else-if="item.type === 'html'"
                                class="html"
                                :contenteditable="!item.readonly"
                                :style="{ height: (item.height || 100) + 'px' }"
                                @input="onHtmlInput(index, $event)"
                                v-html="item.value"
                            ></div>
                            <!-- eslint-enable vue/no-v-html -->

                            <input
                                v-else-if="item.type === 'number'"
                                type="number"
                                :max="item.max ?? 100"
                                :min="item.min ?? 0"
                                :step="item.step ?? 1"
                                :value="item.value"
                                @input="onNumberInput(index, $event)"
                            />

                            <select v-else-if="item.type === 'select'" style="max-width: 100%;" :value="item.value" @change="onSelectChange(index, $event)">
                                <option v-for="opt in selectOptions(item)" :key="opt.value" :value="opt.value">{{ opt.text }}</option>
                            </select>

                            <div v-else-if="item.type === 'range'" style="position: relative;">
                                <input
                                    type="range"
                                    style="width: 100px;"
                                    :max="item.max ?? 100"
                                    :min="item.min ?? 0"
                                    :step="item.step ?? 1"
                                    :readonly="item.readonly"
                                    :value="rangeValue(item)"
                                    @input="onRangeInput(index, $event)"
                                />
                                <div class="range-progress" :style="{ width: rangeProgressPct(item) + 'px' }"></div>
                                <span>{{ rangeValue(item) }}{{ item.postfix || "" }}</span>
                            </div>

                            <span v-else-if="item.type === 'checkbox'" @click="toggleCheckbox(index)">
                                <!-- 테마 CSS가 `input[type=checkbox] + .icon-checkbox`(형제 선택자)로 색을
                                     입히므로, 안 보이지만 실제 input을 아이콘 바로 앞에 둬야 한다. -->
                                <input type="checkbox" style="display: none;" :checked="item.value === true || item.value === 'true'" tabindex="-1" />
                                <i :class="item.value === true || item.value === 'true' ? 'icon-checkbox' : 'icon-checkbox2'"></i>
                            </span>

                            <div v-else-if="item.type === 'switch'" class="switch inner small">
                                <Switch
                                    :model-value="item.value === true || item.value === 'true'"
                                    @update:model-value="(v) => refreshValue(index, v)"
                                />
                            </div>

                            <div v-else-if="item.type === 'date'" class="datepicker-input" style="position: relative;">
                                <i class="icon-calendar" @click="toggleDate(index)"></i>
                                <span class="datepicker-value-text" style="cursor: pointer;" @click="toggleDate(index)">{{ item.value }}</span>
                                <div v-if="openDatePopup === index" class="datepicker" style="position: absolute; z-index: 100000; top: 100%; left: 0;">
                                    <Datepicker
                                        :title-format="item.titleFormat || 'yyyy. MM'"
                                        :format="item.format || 'yyyy/MM/dd'"
                                        @select="(formatted) => onDateSelect(index, formatted)"
                                    />
                                </div>
                            </div>

                            <div v-else-if="item.type === 'color'" style="position: relative;">
                                <a class="color-input" @click.stop="toggleColor(`${index}`)">
                                    <span :style="{ backgroundColor: item.value || 'transparent' }">&nbsp;</span>
                                    <span>{{ item.value || "" }}</span>
                                    <span class="none-color" title="Delete a color" @click.stop="clearColor(index)"><i class="icon-more"></i></span>
                                </a>
                                <div v-if="openColorPopup === `${index}`" class="colorpicker" style="position: absolute; z-index: 100000; top: 100%; left: 0;">
                                    <Colorpicker :model-value="item.value || '#ffffff'" @change="(hex) => onColorChange(index, hex)" />
                                </div>
                            </div>

                            <div v-else-if="item.type === 'colors'">
                                <span v-for="(c, ci) in item.value" :key="ci" style="position: relative; display: inline-block;">
                                    <a class="color-input" @click.stop="toggleColor(`${index}:${ci}`)">
                                        <span :style="{ backgroundColor: c || 'transparent' }">&nbsp;</span>
                                        <span>{{ c || "" }}</span>
                                        <!-- 원본은 colors 배열이어도 delete 클릭 시 항목 하나만 지우지 않고
                                             item.value 전체를 빈 문자열로 덮어쓴다 — 그 동작을 그대로 둔다. -->
                                        <span class="none-color" title="Delete a color" @click.stop="clearColor(index)"><i class="icon-more"></i></span>
                                    </a>
                                    <div v-if="openColorPopup === `${index}:${ci}`" class="colorpicker" style="position: absolute; z-index: 100000; top: 100%; left: 0;">
                                        <Colorpicker :model-value="c || '#ffffff'" @change="(hex) => onColorsChange(index, ci, hex)" />
                                    </div>
                                </span>
                            </div>

                            <div v-else-if="item.type === 'property'" class="property inner">
                                <Property
                                    :ref="(el) => (nestedPropertyRefs[index] = el)"
                                    :items="item.items"
                                    @change="() => refreshValue(index, nestedPropertyRefs[index]?.getAllValue())"
                                />
                            </div>
                        </div>

                        <!-- description도 원본이 HTML 그대로 삽입하던 필드다(링크 등을 넣는 용도) —
                             items를 신뢰할 수 없는 소스로 채운다면 호출 측에서 sanitize 필요. -->
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <div v-if="item.description" class="description" v-html="item.description"></div>
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>
