<script setup>
import { ref } from "vue"
import Layout from "../src/components/Layout.vue"

const topSize = ref(60)
const bottomSize = ref(60)
const leftSize = ref(150)
const rightSize = ref(150)
</script>

<template>
    <div class="page-header">
        <h1>Layout</h1>
        <p style="color: #888; font-size: 13px;">
            원본 예시 페이지(examples/layout.html)가 리포에 없어, 소스 코드(layout.js)만으로 재구성한 데모입니다.
            top/bottom/left/right 리사이저 바를 드래그해서 각 영역 크기를 조절할 수 있습니다.
        </p>
    </div>

    <div style="border: 1px solid #ccc; display: inline-block;">
        <Layout
            :width="700"
            :height="500"
            v-model:top-size="topSize"
            v-model:bottom-size="bottomSize"
            v-model:left-size="leftSize"
            v-model:right-size="rightSize"
        >
            <template #top>
                <div style="background: #e8f0fe; height: 100%; padding: 10px; box-sizing: border-box;">Top</div>
            </template>
            <template #bottom>
                <div style="background: #e8f0fe; height: 100%; padding: 10px; box-sizing: border-box;">Bottom</div>
            </template>
            <template #left>
                <div style="background: #fef7e0; height: 100%; padding: 10px; box-sizing: border-box;">Left</div>
            </template>
            <template #right>
                <div style="background: #fef7e0; height: 100%; padding: 10px; box-sizing: border-box;">Right</div>
            </template>
            <template #center>
                <div style="background: #fff; height: 100%; padding: 10px; box-sizing: border-box;">Center</div>
            </template>
        </Layout>
    </div>
</template>
