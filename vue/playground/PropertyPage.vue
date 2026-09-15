<script setup>
import { reactive } from "vue"
import Property from "../src/components/Property.vue"

const prItems = reactive([
    { type: "group", title: "Views", description: "Simple theme select info " },
    { type: "select", title: "Theme", key: "theme", value: "white", items: ["white", "black", "league", "beige", "sky", "night", "serif", "simple", "solarized", "mozila"] },
    { type: "group", title: "Configure" },
    { type: "checkbox", title: "Controls", key: "controls", value: true, description: "Display controls in the bottom right corner" },
    { type: "switch", title: "Controls", key: "controls-2", value: true, description: "Display controls in the bottom right corner" },
    { type: "date", title: "Date Picker", key: "date-picker", description: "select date" },
    { type: "range", title: "Range Controls", key: "range-control", value: 50, min: 0, max: 100, description: "Display controls in the bottom right corner" },
    { type: "range", title: "Range Step", key: "range-step", value: 50, min: 0, max: 100, step: 0.5, description: "Display controls in the bottom right corner" },
    { type: "checkbox", title: "Progress", key: "progress", value: true, description: "Display a presentation progress bar" },
    { type: "number", title: "Auto Slide", key: "autoSlide", value: 0, description: "" }
])

const complexItems = reactive([
    { type: "group", title: "Inner Property", description: "it can be nested property view " },
    {
        type: "property",
        title: "Slider Settings",
        key: "slider-settings",
        items: [
            { type: "group", title: "Information" },
            { title: "Slide ID", key: "slide-id" },
            { type: "group", title: "Background" },
            { type: "colors", title: "Many Colors", key: "colors", value: ["#ff0000", "#00ffff", "#ff00ff"], description: "many colors" },
            { type: "color", title: "Background Color", key: "background-color", value: "", description: "All CSS color formats are supported" },
            { type: "textarea", title: "Many Text", key: "many-text", value: "", description: "Many Text", vertical: true },
            { type: "html", title: "contenteditable", key: "contenteditable", value: "", description: "paste image", vertical: true }
        ]
    },
    { type: "group", title: "Views" },
    { type: "select", title: "Theme", key: "theme", value: "white", items: ["white", "black", "league"] }
])

function onChange(item, newValue, _oldValue) {
    console.log("item:", item)
    console.log("all items", newValue)
}
</script>

<template>
    <div class="page-header">
        <h1>PropertyView</h1>
    </div>

    <div class="container" style="width: 100%; position: relative; height: 500px;">
        <div style="position: absolute; left: 0px; bottom: 0px; top: 0px; width: 500px; box-sizing: border-box; border: 1px solid #ececec; margin: 10px; overflow: auto;">
            <h3 style="padding-left: 20px;">Presentation Settings</h3>
            <Property class="property" :items="prItems" @change="onChange" />
        </div>
    </div>

    <div class="container" style="width: 100%; position: relative;">
        <div class="panel" style="width: 700px;">
            <div class="head"><i class="icon-left"></i> <strong>Complex Settings with Panel</strong></div>
            <div class="body has-property" style="height: 300px;">
                <Property class="property" :items="complexItems" @change="onChange" />
            </div>
        </div>
    </div>
</template>
