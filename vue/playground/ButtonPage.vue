<script setup>
import { ref } from "vue"
import ButtonGroup from "../src/components/ButtonGroup.vue"

// 원본 btn_radio_1 — On/Off, alert(btn_radio_1.getValue())
const radio1Items = [
    { text: "On", value: "true" },
    { text: "Off", value: "false" }
]
const radio1 = ref("true")
function runRadio1() {
    alert(radio1.value)
}

// 원본 btn_radio_2 — A/B/C/Home(아이콘+텍스트)/Gear(아이콘)/Help(아이콘), btn_radio_2.setIndex(3)
const radio2Items = [
    { text: "A", value: "a" },
    { text: "B", value: "b" },
    { text: "C", value: "c" },
    { text: "Home", value: "home", icon: "associate" },
    { value: "gear", icon: "jennifer-front" },
    { value: "help", icon: "line-each" }
]
const radio2 = ref("a")
function runRadio2SetIndex() {
    radio2.value = radio2Items[3].value // setIndex(3)
}

// 원본 btn_radio_3 — A/B/C + Home/Gear/Help 아이콘(icon-white), btn_radio_3.setValue('gear')
const radio3Items = [
    { text: "A", value: "a" },
    { text: "B", value: "b" },
    { text: "C", value: "c" },
    { value: "home", icon: "home", iconExtra: "icon-white" },
    { value: "gear", icon: "gear", iconExtra: "icon-white" },
    { value: "help", icon: "help", iconExtra: "icon-white" }
]
const radio3 = ref("a")
function runRadio3SetValue() {
    radio3.value = "gear"
}

// 원본 btn_check — check/plus/edit/home/gear 아이콘, btn_check.setIndex([3, 4])
const checkItems = [
    { value: "check", icon: "check" },
    { value: "plus", icon: "plus" },
    { value: "edit", icon: "edit" },
    { value: "home", icon: "home" },
    { value: "gear", icon: "gear" }
]
const check1 = ref([])
function runCheck1SetIndex() {
    check1.value = [checkItems[3].value, checkItems[4].value] // setIndex([3, 4])
}

// 원본 btn_check_2 — 동일 아이콘 + icon-white, btn_check_2.setValue(['check', 'edit'])
const check2Items = checkItems.map((item) => ({ ...item, iconExtra: "icon-white" }))
const check2 = ref([])
function runCheck2SetValue() {
    check2.value = ["check", "edit"]
}
</script>

<template>
    <div class="page-header">
        <h1>Button</h1>
    </div>

    <section>
        <h2>Radio</h2>
        <p>
            버튼 컴포넌트는 하나만 선택할 수 있는 라디오 타입을 제공합니다.

            <table class="table_s" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td width="200px">View</td>
                    <td width="75px">Result</td>
                    <td>Test Code</td>
                    <td>Description</td>
                </tr>
                <tr>
                    <td>
                        <ButtonGroup :items="radio1Items" type="radio" size="small" v-model="radio1" />
                    </td>
                    <td>
                        <button class="btn btn-gray" @click="runRadio1">Run</button>
                    </td>
                    <td>alert(radio1.value)</td>
                    <td>현재 선택된 버튼의 값을 출력</td>
                </tr>
                <tr>
                    <td>
                        <ButtonGroup :items="radio2Items" type="radio" size="mini" v-model="radio2" />
                    </td>
                    <td>
                        <button class="btn btn-gray" @click="runRadio2SetIndex">Run</button>
                    </td>
                    <td>radio2.value = radio2Items[3].value</td>
                    <td>해당 인덱스의 버튼을 선택 상태로 변경</td>
                </tr>
                <tr>
                    <td>
                        <ButtonGroup :items="radio3Items" type="radio" size="mini" v-model="radio3" />
                    </td>
                    <td>
                        <button class="btn btn-gray" @click="runRadio3SetValue">Run</button>
                    </td>
                    <td>radio3.value = "gear"</td>
                    <td>해당 값의 버튼을 선택 상태로 변경</td>
                </tr>
            </table>
        </p>

        <p class="br">
            아래는 라디오 버튼을 생성하는 코드입니다.

<pre><code class="language-markup">&lt;ButtonGroup :items="radio1Items" type="radio" size="small" v-model="radio1" /&gt;

...</code></pre>
<pre><code class="language-javascript">const radio1Items = [
    { text: "On", value: "true" },
    { text: "Off", value: "false" }
];
const radio1 = ref("true");</code></pre>
        </p>
    </section>

    <section>
        <h2>Check</h2>
        <p>
            버튼 컴포넌트는 다수를 선택할 수 있는 체크 타입을 제공합니다.

            <table class="table_s" cellpadding="0" cellspacing="0">
                <tr>
                    <td width="170px">View</td>
                    <td width="75px">Result</td>
                    <td>Test Code</td>
                    <td>Description</td>
                </tr>
                <tr>
                    <td>
                        <ButtonGroup :items="checkItems" type="check" size="mini" v-model="check1" />
                    </td>
                    <td>
                        <button class="btn btn-gray" @click="runCheck1SetIndex">Run</button>
                    </td>
                    <td>check1.value = [checkItems[3].value, checkItems[4].value]</td>
                    <td>해당 인덱스를 가지는 버튼들을 선택 상태로 변경</td>
                </tr>
                <tr>
                    <td>
                        <ButtonGroup :items="check2Items" type="check" size="mini" v-model="check2" />
                    </td>
                    <td>
                        <button class="btn btn-gray" @click="runCheck2SetValue">Run</button>
                    </td>
                    <td>check2.value = ["check", "edit"]</td>
                    <td>해당 값을 가지는 버튼들을 선택 상태로 변경</td>
                </tr>
            </table>
        </p>

        <p class="br">
            아래는 체크 버튼을 생성하는 코드입니다.

<pre><code class="language-markup">&lt;ButtonGroup :items="checkItems" type="check" size="mini" v-model="check1" /&gt;

...</code></pre>
<pre><code class="language-javascript">const checkItems = [
    { text: "Check", value: "check" },
    { text: "Plus", value: "plus" },
    { text: "Edit", value: "edit" },
    { text: "Home", value: "home" },
    { text: "Gear", value: "gear" }
];
const check1 = ref([]);</code></pre>
        </p>
    </section>
</template>
