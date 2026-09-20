<script setup>
import Slider from "../src/components/Slider.vue"

function onChange(data) {
    console.log(data.type, data.from, data.to)
}
</script>

<template>
    <div class="page-header">
        <h1>Slider</h1>
    </div>

    <section>
        <div id="result" style="padding: 10px;">
            <h1>Single Type</h1>

            <div style="overflow: auto;">
                <div class="h">
                    <Slider :from="5" :min="0" :max="10" :step="0.05" :tooltip="true" @change="onChange" />
                    <Slider :from="5" :min="0" :max="10" :step="0.05" :tooltip="true" @change="onChange" />
                </div>

                <div style="height: 300px; float: left;">
                    <Slider orient="vertical" :min="100" :max="1000" :step="10" @change="onChange" />
                </div>
            </div>

            <h1>Double Type</h1>
            <div style="overflow: auto;">
                <div class="double">
                    <Slider type="double" :from="1" :to="5" :min="-10" :max="10" @change="onChange" />
                </div>

                <div style="width: 300px; height: 300px; float: left;">
                    <Slider type="double" orient="vertical" :from="1" :to="3" :min="0" :max="10" @change="onChange" />
                </div>
            </div>
        </div>
    </section>

    <section>
        <h1>Only style</h1>
        <div class="slider horizontal">
            <div class="track">
                <div class="progress" style="width: 50%;"></div>
                <div class="handle from" style="left: 50%;"></div>
            </div>
        </div>
    </section>
</template>
