<script setup>
import { ref } from "vue"
import AutoComplete from "../src/components/AutoComplete.vue"

const acWords = [
    "ActionScript", "AppleScript", "Asp", "BASIC", "C", "C++", "Clojure", "COBOL",
    "ColdFusion", "Erlang", "Fortran", "Groovy", "Haskell", "Java", "JavaScript",
    "Lisp", "Perl", "PHP", "Python", "Ruby", "Scala", "Scheme"
]
const acWordsHangul = ["자바의 정석", "열혈강의 C++", "유쾌한 심리학"]

const text1 = ref("")

const text2 = ref("")
const ac2Ref = ref(null)
function runUpdate() {
    ac2Ref.value.update(acWordsHangul)
}
</script>

<template>
    <div class="page-header">
        <h1>Auto Complete</h1>
        <p class="br">텍스트박스에 문자열을 입력했을 경우, 해당 값이 포함된 키워드 목록을 보여주는 UI 컴포넌트입니다.</p>
    </div>

    <section>
        <h2>Default</h2>
        <p>
            아래 키워드 중에 입력한 문자가 포함되어 있으면, 드롭다운 메뉴에 키워드 목록이 나타납니다.&nbsp;
            <AutoComplete
                class="group"
                v-model="text1"
                :words="acWords"
                show-all
                :height="100"
                input-style="width: 100px"
            >
                <template #prefix><label class="label small"><i class="icon-search"></i></label></template>
            </AutoComplete>
        </p>
        <p class="br">아래는 자동완성 컴포넌트를 사용하는 코드입니다.</p>
        <pre><code>&lt;AutoComplete v-model="text1" :words="acWords" show-all :height="100" input-style="width: 100px" /&gt;</code></pre>
    </section>

    <section>
        <h2>Update</h2>
        <p>
            <a class="btn btn-gray btn-mini" href="javascript:void(0)" @click="runUpdate">Run</a> -
            좌측 버튼을 클릭하면 아래와 같은 단어 목록으로 변경합니다.&nbsp;
            <AutoComplete class="group" ref="ac2Ref" v-model="text2" :words="acWords" input-style="width: 100px">
                <template #prefix><label class="label small"><i class="icon-search"></i></label></template>
            </AutoComplete>
        </p>
    </section>
</template>
