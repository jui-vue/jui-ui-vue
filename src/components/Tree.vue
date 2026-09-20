<script setup>
// 원본(tree.js)의 ui.tree.node/ui.tree.base는 "0.1.2" 같은 점(dot) 인덱스 문자열로 노드를
// 찾고, DOM을 직접 append/insertBefore/remove하며 동기화했다. Vue 버전은 같은 인덱스
// 체계와 CRUD API(append/insert/update/remove/move/open/fold/select/get/getAll/list/
// listAll/listParents/activeIndex)는 그대로 노출하되, 내부 상태는 반응형 트리(reactive
// 객체 그래프)로 두고 DOM 동기화는 재귀 컴포넌트(TreeNode.vue)의 v-for/v-show에 맡긴다 —
// reindex() 한 번으로 전체 인덱스가 재계산되면 나머지는 Vue가 알아서 다시 그린다.
// tpl.node(커스텀 노드 템플릿)는 TreeNode.vue의 default scoped slot으로 대체했다.
import { reactive, ref, provide } from "vue"
import { KeyParser } from "jui-core-ts"
import TreeNode from "./TreeNode.vue"

// 원본(tree.js)의 util.index 파서를 그대로 포팅한 jui-core-ts의 KeyParser를 쓴다
// (예전엔 이 리포에 vendoring 안 돼 있어서 ../utils/treeIndex.js에 독자적으로
// 재구현했었음). getParentIndex/getNextIndex는 내부적으로 this.getIndexList를 참조하므로
// 메서드를 분해하지 않고 인스턴스를 그대로 쓴다.
const keyParser = new KeyParser()

const props = defineProps({
    root: { type: Object, required: true }, // 루트 노드 데이터(필수 — 원본과 동일)
    variant: { type: String, default: "arrow" }, // 'arrow' | 'line' | 'arrow-file' | 'line-file'
    rootHide: { type: Boolean, default: false },
    rootFold: { type: Boolean, default: false },
    drag: { type: Boolean, default: false },
    dragChild: { type: Boolean, default: true }
})

const emit = defineEmits([
    "select",
    "open",
    "fold",
    "openall",
    "foldall",
    "dragstart",
    "dragover",
    "dragend"
])

function makeNode(data) {
    return reactive({ data, parent: null, children: [], type: "open", index: null, nodenum: null, depth: 0 })
}

const root = makeNode(props.root)
const activeIndex = ref(null)

function reindex(node, nodenum, parent) {
    if (parent !== undefined) node.parent = parent
    if (nodenum !== undefined) node.nodenum = nodenum
    node.index = node.parent ? (node.parent.index == null ? String(node.nodenum) : node.parent.index + "." + node.nodenum) : null
    node.depth = node.index == null ? 0 : node.index.split(".").length
    node.children.forEach((child, i) => reindex(child, i, node))
}
reindex(root)
if (props.rootFold) root.type = "fold"

function getNode(index) {
    if (index == null) return root.children
    const keys = keyParser.getIndexList(index)
    let node = root.children[keys[0]]
    for (let i = 1; i < keys.length && node; i++) node = node.children[keys[i]]
    return node || null
}
function getNodeParent(index) {
    const keys = keyParser.getIndexList(index)
    if (keys.length === 1) return root
    return getNode(keys.slice(0, -1).join("."))
}
function getNodeAll(index) {
    const result = []
    const start = index == null ? root.children : [getNode(index)].filter(Boolean)
    ;(function collect(list) {
        for (const n of list) {
            result.push(n)
            if (n.children.length) collect(n.children)
        }
    })(start)
    return result
}

function append() {
    const hasIndex = arguments.length === 2
    let dataList = hasIndex ? arguments[1] : arguments[0]
    const index = hasIndex ? arguments[0] : null
    if (!Array.isArray(dataList)) dataList = [dataList]

    let created
    for (const data of dataList) {
        const parent = index != null ? getNode(index) : root
        const node = makeNode(data)
        parent.children.push(node)
        created = node
    }
    reindex(root)
    return created
}

function insert(index, data) {
    const dataList = Array.isArray(data) ? data : [data]
    let created
    for (const d of dataList) {
        if (root.children.length === 0 && parseInt(index, 10) === 0) {
            const node = makeNode(d)
            root.children.push(node)
            created = node
        } else {
            const parent = getNodeParent(index)
            const keys = keyParser.getIndexList(index)
            const pos = keys[keys.length - 1]
            const node = makeNode(d)
            node.parent = parent
            parent.children.splice(pos, 0, node)
            created = node
        }
    }
    reindex(root)
    return created
}

function update(indexOrList, data) {
    if (arguments.length === 2) {
        const node = getNode(indexOrList)
        if (!node) return
        Object.assign(node.data, data)
    } else {
        const dataList = indexOrList
        root.children.splice(0, root.children.length)
        for (const row of dataList) {
            const pIndex = keyParser.getParentIndex(row.index)
            if (pIndex == null) append(row.data)
            else append(pIndex, row.data)
        }
    }
    reindex(root)
}

function remove(index) {
    const node = getNode(index)
    if (!node || !node.parent) return
    const i = node.parent.children.indexOf(node)
    if (i >= 0) node.parent.children.splice(i, 1)
    reindex(root)
}

function reset() {
    root.children.splice(0, root.children.length)
    reindex(root)
}

function isDescendant(maybeDescendant, ancestor) {
    let p = maybeDescendant.parent
    while (p) {
        if (p === ancestor) return true
        p = p.parent
    }
    return false
}

function move(index, targetIndex) {
    if (index === targetIndex) return
    const node = getNode(index)
    const targetParent = getNodeParent(targetIndex)
    if (!node || !targetParent) return
    if (targetParent === node || isDescendant(targetParent, node)) return

    const oldParent = node.parent
    if (oldParent) {
        const i = oldParent.children.indexOf(node)
        if (i >= 0) oldParent.children.splice(i, 1)
    }
    const keys = keyParser.getIndexList(targetIndex)
    const pos = Math.min(keys[keys.length - 1], targetParent.children.length)
    node.parent = targetParent
    targetParent.children.splice(pos, 0, node)
    reindex(root)
}

function open(index, e) {
    if (index == null && props.rootHide) return
    const node = index == null ? root : getNode(index)
    if (!node) return
    node.type = "open"
    emit("open", node, e)
}
function fold(index, e) {
    if (index == null && props.rootHide) return
    const node = index == null ? root : getNode(index)
    if (!node) return
    node.type = "fold"
    emit("fold", node, e)
}
function openAll(index) {
    for (const n of getNodeAll(index)) n.type = "open"
    if (index == null) root.type = "open"
    emit("openall", index == null ? root : getNode(index))
}
function foldAll(index) {
    for (const n of getNodeAll(index)) n.type = "fold"
    if (index == null) root.type = "fold"
    emit("foldall", index == null ? root : getNode(index))
}

function select(nodeOrIndex, e) {
    const node = typeof nodeOrIndex === "object" ? nodeOrIndex : nodeOrIndex == null ? root : getNode(nodeOrIndex)
    if (!node) return
    activeIndex.value = node.index
    emit("select", node, e)
    return node
}
function unselect() {
    if (activeIndex.value == null) return
    const node = getNode(activeIndex.value)
    activeIndex.value = null
    return node
}

function list() {
    return root.children
}
function listAll() {
    return getNodeAll(null)
}
function listParents(index) {
    const node = getNode(index)
    const parents = []
    let p = node && node.parent
    while (p && p.index != null) {
        parents.push(p)
        p = p.parent
    }
    return parents.reverse()
}
function get(index) {
    if (index == null) return null
    return getNode(index)
}
function getAll(index) {
    if (index == null) return null
    return getNodeAll(index)
}
function getActiveIndex() {
    return activeIndex.value
}
function getRoot() {
    return root
}

// ---- 드래그 앤 드롭 ----
// 원본은 형제 사이에 삽입하기 위한 반투명 .drag 바까지 그렸지만, 여기서는 핵심 동작인
// "드래그한 노드를 대상 노드의 마지막 자식으로 옮기기"만 지원한다(문서화된 단순화).
//
// 원본은 jQuery 커스텀 이벤트라 리스너가 false를 리턴하면 그 자리에서 동작을 취소할 수
// 있었다(tree_drag.html 예제가 실제로 dragover/dragend에서 file 노드 위로는 못 옮기게
// false를 리턴함). Vue의 emit은 리스너의 리턴값을 모으지 않으므로, node/e 뒤에 취소용
// control 객체(preventDefault)를 세 번째 인자로 함께 넘기고 그 결과를 직접 확인한다.
const dragStart = ref(null) // 드래그 시작 노드의 index
const dragEnd = ref(null) // 현재 hover 중인 대상 노드의 index

function emitCancelable(name, node, nativeEvent) {
    const control = {
        defaultPrevented: false,
        preventDefault() {
            this.defaultPrevented = true
        }
    }
    emit(name, node, nativeEvent, control)
    return !control.defaultPrevented
}

function dragStartNode(node, e) {
    if (dragStart.value != null) return
    if (!emitCancelable("dragstart", node, e)) return
    dragStart.value = node.index
}
function dragOverNode(node, e) {
    if (dragStart.value == null || dragStart.value === node.index) return
    if (props.dragChild === false) return
    if (!emitCancelable("dragover", node, e)) return
    dragEnd.value = node.index
}
function dragDropOnNode(node, e) {
    if (dragStart.value == null) {
        dragStart.value = null
        dragEnd.value = null
        return
    }
    if (props.dragChild !== false && dragStart.value !== node.index) {
        const target = getNode(node.index)
        const lastChild = target && target.children.at(-1)
        const endIndex = lastChild ? keyParser.getNextIndex(lastChild.index) : node.index + ".0"

        if (emitCancelable("dragend", get(node.index), e)) {
            move(dragStart.value, endIndex)
        }
    }
    dragStart.value = null
    dragEnd.value = null
}

provide("treeCtx", {
    activeIndex,
    dragEnd,
    drag: props.drag,
    rootHide: props.rootHide,
    open,
    fold,
    select,
    dragStartNode,
    dragOverNode,
    dragDropOnNode
})

defineExpose({
    append,
    insert,
    update,
    remove,
    reset,
    move,
    open,
    fold,
    openAll,
    foldAll,
    select,
    unselect,
    list,
    listAll,
    listParents,
    get,
    getAll,
    activeIndex: getActiveIndex,
    getRoot
})
</script>

<template>
    <ul class="tree" :class="variant">
        <TreeNode :node="root" is-root>
            <template #default="slotProps"><slot v-bind="slotProps" /></template>
        </TreeNode>
    </ul>
</template>
