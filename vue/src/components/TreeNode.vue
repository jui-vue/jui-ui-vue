<script setup>
// 원본은 매 reloadUI()마다 setNodeStatus()로 open/fold/leaf/last/root 클래스를 노드
// DOM에 직접 지웠다 다시 붙였다(removeClass+addClass). Vue 버전은 이 클래스들을 node의
// 현재 상태(type/children/parent/lastChild 여부)에서 매번 계산하는 순수 computed로
// 대체했다 — 트리 구조가 바뀌면 Vue가 알아서 다시 그린다.
import { computed, inject } from "vue"

const props = defineProps({
    node: { type: Object, required: true },
    isRoot: { type: Boolean, default: false }
})

const ctx = inject("treeCtx")

const isLeaf = computed(() => props.node.children.length === 0)
const isLast = computed(() => props.node.parent && props.node.parent.children.at(-1) === props.node)

const classes = computed(() => ({
    root: props.isRoot,
    leaf: !props.isRoot && isLeaf.value,
    open: (props.isRoot || !isLeaf.value) && props.node.type === "open",
    fold: (props.isRoot || !isLeaf.value) && props.node.type === "fold",
    last: isLast.value,
    active: ctx.activeIndex.value === props.node.index,
    hover: ctx.dragEnd.value === props.node.index,
    disabled: !!props.node.data.disabled
}))

const hideRow = computed(() => props.isRoot && ctx.rootHide)

function onToggleClick(e) {
    if (props.node.type === "open") ctx.fold(props.node.index, e)
    else ctx.open(props.node.index, e)
    e.stopPropagation()
}
function onSelectClick(e) {
    if (classes.value.disabled) return
    ctx.select(props.node, e)
    e.stopPropagation()
}
function onMouseDown(e) {
    if (e.target.tagName === "I") return
    ctx.dragStartNode(props.node, e)
}
function onMouseUp(e) {
    if (e.target.tagName === "I") return
    ctx.dragDropOnNode(props.node, e)
}
function onMouseOver(e) {
    if (e.target.tagName === "I") return
    ctx.dragOverNode(props.node, e)
}
</script>

<template>
    <li :class="classes" :style="isRoot && hideRow ? { paddingLeft: '0px' } : null" @mousedown="ctx.drag ? onMouseDown($event) : null" @mouseup="ctx.drag ? onMouseUp($event) : null" @mouseover="ctx.drag ? onMouseOver($event) : null">
        <!-- rootHide: li 자체가 아니라(자식은 그대로 보여야 하므로) 루트 자신의 토글/라벨만 숨긴다 -->
        <i v-show="!hideRow" @click="onToggleClick"></i>
        <component :is="node.data.href ? 'a' : 'div'" v-show="!hideRow" :href="node.data.href" @click="onSelectClick">
            <slot :node="{ index: node.index, data: node.data, depth: node.depth }">
                <i></i>
                {{ node.data.title }}
            </slot>
        </component>
        <ul v-show="node.type === 'open'">
            <TreeNode v-for="child in node.children" :key="child.index" :node="child">
                <template #default="slotProps"><slot v-bind="slotProps" /></template>
            </TreeNode>
        </ul>
    </li>
</template>
