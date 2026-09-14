<script setup>
import { ref, computed, watch } from "vue"

// 원본(timepicker.js)은 하나의 컴포넌트가 마크업에 .year/.month/.date가 있으면 "날짜" 모드,
// .hours/.minutes가 있으면 위/아래 스피너까지 딸린 "시간" 모드로 동작했다(둘 다 있으면 스피너는
// hours/minutes 둘 다 있을 때만 붙음). Vue 버전은 mode prop으로 명시적으로 나눈다.
function pad(v) {
    return v < 10 ? `0${v}` : `${v}`
}

function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
}

const now = new Date()

const props = defineProps({
    mode: {
        type: String,
        default: "date" // date(year/month/date) | time(hours/minutes, 위아래 스피너 포함)
    },
    modelValue: {
        // date 모드: { year, month, date } / time 모드: { hours, minutes }
        type: Object,
        default: undefined
    },
    minYear: {
        type: Number,
        default: 2015
    },
    maxYear: {
        type: Number,
        default: 2020
    },
    size: {
        type: String,
        default: "normal" // large | normal | small | mini
    }
})

const emit = defineEmits(["update:modelValue", "change"])

function defaultValue() {
    return props.mode === "date"
        ? { year: now.getFullYear(), month: now.getMonth() + 1, date: now.getDate() }
        : { hours: now.getHours(), minutes: now.getMinutes() }
}

const internal = ref({ ...defaultValue(), ...props.modelValue })
watch(
    () => props.modelValue,
    (v) => {
        if (v) internal.value = { ...internal.value, ...v }
    },
    { deep: true }
)

function range(field) {
    if (field === "year") return [props.minYear, props.maxYear]
    if (field === "month") return [1, 12]
    if (field === "date") return [1, daysInMonth(internal.value.year, internal.value.month)]
    if (field === "hours") return [0, 23]
    if (field === "minutes") return [0, 59]
    return [0, 99]
}

function clamp(field, value) {
    const [min, max] = range(field)
    if (Number.isNaN(value)) return min
    if (value > max) return max
    if (value < min) return min
    return value
}

function commit() {
    emit("update:modelValue", { ...internal.value })
    emit("change", { ...internal.value })
}

function setField(field, value, { silent } = {}) {
    internal.value = { ...internal.value, [field]: clamp(field, value) }
    if (!silent) commit()
}

const focusedField = ref(props.mode === "date" ? "year" : "hours")

function onFocus(field) {
    focusedField.value = field
}

function onKeyup(field, e) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return
    const dist = e.key === "ArrowUp" ? 1 : -1
    setField(field, (internal.value[field] || 0) + dist, { silent: true })
}

function onBlur(field, e) {
    const value = parseInt(e.target.value, 10)
    setField(field, value)
}

function onSpin(dist) {
    setField(focusedField.value, (internal.value[focusedField.value] || 0) + dist)
}

const fields = computed(() => (props.mode === "date" ? ["year", "month", "date"] : ["hours", "minutes"]))

function maxlength(field) {
    return field === "year" ? 4 : 2
}

/** 원본 getYear/getMonth/.../setYear/setMonth/... 대응 */
function makeAccessor(field) {
    return {
        get: () => internal.value[field],
        set: (v) => setField(field, v)
    }
}
defineExpose({
    year: makeAccessor("year"),
    month: makeAccessor("month"),
    date: makeAccessor("date"),
    hours: makeAccessor("hours"),
    minutes: makeAccessor("minutes")
})
</script>

<template>
    <div class="timepicker" :class="[size, { calendar: mode === 'date' }]">
        <template v-for="(field, i) in fields" :key="field">
            <span v-if="i > 0">{{ mode === "date" ? "-" : " : " }}</span>
            <input
                type="text"
                :class="field"
                :maxlength="maxlength(field)"
                :value="field === 'year' ? internal.year : pad(internal[field])"
                @focus="onFocus(field)"
                @keyup="onKeyup(field, $event)"
                @blur="onBlur(field, $event)"
            />
        </template>
        <i :class="mode === 'date' ? 'icon-calendar' : 'icon-arrow7'"></i>
        <template v-if="mode === 'time'">
            <div style="position: absolute; right: 2px; top: 0; width: 12px; height: 50%; cursor: pointer;" @mouseup="onSpin(1)"></div>
            <div style="position: absolute; right: 2px; bottom: 0; width: 12px; height: 50%; cursor: pointer;" @mouseup="onSpin(-1)"></div>
        </template>
    </div>
</template>
