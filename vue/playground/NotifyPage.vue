<script setup>
import { ref } from "vue"
import Notify from "../src/components/Notify.vue"

const notify1 = ref(null) // body, top-right
const notify2 = ref(null) // body, top-left, timeout:0
const notify3 = ref(null) // body, top, timeout:2000, padding:{top:100}
const notify4 = ref(null) // section, bottom, timeout:0, distance:50
const notify5 = ref(null) // section, bottom-left, showDuration/hideDuration:1000
const notify6 = ref(null) // section, bottom-right, showEasing:linear

function log(kind, data) {
    console.log(`${kind} : ${JSON.stringify(data)}`)
}

function notifyTest(type, color) {
    const data = { title: "Caution message Send!!!", message: "Feb 15, 2013-12-24 02:24:19", color }
    const refs = { 1: notify1, 2: notify2, 3: notify3, 4: notify4, 5: notify5, 6: notify6 }
    refs[type].value.add(data)
}
</script>

<template>
    <div class="page-header">
        <h1>Notify</h1>
        <p class="br">심각한 문제가 발생하거나 이벤트 등이 발생하였을 때, 알림 기능을 제공하는 UI 컴포넌트입니다.</p>
    </div>

    <section style="position: relative;">
        <h2>Default</h2>
        <p>
            아래 테이블은 컴포넌트를 쉽게 테스트할 수 있는 예제 목록입니다.
            <table class="table_s" width="100%" cellpadding="0" cellspacing="0" style="position: relative;">
                <tr>
                    <td width="80px">Result</td>
                    <td>Options</td>
                </tr>
                <tr>
                    <td><button class="btn" @click="notifyTest(1, '')">Run</button></td>
                    <td>{ position: "top-right" }</td>
                </tr>
                <tr>
                    <td><button class="btn" @click="notifyTest(2, 'danger')">Run</button></td>
                    <td>{ position: "top-left", timeout: 0 }</td>
                </tr>
                <tr>
                    <td><button class="btn" @click="notifyTest(3, 'warning')">Run</button></td>
                    <td>{ position: "top", timeout: 2000, padding: { top: 100 } }</td>
                </tr>
                <tr>
                    <td><button class="btn" @click="notifyTest(4, 'success')">Run</button></td>
                    <td>{ position: "bottom", timeout: 0, distance: 50 }</td>
                </tr>
                <tr>
                    <td><button class="btn" @click="notifyTest(5, 'info')">Run</button></td>
                    <td>{ position: "bottom-left", showDuration: 1000, hideDuration: 1000 }</td>
                </tr>
                <tr>
                    <td><button class="btn" @click="notifyTest(6, '')">Run</button></td>
                    <td>{ position: "bottom-right", showEasing: "linear" }</td>
                </tr>
            </table>
        </p>

        <!-- notify4/5/6은 원본처럼 이 section 안에 갇혀서 나타난다(section에 position:relative) -->
        <Notify ref="notify4" position="bottom" :timeout="0" :distance="50" @show="(d) => log('show', d)" @hide="(d) => log('hide', d)" />
        <Notify ref="notify5" position="bottom-left" :show-duration="1000" :hide-duration="1000" />
        <Notify ref="notify6" position="bottom-right" show-easing="linear" />
    </section>

    <!-- notify1/2/3은 body 기준(페이지 전체) -->
    <Notify ref="notify1" position="top-right" @show="(d) => log('show', d)" @hide="(d) => log('hide', d)" />
    <Notify ref="notify2" position="top-left" :timeout="0" />
    <Notify ref="notify3" position="top" :timeout="2000" :padding="{ top: 100 }" />
</template>
