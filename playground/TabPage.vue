<script setup>
import { ref } from "vue"
import Tab from "../src/components/Tab.vue"

// 원본 tab_1 = tab("#tab_1", { target: "#tab_contents_1", index: 1, event: { change: (d) => alert(d.text) } })
const tab1Items = [
    { text: "Home", value: "home" },
    { text: "CSS", value: "css", disabled: true },
    { text: "Script", value: "script" }
]
const tab1Index = ref(1)
function onTab1Change(data) {
    alert(data.item.text)
}

// 원본 tab_2 = tab("#tab_2", { target: "#tab_contents_2", tpl: { menu: ... }, event: { change, changemenu } })
const tab2Items = [
    { text: "Home", value: "home" },
    { text: "CSS", value: "css" },
    { text: "Script", value: "script", disabled: true }
]
const tab2Index = ref(0)
const tab2Menu = [
    { text: "Combo Box1", value: "combo1", icon: "refresh" },
    { divider: true },
    { text: "Combo Box2", value: "combo2" },
    { text: "Combo Box3", value: "combo3" },
    { text: "Combo Box4", value: "combo4" }
]
function onTab2Change(data) {
    alert(data.item.text)
}
function onTab2ChangeMenu(data) {
    alert(data.text)
}
</script>

<template>
    <div class="page-header">
        <h1>Tab</h1>
    </div>

    <div class="row">
        <div class="col col-6">
            <Tab v-model="tab1Index" :items="tab1Items" position="top" @change="onTab1Change">
                <template #panel-home><div>home</div></template>
                <template #panel-css><div>css</div></template>
                <template #panel-script><div>script</div></template>
            </Tab>
        </div>
        <div class="col col-6">
            <Tab
                v-model="tab2Index"
                :items="tab2Items"
                variant="pill"
                position="bottom"
                :menu="tab2Menu"
                @change="onTab2Change"
                @changemenu="onTab2ChangeMenu"
            >
                <template #panel-home><div>home</div></template>
                <template #panel-css><div>css</div></template>
                <template #panel-script><div>script</div></template>
            </Tab>
        </div>
    </div>
</template>

<style scoped>
:deep(.jui-tab-content) {
    background: #dcdcdc;
}
</style>
