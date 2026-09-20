<script setup>
// 원본(datepicker.js)의 tpl.date/tpl.dates(마크업 템플릿 기반 셀 렌더링)는 Vue의 #cell
// scoped slot으로 대체했다(Dropdown/Select와 동일한 방향의 단순화) — day(0=일~6=토)/type
// (""/"now"/"active"/"none")/no(날짜·월·연도 숫자)를 슬롯 프롭으로 넘겨준다.
// .datepicker와 .calendar는 원본에서 동일한 컴포넌트에 CSS 클래스만 다르게 준 스킨 차이라
// (datepicker.less vs calendar.less), variant prop으로 그 둘을 고른다.
import { ref, computed, watch } from "vue"
import { dateFormat } from "jui-core-ts"
import { getStartDate, getLastDate } from "../utils/date.js"

const props = defineProps({
    type: { type: String, default: "daily" }, // 'daily' | 'monthly' | 'yearly'
    variant: { type: String, default: "datepicker" }, // 'datepicker' | 'calendar'
    size: { type: String, default: "normal" }, // 'normal' | 'large'
    modelValue: { type: Date, default: null }, // v-model — 선택된 날짜
    titleFormat: { type: String, default: "yyyy.MM" },
    format: { type: String, default: "yyyy-MM-dd" },
    minDate: { type: Date, default: null },
    maxDate: { type: Date, default: null },
    moveYear: { type: Boolean, default: false } // head에 prev-year/next-year(≪/≫) 버튼 표시
})
const emit = defineEmits(["update:modelValue", "select", "prev", "next", "reload"])

function today() {
    return getStartDate(new Date())
}

const selDate = ref(props.modelValue ? getStartDate(props.modelValue) : today())
const viewYear = ref(selDate.value.getFullYear())
const viewMonth = ref(selDate.value.getMonth() + 1)

function checkDate(y, m, d) {
    if (props.minDate) {
        const minY = props.minDate.getFullYear(),
            minM = props.minDate.getMonth() + 1,
            minD = props.minDate.getDate()
        if (y < minY || (y === minY && m < minM)) return [minY, minM, minD]
    }
    if (props.maxDate) {
        const maxY = props.maxDate.getFullYear(),
            maxM = props.maxDate.getMonth() + 1,
            maxD = props.maxDate.getDate()
        if (y > maxY || (y === maxY && m > maxM)) return [maxY, maxM, maxD]
    }
    return [y, m, d]
}

function getDateList(y, m) {
    const cells = []
    let no = 1
    const d = new Date()
    const mm = m < 10 ? "0" + m : String(m)
    const start = new Date(y + "-" + mm).getDay()
    let ldate = getLastDate(y, m)
    let sdate = 0

    const prevYear = m === 1 ? y - 1 : y
    const prevMonth = m === 1 ? 12 : m - 1
    const prevLastDay = getLastDate(prevYear, prevMonth)

    if (props.minDate && props.minDate.getFullYear() === y && props.minDate.getMonth() + 1 === m) {
        sdate = props.minDate.getDate()
    }
    if (props.maxDate && props.maxDate.getFullYear() === y && props.maxDate.getMonth() + 1 === m) {
        ldate = props.maxDate.getDate()
    }

    for (let i = 0; i < start; i++) {
        cells[i] = { type: "none", no: prevLastDay - start + (i + 1), day: i % 7 }
    }
    for (let i = start; i < 42; i++) {
        if (sdate <= no && no <= ldate) {
            let type = ""
            if (d.getMonth() + 1 === m && d.getDate() === no) type = "now"
            if (selDate.value && selDate.value.getFullYear() === y && selDate.value.getMonth() + 1 === m && selDate.value.getDate() === no) {
                type = "active"
            }
            cells[i] = { type, no, day: i % 7 }
            no++
        } else if (no > ldate) {
            // 이번 달의 실제 마지막 날(getLastDate) 이후 = 다음 달로 넘어간 채움 칸
            cells[i] = { type: "none", no: no - ldate, day: i % 7 }
            no++
        } else {
            // no < sdate: minDate 이전이라 선택 불가능할 뿐, 여전히 "이번 달의 그 날짜"다.
            // 원본은 이 경우도 위 분기와 같은 `no - ldate` 공식을 써서 음수가 표시되는
            // 버그가 있었다(예: minDate가 이번 달 10일이면 1~9일이 -30, -29... 로 표시됨) —
            // 달력 UI에서 음수 표시는 명백히 의도된 동작일 수 없으므로 실제 날짜 숫자를 쓰도록 고쳤다.
            cells[i] = { type: "none", no, day: i % 7 }
            no++
        }
    }
    return cells
}

function getMonthList(y) {
    const d = new Date()
    const cells = []
    for (let i = 1; i <= 12; i++) {
        let type = ""
        if (d.getFullYear() === y && d.getMonth() + 1 === i) type = "now"
        if (selDate.value && selDate.value.getFullYear() === y && selDate.value.getMonth() + 1 === i) type = "active"
        cells.push({ type, no: i })
    }
    return cells
}

function getYearList(y) {
    const d = new Date()
    const cells = []
    const startYear = y - 4
    for (let i = startYear; i < startYear + 12; i++) {
        let type = ""
        if (d.getFullYear() === i) type = "now"
        if (selDate.value && selDate.value.getFullYear() === i) type = "active"
        cells.push({ type, no: i })
    }
    return cells
}

const cells = computed(() => {
    if (props.type === "daily") return getDateList(viewYear.value, viewMonth.value)
    if (props.type === "monthly") return getMonthList(viewYear.value)
    return getYearList(viewYear.value)
})

// daily는 7칸씩(요일), monthly/yearly는 3칸씩 줄바꿈
const rows = computed(() => {
    const size = props.type === "daily" ? 7 : 3
    const result = []
    for (let i = 0; i < cells.value.length; i += size) {
        result.push(cells.value.slice(i, i + size))
    }
    return result
})

const title = computed(() => {
    if (props.type === "yearly") return ""
    let d
    if (props.type === "daily") {
        const mm = viewMonth.value < 10 ? "0" + viewMonth.value : String(viewMonth.value)
        d = new Date(viewYear.value + "/" + mm + "/01")
    } else if (props.type === "monthly") {
        d = new Date(viewYear.value + "/01/01")
    } else {
        d = new Date()
    }
    return dateFormat(getStartDate(d), props.titleFormat)
})

function page(y, m) {
    if (props.type === "daily") {
        viewYear.value = y
        viewMonth.value = m
    } else {
        viewYear.value = y
    }
}

function prev(moveYearFlag) {
    if (props.type === "daily") {
        let y, m
        if (moveYearFlag) {
            y = viewYear.value - 1
            m = viewMonth.value
        } else {
            y = viewMonth.value === 1 ? viewYear.value - 1 : viewYear.value
            m = viewMonth.value === 1 ? 12 : viewMonth.value - 1
        }
        if (props.minDate && props.minDate.getFullYear() === viewYear.value && props.minDate.getMonth() + 1 === viewMonth.value) {
            return
        }
        page(y, m)
    } else if (props.type === "monthly") {
        page(viewYear.value - 1)
    } else {
        page(viewYear.value - 12)
    }
    emit("prev")
}

function next(moveYearFlag) {
    if (props.type === "daily") {
        let y, m
        if (moveYearFlag) {
            y = viewYear.value + 1
            m = viewMonth.value
        } else {
            y = viewMonth.value === 12 ? viewYear.value + 1 : viewYear.value
            m = viewMonth.value === 12 ? 1 : viewMonth.value + 1
        }
        if (props.maxDate && props.maxDate.getFullYear() === viewYear.value && props.maxDate.getMonth() + 1 === viewMonth.value) {
            return
        }
        page(y, m)
    } else if (props.type === "monthly") {
        page(viewYear.value + 1)
    } else {
        page(viewYear.value + 12)
    }
    emit("next")
}

function selectCell(cell) {
    if (cell.type === "none") return

    if (props.type === "daily") {
        const mm = viewMonth.value < 10 ? "0" + viewMonth.value : String(viewMonth.value)
        const dd = cell.no < 10 ? "0" + cell.no : String(cell.no)
        selDate.value = getStartDate(new Date(viewYear.value + "/" + mm + "/" + dd))
    } else if (props.type === "monthly") {
        const mm = cell.no < 10 ? "0" + cell.no : String(cell.no)
        selDate.value = getStartDate(new Date(viewYear.value + "/" + mm + "/01"))
    } else {
        selDate.value = getStartDate(new Date(cell.no + "/01/01"))
    }

    emit("update:modelValue", selDate.value)
    emit("select", getFormat(), selDate.value)
}

function select(yOrDate, m, d) {
    let y = viewYear.value,
        mm = viewMonth.value,
        dd = selDate.value ? selDate.value.getDate() : 1

    if (arguments.length === 3) {
        y = yOrDate
        mm = m
        dd = d
    } else if (arguments.length === 1) {
        const time = yOrDate instanceof Date ? yOrDate : new Date(yOrDate)
        y = time.getFullYear()
        mm = time.getMonth() + 1
        dd = time.getDate()
    }

    if (props.type === "daily") {
        if (props.minDate || props.maxDate) {
            const checked = checkDate(y, mm, dd)
            y = checked[0]
            mm = checked[1]
            dd = checked[2]
        }
        page(y, mm)
        selectCell({ type: "", no: dd })
    } else if (props.type === "monthly") {
        page(y)
        selectCell({ type: "", no: mm })
    } else {
        page(y)
        selectCell({ type: "", no: y })
    }
}

function addTime(time) {
    const base = selDate.value ? selDate.value.getTime() : Date.now()
    const t = time instanceof Date ? time.getTime() : base + time
    select(new Date(t))
}

function getDate() {
    return selDate.value
}
function getTime() {
    return selDate.value ? selDate.value.getTime() : null
}
function getFormat(format) {
    return dateFormat(selDate.value, typeof format === "string" ? format : props.format)
}
function reload() {
    select(selDate.value)
    emit("reload")
}

watch(
    () => props.modelValue,
    (v) => {
        if (v && (!selDate.value || v.getTime() !== selDate.value.getTime())) {
            select(v)
        }
    }
)

defineExpose({ page, prev, next, select, addTime, getDate, getTime, getFormat, reload })
</script>

<template>
    <div :class="{ [variant]: true, [size]: size !== 'normal' }">
        <div class="head" :class="{ 'move-year': moveYear }">
            <div v-if="moveYear" class="prev-year" @click="prev(true)">&laquo;</div>
            <div class="prev" @click="prev(false)"><i v-if="variant === 'datepicker'" class="icon-chevron-left"></i></div>
            <div class="title">{{ title }}</div>
            <div class="next" @click="next(false)"><i v-if="variant === 'datepicker'" class="icon-chevron-right"></i></div>
            <div v-if="moveYear" class="next-year" @click="next(true)">&raquo;</div>
        </div>
        <table class="body">
            <tbody>
                <tr v-if="type === 'daily'" :key="-1">
                    <th>{{ variant === 'calendar' ? 'SUN' : 'SU' }}</th>
                    <th>{{ variant === 'calendar' ? 'MON' : 'MO' }}</th>
                    <th>{{ variant === 'calendar' ? 'TUE' : 'TU' }}</th>
                    <th>{{ variant === 'calendar' ? 'WED' : 'WE' }}</th>
                    <th>{{ variant === 'calendar' ? 'THU' : 'TH' }}</th>
                    <th>{{ variant === 'calendar' ? 'FRI' : 'FR' }}</th>
                    <th>{{ variant === 'calendar' ? 'SAT' : 'SA' }}</th>
                </tr>
                <tr v-for="(row, ri) in rows" :key="ri">
                    <td v-for="(cell, ci) in row" :key="ci" :class="cell.type" @click="selectCell(cell)">
                        <slot name="cell" :type="cell.type" :no="cell.no" :day="ci">{{ cell.no }}</slot>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
