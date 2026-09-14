<script setup>
import { ref, onMounted } from "vue"
import Tree from "../src/components/Tree.vue"

const treeRef = ref(null)
function onSelect(node) {
    treeRef.value.select(node.index)
    alert("index(" + node.index + "), title(" + node.data.title + ")")
}

const count = ref(6)
function treeUpdateRun() {
    const nodes = []
    let key = "0"
    for (let i = 0; i < count.value; i++) {
        nodes.push({ index: key, data: { title: "Hong" + i } })
        key += ".0"
    }
    treeRef.value.update(nodes)
}

// tree_drag.html과 동일한 구성(드래그로 파일/폴더 재배치)
const dragTreeRef = ref(null)
function onDragEnd(node, e, control) {
    if (node && node.data.symbol === "file") control.preventDefault()
}
function onDragOver(node, e, control) {
    if (node && node.data.symbol === "file") control.preventDefault()
}

onMounted(() => {
    const t = dragTreeRef.value
    t.append({ title: "Windows", symbol: "dir1" })
    t.append({ title: "Download", symbol: "dir1" })
    t.append({ title: "Program Files", symbol: "dir1" })
    t.append({ title: "Apache", symbol: "dir2" })
    t.append("0", { title: "run.exe", symbol: "file" })
    t.append("0", { title: "setting.conf", symbol: "file" })
    t.append("1", { title: "jui.torrent", symbol: "file" })
    t.insert("2.0", { title: "Riot Games", symbol: "dir2" })
    t.insert("2.0.0", { title: "lol.exe", symbol: "file" })
    t.append("3", { title: "startup.bat", symbol: "file" })
    t.fold("0")
    t.fold("1")
    t.fold("3")
})
</script>

<template>
    <div class="page-header">
        <h1>Tree</h1>
    </div>

    <section>
        <h2>Basic</h2>
        <div class="group">
            <input v-model.number="count" type="number" class="input small" />
            <a class="btn small" @click="treeUpdateRun">Run</a>
        </div>
        <br /><br />
        <Tree ref="treeRef" variant="arrow" :root="{ title: 'C:\\\\' }" @select="onSelect" />
    </section>

    <section style="margin-top: 30px;">
        <h2>Drag &amp; Drop (파일은 드롭 대상이 될 수 없음)</h2>
        <Tree
            ref="dragTreeRef"
            variant="line"
            :root="{ title: 'C:\\\\', symbol: 'dir' }"
            root-hide
            drag
            :drag-child="true"
            @dragend="onDragEnd"
            @dragover="onDragOver"
        >
            <template #default="{ node }">
                <i class="symbol" :class="node.data.symbol"></i> {{ node.data.title }}
            </template>
        </Tree>
    </section>
</template>

<style scoped>
:deep(.tree i.symbol) {
    display: inline-block;
    width: 14px;
    height: 14px;
}
:deep(.tree i.symbol.dir1) {
    background-color: red;
}
:deep(.tree i.symbol.dir2) {
    background-color: orange;
}
:deep(.tree i.symbol.file) {
    background-color: blue;
}
</style>
