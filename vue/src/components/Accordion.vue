<script setup>
import { ref, computed, onMounted } from "vue"

// 원본(accordion.js)은 non-multipanel 모드에서 .content 엘리먼트를 클릭한 title 뒤로
// insertAfter해서 옮기는 방식이라, title마다 자기 content가 따로 있으면 제대로 동작하지
// 않는 구조적 한계가 있었다(데모도 사실상 content 1개를 공유하는 경우만 정상 동작).
// Vue 버전은 item마다 title/content를 갖는 데이터 기반으로 다시 설계했고, multipanel도
// 동시에 여러 패널이 열려야 하므로 Tab과 동일하게 모든 콘텐츠를 렌더링해두고 v-show로 토글한다.
const props = defineProps({
    items: {
        // { title, value?, content?, contentProps? }
        type: Array,
        required: true
    },
    modelValue: {
        // multipanel=false: 열린 패널의 index(Number|null) / multipanel=true: 열린 패널들의 index 배열
        type: [Number, Array],
        default: undefined
    },
    multipanel: {
        type: Boolean,
        default: false
    },
    autoFold: {
        // 열려 있는 title을 다시 클릭하면 접는다
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: "normal" // normal | large
    },
    variant: {
        type: String,
        default: "classic" // classic | simple
    }
})

const emit = defineEmits(["update:modelValue", "open", "fold", "init"])

const internalValue = ref(props.modelValue !== undefined ? props.modelValue : props.multipanel ? [] : null)
const currentValue = computed(() => (props.modelValue !== undefined ? props.modelValue : internalValue.value))

function isOpen(index) {
    if (props.multipanel) {
        return Array.isArray(currentValue.value) && currentValue.value.includes(index)
    }
    return currentValue.value === index
}

function setValue(next) {
    internalValue.value = next
    emit("update:modelValue", next)
}

function onTitleClick(index, item, e) {
    if (isOpen(index) && props.autoFold) {
        const next = props.multipanel ? currentValue.value.filter((i) => i !== index) : null
        setValue(next)
        emit("fold", index, e)
        return
    }

    const next = props.multipanel
        ? currentValue.value.includes(index)
            ? currentValue.value
            : [...currentValue.value, index]
        : index
    setValue(next)
    emit("open", index, e)
}

onMounted(() => emit("init"))

/** 원본 activeIndex() 대응. 원본은 항상 0을 반환하는 죽은 코드였는데, 여기서는 실제 열린
 *  인덱스(멀티패널이면 배열)를 반환하도록 고쳤다. */
function activeIndex() {
    return currentValue.value
}

defineExpose({ activeIndex })
</script>

<template>
    <div class="accordion" :class="[variant, size]">
        <template v-for="(item, index) in items" :key="item.value ?? index">
            <div class="title" :class="{ active: isOpen(index) }" @click="onTitleClick(index, item, $event)">
                {{ item.title }}
                <slot name="icon" :index="index" :open="isOpen(index)" />
            </div>
            <div v-show="isOpen(index)" class="content">
                <component
                    :is="item.content"
                    v-if="typeof item.content === 'object' || typeof item.content === 'function'"
                    v-bind="item.contentProps"
                />
                <slot v-else :name="`content-${item.value ?? index}`" :item="item" :index="index" />
            </div>
        </template>
    </div>
</template>
