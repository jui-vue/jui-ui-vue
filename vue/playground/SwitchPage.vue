<script setup>
import { ref } from "vue"
import Switch from "../src/components/Switch.vue"

// 원본 examples/switch.html: event: { change: function(d) { console.log(d); } }
function onChange(d) {
    console.log(d)
}

const a = ref(false)
const b = ref(false)
const c = ref(false)
const d = ref(false)
</script>

<template>
    <h1>Switch Default Style</h1>
    <Switch v-model="a" @change="onChange" />
    <Switch v-model="b" size="small" @change="onChange" />

    <h1>Switch Inner Style</h1>
    <Switch v-model="c" inner @change="onChange" />
    <Switch v-model="d" inner size="small" @change="onChange" />
</template>
