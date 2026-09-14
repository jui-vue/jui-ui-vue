<script setup>
import { ref } from "vue"
import Progress from "../src/components/Progress.vue"

// 원본: progress(".progress", { value: 50, striped: true, animated: true }) — 페이지의
// 모든 .progress에 동일 옵션을 적용한다. init() 시점에 항상 opts.value(50)로 덮어써서,
// 마크업에 있던 30%/100% 같은 초기 bar 폭은 실제로는 전부 50%로 바뀐다(variant 클래스만 마크업 그대로 유지).
const v = ref(50)
</script>

<template>
    <h1>No Body 1</h1>
    <div style="width:300px;">
        <Progress v-model="v" variant="flat" striped animated />
    </div>

    <h1>No Body 2</h1>
    <div style="width:300px;">
        <Progress v-model="v" variant="simple" striped animated />
    </div>

    <h1>Flat</h1>
    <div style="width:300px;">
        <Progress v-model="v" variant="flat" striped animated />
    </div>

    <h1>Simple</h1>
    <div style="width:300px">
        <Progress v-model="v" variant="simple" striped animated />
    </div>

    <h1>Simple & Flat</h1>
    <div style="width:300px">
        <Progress v-model="v" variant="simple flat" striped animated />
    </div>
</template>
