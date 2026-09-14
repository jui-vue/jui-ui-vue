<script setup>
import { ref } from "vue"
import Select from "../src/components/Select.vue"

// 원본의 html: function(){ return $dom } (jQuery 반환)은 Vue에서 jQuery가 없으니
// 그냥 HTML 문자열을 반환하도록 바꿨다 — v-html이 문자열을 기대하기 때문.
const items = [
    { value: "jennifer", text: "Jennifer" },
    { value: "dark", text: "Dark" },
    { value: "pastel", html: "<strong>Pastel</strong>" },
    { value: "pattern", text: "Pattern" },
    { type: "divider" },
    {
        value: "gradient",
        html: () =>
            '<img src="https://placehold.co/20x20" width="20" height="20" style="vertical-align: middle;" /> <span style="color: #b08b00;">Gradient</span>'
    }
]

const theme1 = ref(undefined)
const theme2 = ref(undefined)
const theme3 = ref(undefined)
const themeMulti = ref([])

function onChange(value) {
    console.log(value)
}
</script>

<template>
    <div class="container">
        <div class="left">
            <h3>SelectBox</h3>
            <div>
                <Select v-model="theme1" :items="items" placeholder="THEME" @change="onChange" />
            </div>
        </div>
    </div>

    <div class="container">
        <div class="left">
            <h3>Align : right</h3>
            <div style="text-align: right;">
                <Select v-model="theme2" :items="items" align="right" />
            </div>
        </div>
    </div>

    <div class="container">
        <div class="left">
            <h3>Vertical Align : bottom</h3>
            <div>
                <Select v-model="theme3" :items="items" valign="bottom" placeholder="THEME" @change="onChange" />
            </div>
        </div>
    </div>

    <div class="container">
        <div class="left">
            <h3>Multi : true</h3>
            <div>
                <Select v-model="themeMulti" :items="items" multi @change="onChange" />
            </div>
        </div>
    </div>
</template>
