<script setup>
import { ref } from "vue"
import Paging from "../src/components/Paging.vue"

// 원본에 examples/paging.html이 없어서, 소스 코드(paging.js)의 옵션을 그대로 살려 데모를 구성했다.
const page1 = ref(1)

const page2 = ref(1)
const pagingRef = ref(null)
function runNext() {
    pagingRef.value.next()
}
function runLast() {
    pagingRef.value.last()
}

function onPage(p) {
    console.log("page changed:", p)
}
</script>

<template>
    <div class="page-header">
        <h1>Paging</h1>
        <p class="br">원본 리포에 examples/paging.html이 없어서, paging.js 옵션을 그대로 살려 재구성한 데모입니다.</p>
    </div>

    <section>
        <h2>Normal (count=95, pageCount=10, screenCount=5)</h2>
        <div style="width: 400px;">
            <Paging v-model="page1" :count="95" :page-count="10" :screen-count="5" @page="onPage" />
        </div>
        <p>현재 페이지: {{ page1 }}</p>
    </section>

    <section>
        <h2>Large + 프로그래매틱 제어</h2>
        <div style="width: 400px;">
            <Paging ref="pagingRef" v-model="page2" :count="240" :page-count="10" size="large" />
        </div>
        <p>
            <button type="button" @click="runNext">Run: next()</button>
            <button type="button" @click="runLast">Run: last()</button>
        </p>
        <p>현재 페이지: {{ page2 }}</p>
    </section>
</template>
