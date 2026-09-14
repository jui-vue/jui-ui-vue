<script setup>
import Splitter from "../src/components/Splitter.vue"
</script>

<template>
    <div class="page-header">
        <h1>Splitter</h1>
    </div>

    <h3>Splitter for Vertical</h3>
    <div class="container">
        <Splitter>
            <template #first>
                <h3>Left</h3>
            </template>
            <template #second>
                <h3>Right</h3>
            </template>
        </Splitter>
    </div>

    <h3>Splitter for Horizontal</h3>
    <div class="container-2">
        <Splitter direction="horizontal">
            <template #first>
                <h3>Top</h3>
            </template>
            <template #second>
                <h3>Bottom</h3>
            </template>
        </Splitter>
    </div>

    <h3>Border Layout (with minSize)</h3>
    <div class="container-3">
        <Splitter direction="horizontal" :min-size="[100, 300]">
            <template #first>
                <h3>Top</h3>
            </template>
            <template #second>
                <Splitter direction="horizontal" :min-size="[200, 100]">
                    <template #first>
                        <Splitter :min-size="[100, 200]" fixed>
                            <template #first> Left </template>
                            <template #second>
                                <Splitter :min-size="100">
                                    <template #first> Center </template>
                                    <template #second> Right </template>
                                </Splitter>
                            </template>
                        </Splitter>
                    </template>
                    <template #second>
                        <h3>Bottom</h3>
                    </template>
                </Splitter>
            </template>
        </Splitter>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    position: relative;
    height: 150px;
    border: 1px solid #ececec;
}

.container-2,
.container-3 {
    width: 500px;
    height: 500px;
    position: relative;
    border: 1px solid #ececec;
}

.container h3,
.container-2 h3,
.container-3 h3 {
    padding-left: 20px;
}
</style>
