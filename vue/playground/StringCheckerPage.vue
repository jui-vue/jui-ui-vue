<script setup>
import { ref } from "vue"
import StringChecker from "../src/components/StringChecker.vue"

// 원본: stringchecker("input[type=text]", { event: { invalid: (type, value) => { console.log(type, value); return type } }, validBlank: true })
function onInvalid(type, value) {
    console.log(type, value)
}

const v1 = ref("1")
const v2 = ref("2")
const v3 = ref("3")
</script>

<template>
    <div class="page-header">
        <h1>String Checker</h1>
    </div>

    <div class="row">
        <StringChecker v-model="v1" valid-blank @invalid="onInvalid" />
        <StringChecker v-model="v2" valid-blank @invalid="onInvalid" />
        <StringChecker v-model="v3" valid-blank @invalid="onInvalid" />
    </div>
</template>
