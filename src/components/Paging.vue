<script setup>
import { ref, computed, watch } from "vue"

// 원본(paging.js)의 changePage() 페이지 범위 계산 로직을 그대로 옮겼다.
// 원본 예시 페이지(examples/paging.html)가 리포에 없어서 pixel 비교 대상은 없고,
// paging.less/paging.theme.less의 마크업 구조(.paging > .prev/.list/.next)만 근거로 삼았다.
const props = defineProps({
    modelValue: {
        // 현재 페이지(1-base). 안 주면 컴포넌트가 내부적으로 1페이지부터 관리한다.
        type: Number,
        default: undefined
    },
    count: {
        // 전체 레코드 수
        type: Number,
        default: 0
    },
    pageCount: {
        // 페이지당 레코드 수
        type: Number,
        default: 10
    },
    screenCount: {
        // 한 화면에 보여줄 페이지 번호 개수
        type: Number,
        default: 5
    },
    size: {
        type: String,
        default: "normal" // normal | large
    }
})

const emit = defineEmits(["update:modelValue", "page", "reload"])

const lastPage = computed(() => Math.max(1, Math.ceil(props.count / props.pageCount)))

const internalPage = ref(props.modelValue ?? 1)
const currentPage = computed(() => props.modelValue ?? internalPage.value)

watch(
    () => props.modelValue,
    (v) => {
        if (v !== undefined) internalPage.value = v
    }
)

// 원본 changePage()의 페이지 번호 목록 계산을 그대로
const pages = computed(() => {
    const last = lastPage.value
    const end = last < props.screenCount ? last : props.screenCount
    let start = currentPage.value - Math.ceil(end / 2) + 1
    if (start < 1) start = 1

    const list = []
    if (last < start + end) {
        for (let i = last - end + 1; i < last + 1; i++) list.push(i)
    } else {
        for (let i = start; i < start + end; i++) list.push(i)
    }
    return list
})

function setPage(pNo, emitEvent) {
    let next = pNo > lastPage.value ? lastPage.value : pNo
    next = pNo < 1 ? 1 : next

    internalPage.value = next
    emit("update:modelValue", next)
    if (emitEvent) emit("page", next)
}

/** 원본 page(pNo) — 인자가 없으면 현재 페이지를 반환 */
function page(pNo) {
    if (!pNo) return currentPage.value
    setPage(pNo, true)
    return undefined
}

/** 원본 next() */
function next() {
    setPage(currentPage.value + 1, true)
}

/** 원본 prev() */
function prev() {
    setPage(currentPage.value - 1, true)
}

/** 원본 first() */
function first() {
    setPage(1, true)
}

/** 원본 last() */
function last() {
    setPage(lastPage.value, true)
}

/** 원본 reload(count) — 총 개수를 바꾸고 1페이지로 되돌린다. count는 count prop을 쓰는 쪽이 권장되지만
 *  원본 API 호환을 위해 인자로도 받는다(단, count prop 자체는 외부에서 갱신해야 실제로 반영된다). */
function reload() {
    setPage(1, false)
    emit("reload")
}

defineExpose({ page, next, prev, first, last, reload })
</script>

<template>
    <div class="paging" :class="size">
        <a class="prev" href="javascript:void(0)" @click="prev"></a>
        <div class="list">
            <template v-for="(p, idx) in pages" :key="p">
                <!-- v-for가 반복하는 노드 사이에는 자연스러운 공백 텍스트 노드가 없다(ButtonGroup.vue와
                     같은 이유) - 원본의 줄바꿈 마크업이 만드는 공백을 보간된 텍스트로 재현한다. -->
                {{ idx > 0 ? " " : "" }}<a
                    class="page"
                    :class="{ active: p === currentPage }"
                    href="javascript:void(0)"
                    @click="setPage(p, true)"
                >{{ p }}</a>
            </template>
        </div>
        <a class="next" href="javascript:void(0)" @click="next"></a>
    </div>
</template>
