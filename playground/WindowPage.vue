<script setup>
import { ref } from "vue"
import Window from "../src/components/Window.vue"

// 원본(examples/window.html)은 리포에 존재하지 않는다(Paging과 동일한 케이스).
// window.js 소스 코드 + window.less/window.theme.less만 근거로, 원본 API가 지원하는
// 기능(move/resize/modal/close/z-index 포커스/foot 버튼 영역)을 모두 보여주는 데모를 구성했다.

const basic = ref(false)
const noMoveResize = ref(false)
const modalWin = ref(false)
const withFoot = ref(false)

const win1 = ref(null)
const win2 = ref(null)
const log = ref([])
function addLog(msg) {
    log.value.unshift(`${new Date().toLocaleTimeString()} - ${msg}`)
    if (log.value.length > 6) log.value.pop()
}
</script>

<template>
    <div class="page-header">
        <h1>Window</h1>
        <p style="color: #888; font-size: 13px;">원본 예시 페이지(examples/window.html)가 리포에 없어, 소스 코드(window.js) + 스타일(window.less)만으로 재구성한 데모입니다.</p>
    </div>

    <div class="row">
        <div class="col col-3">
            <p>기본(이동/리사이즈 가능)</p>
            <button class="btn" @click="basic = true">열기</button>
        </div>
        <div class="col col-3">
            <p>이동/리사이즈 불가</p>
            <button class="btn" @click="noMoveResize = true">열기</button>
        </div>
        <div class="col col-3">
            <p>모달 윈도우</p>
            <button class="btn" @click="modalWin = true">열기</button>
        </div>
        <div class="col col-3">
            <p>foot 영역(버튼) 포함</p>
            <button class="btn" @click="withFoot = true">열기</button>
        </div>
    </div>

    <div class="row" style="margin-top: 20px;">
        <div class="col col-3">
            <p>동시에 두 개 띄우기(클릭한 창이 앞으로 옴, z-index 포커스)</p>
            <button class="btn" @click="win1 = true">창 1</button>
            <button class="btn" @click="win2 = true">창 2</button>
        </div>
        <div class="col col-6">
            <p>이벤트 로그</p>
            <ul>
                <li v-for="(l, i) in log" :key="i">{{ l }}</li>
            </ul>
        </div>
    </div>

    <Window v-model="basic" title="Basic Window" :left="100" :top="120" @move="addLog('basic: move')" @resize="addLog('basic: resize')">
        <p>드래그로 이동하고, 우측 하단 핸들로 크기를 조절할 수 있습니다.</p>
    </Window>

    <Window v-model="noMoveResize" title="Fixed Window" :left="550" :top="120" :move="false" :resize="false">
        <p>move=false, resize=false — 이동/리사이즈가 불가능합니다.</p>
    </Window>

    <Window v-model="modalWin" title="Modal Window" :left="250" :top="250" modal>
        <p>모달 윈도우입니다. 배경을 클릭해도 닫히지 않고(autoHide 없음), 닫기 버튼으로만 닫힙니다.</p>
    </Window>

    <Window v-model="withFoot" title="Confirm" :left="350" :top="180" :width="360" :height="200">
        <p>foot 슬롯에 버튼 영역을 넣을 수 있습니다.</p>
        <template #foot="{ hide }">
            <button class="btn" @click="hide">확인</button>
        </template>
    </Window>

    <Window v-model="win1" title="Window 1" :left="150" :top="380" :width="300" :height="180">
        <p>창 1</p>
    </Window>
    <Window v-model="win2" title="Window 2" :left="280" :top="420" :width="300" :height="180">
        <p>창 2</p>
    </Window>
</template>
