<script setup>
import { ref } from "vue"
import Colorpicker from "../src/components/Colorpicker.vue"

const color1 = ref("#000")

function onChange(c, rgb) {
    console.log(c, rgb)
}
function onEnter(c, rgb) {
    console.log("enter", c, rgb)
}
</script>

<template>
    <div id="colorpicker1" class="colorpicker-wrap">
        <Colorpicker v-model="color1" @change="onChange" @enter="onEnter" />
    </div>
</template>
