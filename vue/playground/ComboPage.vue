<script setup>
import { ref } from "vue"
import Combo from "../src/components/Combo.vue"

const combo1Items = [
    { value: "1", text: "New" },
    { value: "2", text: "Open" },
    { value: "3", text: "Save" },
    { value: "4", text: "Close" },
    { value: "5", text: "Restart" },
    { divider: true },
    { value: "6", text: "Print" },
    { divider: true },
    { value: "7", text: "Exit" }
]
const combo1Ref = ref(null)
const combo1Value = ref("3") // index: 2 -> Save

function onCombo1Change(data) {
    alert("text(" + data.text + "), value(" + data.value + ")")
}
function combo1Run() {
    alert(combo1Ref.value.getText())
}

const combo2Items = [
    { value: "menu1", text: "New", href: "#" },
    { value: "menu2", text: "Open", href: "#" },
    { value: "menu3", text: "Save", href: "#" },
    { value: "menu4", text: "Closxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxe", href: "#" },
    { value: "menu5", text: "Restart", href: "#" },
    { divider: true },
    { value: "menu6", text: "Print", href: "#" },
    { divider: true },
    { value: "menu7", text: "Exit", href: "#" }
]
const combo2Ref = ref(null)
const combo2Value = ref(undefined) // index: 3 -> Closxxx...

function onCombo2Change(data) {
    alert("text(" + data.text + "), value(" + data.value + ")")
}
</script>

<template>
    <div class="page-header">
        <h1>Combo</h1>
    </div>

    <section>
        <h2>Default</h2>
        <p>콤보 박스는 셀렉터 태그와 같은 기능을 제공합니다.</p>

        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td width="200px">View</td>
                <td width="75px">Result</td>
                <td>Test Code</td>
                <td>Description</td>
            </tr>
            <tr>
                <td style="position: relative;">
                    <Combo
                        ref="combo1Ref"
                        v-model="combo1Value"
                        :items="combo1Items"
                        position="top"
                        :keydown="true"
                        :text-style="{ width: '175px' }"
                        @change="onCombo1Change"
                    />
                </td>
                <td>
                    <button class="btn" @click="combo1Run"><i class="icon-play"></i> Run</button>
                </td>
                <td>alert(combo_1.getText());</td>
                <td>현재 선택한 노드에 값을 출력</td>
            </tr>
            <tr>
                <td style="position: relative;">
                    <Combo
                        ref="combo2Ref"
                        v-model="combo2Value"
                        :items="combo2Items"
                        size="small"
                        :index="3"
                        :width="195"
                        :keydown="true"
                        @change="onCombo2Change"
                    />
                </td>
                <td>
                    <button class="btn" @click="combo2Ref.setIndex(1)"><i class="icon-play"></i> Run</button>
                </td>
                <td>combo_2.setIndex(1)</td>
                <td>해당 인덱스를 가지는 노드를 선택 상태로 변경</td>
            </tr>
        </table>
    </section>
</template>

<style scoped>
table {
    border-collapse: collapse;
}
td {
    padding: 10px;
    vertical-align: middle;
}
</style>
