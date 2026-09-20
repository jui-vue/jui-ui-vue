<script setup>
import { ref } from "vue"
import TimePicker from "../src/components/TimePicker.vue"

// 원본은 4개 컬럼(large/normal/small/mini)을 보여주는데, small 컬럼만 실제로 JS가 붙는다
// (timepicker_date/timepicker_time). 나머지는 정적 마크업 크기 비교용이라 그대로 둔다.
const date1 = ref({ year: 2017, month: 5, date: 1 })
const time1 = ref({ hours: 0, minutes: 0 })

const date2 = ref({ year: 2017, month: 5, date: 1 })
const time2 = ref({ hours: 0, minutes: 0 })

// 원본 markup의 작은(small) 컬럼은 실제로 JS가 붙는 유일한 컬럼인데, 초기화 시
// UI.setup() 기본값(오늘 날짜/현재 시각)이 마크업의 value 속성을 덮어써버려서
// (jui.ready에서 옵션을 하나도 안 넘김) 결과적으로 "오늘/지금"이 뜬다 — 그대로 재현.
const date3 = ref(undefined)
const time3 = ref(undefined)

const date4 = ref({ year: 2017, month: 5, date: 1 })
const time4 = ref({ hours: 0, minutes: 0 })
</script>

<template>
    <div class="page-header">
        <h1>Timepicker</h1>
    </div>

    <div class="row">
        <div class="col col-3">
            <p>Classic, Large</p>
            <div class="row">
                <TimePicker v-model="date1" mode="date" size="large" />
                <TimePicker v-model="time1" mode="time" size="large" />
            </div>
        </div>

        <div class="col col-3">
            <p>Classic, Normal</p>
            <div class="row">
                <TimePicker v-model="date2" mode="date" size="normal" />
                <TimePicker v-model="time2" mode="time" size="normal" />
            </div>
        </div>

        <div class="col col-3">
            <p>Classic, Small</p>
            <div class="row">
                <TimePicker v-model="date3" mode="date" size="small" />
                <TimePicker v-model="time3" mode="time" size="small" />
            </div>
        </div>

        <div class="col col-3">
            <p>Classic, Mini</p>
            <div class="row">
                <TimePicker v-model="date4" mode="date" size="mini" />
                <TimePicker v-model="time4" mode="time" size="mini" />
            </div>
        </div>
    </div>
</template>
