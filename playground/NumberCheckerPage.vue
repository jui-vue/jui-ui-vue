<script setup>
import { ref } from "vue"
import NumberChecker from "../src/components/NumberChecker.vue"

// 원본: numberchecker("input", { integer: true, empty: "min", min: 0 }) — 페이지의 모든 input에 동일 옵션 적용
const v1 = ref(1)
const v2 = ref(2)
const v3 = ref(null)
</script>

<template>
    <div class="page-header">
        <h1>Numberchecker</h1>
    </div>

    <div class="row">
        <NumberChecker v-model="v1" integer empty="min" :min="0" style="width: 200px;" />
        <NumberChecker v-model="v2" integer empty="min" :min="0" />
        <NumberChecker v-model="v3" integer empty="min" :min="0" />
    </div>

    <p>v1 = {{ v1 }} · v2 = {{ v2 }} · v3 = {{ v3 }}</p>
</template>
