<script setup>
import { ref } from "vue"
import Modal from "../src/components/Modal.vue"

const showGlobal = ref(false)
const showInner = ref(false)
const showClone = ref(false)
</script>

<template>
    <div class="page-header">
        <h1>Modal</h1>
        <p class="br">윈도우나 로딩과 같은 UI 컴포넌트에서 사용하는 모달을 좀 더 범용적으로 사용할 수 있게 별도의 컴포넌트로 개발하였습니다.</p>
    </div>

    <section>
        <h2>Global</h2>
        <p>
            <a class="btn mini" href="javascript:void(0)" @click="showGlobal = true">Run</a> -
            전체 화면의 중앙에 위치하는 글로벌 모달 기능을 제공합니다.
<pre><code class="language-javascript">&lt;Modal v-model="showGlobal" color="black"&gt;
    &lt;div class="msgbox"&gt;...&lt;/div&gt;
&lt;/Modal&gt;</code></pre>
        </p>

        <Modal v-model="showGlobal" color="black">
            <template #default="{ hide }">
                <div class="msgbox">
                    <div class="head">Title</div>
                    <div class="body">
                        Contents...<br />
                        <div style="text-align: center; margin-top: 45px;">
                            <a href="javascript:void(0)" class="btn btn-purple btn-small">Save</a>
                            <a href="javascript:void(0)" class="btn btn-gray btn-small" @click="hide">Close</a>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>
    </section>

    <section>
        <h2>Inner</h2>
        <p>
            <a class="btn mini" href="javascript:void(0)" @click="showInner = true">Run</a> -
            전체 화면이 대상이 아닌 특정 태그 내부적으로도 모달 기능을 사용할 수 있는 기능을 제공합니다.

            <!-- 이너 모달은 Teleport 없이 제자리에 position:absolute로 그려지므로, 대상과 같은
                 position:relative 컨테이너 안에 Modal을 같이 둬야 한다(target 셀렉터 대신). -->
            <div style="position: relative;">
                <table id="modal_2" class="table table-classic table-stripeless" style="width: 700px;">
                    <thead>
                        <tr><th>No</th><th>Name</th><th>Age</th><th>Location</th></tr>
                    </thead>
                    <tbody>
                        <tr><td style="width: 164px;">0</td><td style="width: 164px;">Hong</td><td style="width: 164px;">20</td><td style="width: 153px;">Ilsan</td></tr>
                        <tr><td>1</td><td>Jung</td><td>30</td><td>Seoul</td></tr>
                        <tr><td>2</td><td>Park</td><td>15</td><td>Yeosu</td></tr>
                    </tbody>
                </table>

                <Modal v-model="showInner" :fixed="false" :opacity="0.5" color="white">
                    <div style="font-size: 20px; color: red;">NOW LOADING...</div>
                </Modal>
            </div>
        </p>

        <p class="br">
<pre><code class="language-javascript">&lt;div style="position: relative;"&gt;
    &lt;table&gt;...&lt;/table&gt;
    &lt;Modal v-model="showInner" :fixed="false" :opacity="0.5" color="white"&gt;
        &lt;div style="font-size: 20px; color: red;"&gt;NOW LOADING...&lt;/div&gt;
    &lt;/Modal&gt;
&lt;/div&gt;</code></pre>
        </p>
    </section>

    <section>
        <h2>Clone</h2>
        <p style="color: #888; font-size: 13px;">
            원본의 clone:true(트리거 엘리먼트 자체를 복제해 모달로 보여주는 옵션)는 Vue의 선언적 슬롯 모델과
            잘 안 맞아서, 여기서는 같은 내용을 직접 슬롯으로 넣는 것으로 단순화했다.
        </p>
        <p>
            <a class="btn mini" href="javascript:void(0)" @click="showClone = true">Run</a> -
            전체 화면이 대상이 아닌 특정 태그 내부적으로도 모달 기능을 사용할 수 있는 기능을 제공합니다.

            <div style="position: relative;">
                <table id="modal_3" class="table classic stripeless" style="width: 500px;">
                    <thead>
                        <tr><th>No</th><th>Name</th><th>Age</th><th>Location</th></tr>
                    </thead>
                    <tbody>
                        <tr><td style="width: 164px;">0</td><td style="width: 164px;">Hong</td><td style="width: 164px;">20</td><td style="width: 153px;">Ilsan</td></tr>
                        <tr><td>1</td><td>Jung</td><td>30</td><td>Seoul</td></tr>
                        <tr><td>2</td><td>Park</td><td>15</td><td>Yeosu</td></tr>
                    </tbody>
                </table>

                <Modal v-model="showClone" :fixed="false" :opacity="0.8">
                    <table class="table classic stripeless" style="width: 500px;">
                        <thead>
                            <tr><th>No</th><th>Name</th><th>Age</th><th>Location</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>0</td><td>Hong</td><td>20</td><td>Ilsan</td></tr>
                            <tr><td>1</td><td>Jung</td><td>30</td><td>Seoul</td></tr>
                            <tr><td>2</td><td>Park</td><td>15</td><td>Yeosu</td></tr>
                        </tbody>
                    </table>
                </Modal>
            </div>
        </p>
    </section>
</template>
