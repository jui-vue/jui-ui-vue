<script setup>
import { ref, reactive } from "vue"
import Accordion from "../src/components/Accordion.vue"

const LOREM = "The style components provide various options in addition to the basic functionality. In addition, script components can be added, which facilitate the development of more diverse UI components."

// 원본 데모의 event.open 핸들러: 열린 title의 아이콘만 icon-arrow3(펼침)으로, 나머지는 icon-arrow1(접힘)으로
function makeIconState(count, openIndex) {
    return Array.from({ length: count }, (_, i) => (i === openIndex ? "icon-arrow3" : "icon-arrow1"))
}

// Classic, Normal — 원본 첫 예제는 title 2/3에 content가 없어 공유 content가 이동하는
// 구조적 한계가 있었는데, Vue 버전은 데이터 기반이라 각 title에 자기 content를 정상적으로 둔다.
// (item.content는 Accordion이 동적 컴포넌트 자리로 예약해둔 필드라 단순 텍스트는 text로 따로 둔다)
const items1 = [
    { title: "Group Item #1", value: "a", text: LOREM },
    { title: "Group Item #2", value: "b", text: LOREM },
    { title: "Group Item #3", value: "c", text: LOREM }
]
const open1 = ref(1)
const icons1 = reactive(makeIconState(3, 1))
function onOpen1(index) {
    icons1.splice(0, icons1.length, ...makeIconState(3, index))
}

// Classic, Large
const items2 = items1
const open2 = ref(0)
const icons2 = reactive(makeIconState(3, 0))
function onOpen2(index) {
    icons2.splice(0, icons2.length, ...makeIconState(3, index))
}

// Simple, Normal / Simple, Large — 원본은 아이콘이 없다
const items3 = items1
const open3 = ref(0)
const items4 = items1
const open4 = ref(0)

// Support Multi Panel
const items5 = [
    { title: "Group Item #1", value: "a", text: "First Accordion" },
    { title: "Group Item #2", value: "b", text: "Second Accordion" },
    { title: "Group Item #3", value: "c", text: "Three Accordion" }
]
const open5 = ref([1]) // 원본 config: index: 1 (Group Item #2)
const icons5 = reactive(makeIconState(3, 1))
function onOpen5(index) {
    icons5[index] = "icon-arrow3"
}
function onFold5(index) {
    icons5[index] = "icon-arrow1"
}
function onInit5() {
    console.log("accordian initialized.")
}
</script>

<template>
    <div class="page-header">
        <h1>Accordion</h1>
    </div>

    <div class="row">
        <div class="col col-3">
            <p>Classic, Normal</p>
            <Accordion :items="items1" v-model="open1" @open="onOpen1">
                <template v-for="item in items1" :key="item.value" #[`content-${item.value}`]>
                    <i class="icon-add-dir"></i> {{ item.text }}
                </template>
                <template #icon="{ index }"><i :class="icons1[index]"></i></template>
            </Accordion>
        </div>

        <div class="col col-3">
            <p>Classic, Large</p>
            <Accordion :items="items2" v-model="open2" size="large" @open="onOpen2">
                <template v-for="item in items2" :key="item.value" #[`content-${item.value}`]>
                    {{ item.text }}
                </template>
                <template #icon="{ index }"><i :class="icons2[index]"></i></template>
            </Accordion>
        </div>

        <div class="col col-3">
            <p>Simple, Normal</p>
            <Accordion :items="items3" v-model="open3" variant="simple">
                <template v-for="item in items3" :key="item.value" #[`content-${item.value}`]>
                    {{ item.text }}
                </template>
            </Accordion>
        </div>

        <div class="col col-3">
            <p>Simple, Large</p>
            <Accordion :items="items4" v-model="open4" variant="simple" size="large">
                <template v-for="item in items4" :key="item.value" #[`content-${item.value}`]>
                    {{ item.text }}
                </template>
            </Accordion>
        </div>

        <div class="col col-3">
            <p>Support Multi Panel</p>
            <Accordion :items="items5" v-model="open5" multipanel @open="onOpen5" @fold="onFold5" @init="onInit5">
                <template v-for="item in items5" :key="item.value" #[`content-${item.value}`]>
                    {{ item.text }}
                </template>
                <template #icon="{ index }"><i :class="icons5[index]"></i></template>
            </Accordion>
        </div>
    </div>
</template>
