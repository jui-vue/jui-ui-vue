<script setup>
import Datepicker from "../src/components/Datepicker.vue"

function onSelect(date) {
    alert(date)
}

const fiveDaysAgo = new Date(new Date().setDate(new Date().getDate() - 5))
const fiveDaysLater = new Date(new Date().setDate(new Date().getDate() + 5))
</script>

<template>
    <div class="page-header">
        <h1>Datepicker</h1>
    </div>

    <section>
        <h2>Type</h2>
        <p><strong>type</strong> 옵션에 따라 아래의 세 종류의 datepicker을 이용할 수 있습니다. (<strong>daily</strong>이 기본값으로 설정되어 있습니다.)</p>
        <div>
            <div style="display: inline-block; position: relative;">
                <h3>Daily (Default)</h3>
                <Datepicker title-format="yyyy MM" format="yyyy/MM/dd" move-year @select="onSelect" />
            </div>

            <div style="display: inline-block; position: relative;">
                <h3>Monthly</h3>
                <Datepicker type="monthly" size="large" title-format="yyyy" format="yyyy/MM" @select="onSelect" />
            </div>

            <div style="display: inline-block; position: relative;">
                <h3>Yearly</h3>
                <Datepicker type="yearly" size="large" title-format="yyyy" format="yyyy" @select="onSelect" />
            </div>
        </div>
    </section>

    <section>
        <h2>Set the date range</h2>
        <p><strong>minDate</strong>와 <strong>maxDate</strong> prop을 설정하여, 선택할 수 있는 날짜를 제한할 수 있습니다.</p>
        <div>
            <div style="display: inline-block; position: relative;">
                <Datepicker
                    title-format="yyyy MM"
                    format="yyyy/MM/dd"
                    :min-date="fiveDaysAgo"
                    :max-date="fiveDaysLater"
                    @select="onSelect"
                />
            </div>
        </div>
    </section>

    <section>
        <h2>Custom cell (#cell slot)</h2>
        <p>원본의 tpl.date 템플릿(주말 색상 강조)은 #cell scoped slot으로 대체했습니다.</p>
        <div>
            <div style="display: inline-block; position: relative;">
                <Datepicker title-format="yyyy. MM" format="yyyy-MM-dd" @select="onSelect">
                    <template #cell="{ type, no, day }">
                        <span v-if="type !== 'none'" :style="{ color: day === 0 ? 'red' : day === 6 ? 'blue' : undefined }">{{ no }}</span>
                    </template>
                </Datepicker>
            </div>
        </div>
    </section>
</template>
