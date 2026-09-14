<script setup>
import { ref } from "vue"
import Dropdown from "../src/components/Dropdown.vue"

const dd1 = ref(false)
function onDd1Change(data) {
    alert(data.value + ", " + data.text)
}

const dd2 = ref(false)
function onDd2Change(data) {
    alert(data.value + ", " + data.text)
}

const dd3 = ref(false)
function onDd3Change(data) {
    alert(data.value + ", " + data.text)
}

const dd4 = ref(false)
const dd4Items = ref([
    { value: 1, text: "text1" },
    { value: 2, text: "text2" },
    { value: 3, text: "text3" }
])
function onDd4Change(data) {
    alert(data.value + ", " + data.text)
}
function dd4Update() {
    dd4Items.value = [
        { value: 4, text: "text4" },
        { value: 5, text: "text5" },
        { value: 6, text: "text6" }
    ]
}
</script>

<template>
    <div class="page-header">
        <h1>Dropdown</h1>
        <p class="br">드롭다운은 콤보박스와 네비게이션, 테이블 등 다수의 UI 컴포넌트에서 응용해서 사용하는 활용도 높은 UI 컴포넌트입니다.</p>
    </div>

    <section>
        <h2>Default</h2>
        <p>
            아래는 드롭다운 컴포넌트의 기본이며 각각의 요소에는 <strong>value</strong>를 지정할 수 있습니다. (숫자 형태만 가능)

            <div style="display: inline-block; position: relative;">
                <div class="group">
                    <button class="btn" @click="dd1 = true">Show</button>
                    <button class="btn" @click="dd1 = false">Hide</button>
                </div>

                <Dropdown v-model="dd1" size="large" :width="150" @change="onDd1Change">
                    <li class="disabled" value="1">Dropdown 1</li>
                    <li class="divider"></li>
                    <li value="2">Dropdown 2</li>
                    <li value="3">Dropdown 3</li>
                    <li value="4">Dropdown 4</li>
                </Dropdown>
            </div>
        </p>
    </section>

    <section>
        <h2>Anchor + Close</h2>
        <p>
            만약에 드롭다운에 말풍선 효과를 주고 싶다면 <strong>anchor</strong> prop을 true로 주면 됩니다.<br />
            그리고 말풍선 효과를 우측으로 하고 싶다면 <strong>anchor-right</strong> prop을 추가하면 됩니다.

            <div style="display: inline-block; position: relative;">
                <div class="group">
                    <button class="btn" @click="dd2 = true">Show</button>
                    <button class="btn" @click="dd2 = false">Hide</button>
                </div>

                <Dropdown v-model="dd2" size="large" :close="false" anchor :width="150" @change="onDd2Change">
                    <li value="1"><a>Dropdown 1</a></li>
                    <li class="divider"></li>
                    <li value="2"><a>Dropdown 2</a></li>
                    <li value="3"><a>Dropdown 3</a></li>
                    <li value="4"><a>Dropdown 4</a></li>
                </Dropdown>
            </div>
        </p>
    </section>

    <section>
        <h2>Style + Keydown</h2>
        <p>
            만약에 드롭다운을 화면 우측에서 보여주게 되면 메뉴의 일부가 가려지는 문제가 발생할 수 있습니다.<br />
            이럴 경우에는 <strong>margin-left</strong> 스타일 값을 음수로 주면 해결할 수 있습니다.

            <div class="navbar" style="overflow: hidden;">
                <div class="inline right">
                    <a class="btn small" @click="dd3 = true">Menu List <i class="icon-arrow1 icon-white"></i></a>

                    <Dropdown v-model="dd3" :keydown="true" anchor :width="120" style="margin-left: -15px;" @change="onDd3Change">
                        <li value="1">Dropdown 1</li>
                        <li value="2">Dropdown 2</li>
                        <li class="divider"></li>
                        <li value="3">Dropdown 3</li>
                        <li value="4">Dropdown 4</li>
                    </Dropdown>
                </div>
            </div>

            <p class="br">
                <strong>keydown</strong> prop을 true로 주면 키보드 방향키를 통해서도 리스트를 선택할 수 있습니다.
            </p>
        </p>
    </section>

    <section>
        <h2>Update</h2>
        <p>
            드롭다운은 마크업 뿐만이 아니라 순수 데이터(items prop)로도 리스트를 구성할 수 있습니다.

            <div class="navbar" style="overflow: hidden;">
                <div class="inline right">
                    <a class="btn small" @click="dd4Update">Update</a>
                    <a class="btn small" @click="dd4 = true">Menu List <i class="icon-arrow1 icon-white"></i></a>

                    <Dropdown v-model="dd4" anchor :width="120" :items="dd4Items" @change="onDd4Change" />
                </div>
            </div>
        </p>
        <p>Update 버튼을 클릭하면 드롭다운 리스트를 변경할 수 있습니다(items prop을 교체 — 원본의 update() 메서드에 대응).</p>
    </section>
</template>
