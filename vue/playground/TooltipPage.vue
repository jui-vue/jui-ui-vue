<script setup>
import { ref } from "vue"
import Tooltip from "../src/components/Tooltip.vue"

function log(kind) {
    console.log(kind)
}

const tooltip2Text = ref("Tooltip Bottom")
setTimeout(() => {
    tooltip2Text.value = "sdfsdfsdfsdf"
}, 5000)
</script>

<template>
    <section>
        <h2>Top</h2>
        <p>
            툴팁의 위치를 상단으로 설정할 수 있으며 기본적으로 마우스 오버시에 툴팁이 보여집니다.
            (<Tooltip class="tooltip_1" text="Tooltip Top"><span>Over</span></Tooltip>)
<pre><code class="language-javascript">&lt;Tooltip text="Tooltip Top"&gt;&lt;span&gt;Over&lt;/span&gt;&lt;/Tooltip&gt;</code></pre>
        </p>
    </section>

    <section>
        <h2>Bottom</h2>
        <p>
            툴팁의 위치를 하단으로 설정할 수 있으며 컬러는 회색으로 툴팁은 마우스 클릭시에 보여집니다.
            (<Tooltip class="tooltip_2" position="bottom" color="gray" show-type="click" hide-type="click" :text="tooltip2Text" @show="log('show')" @hide="log('hide')"><span>Click</span></Tooltip>)
<pre><code class="language-javascript">&lt;Tooltip position="bottom" color="gray" show-type="click" hide-type="click" :text="text" /&gt;</code></pre>
        </p>
    </section>

    <section>
        <h2>Left</h2>
        <p>
            툴팁의 위치를 좌측으로 설정할 수 있으며 마우스 오버시 1초 후에 툴팁이 보여집니다.
            (<Tooltip class="tooltip_3" position="left" :delay="1000" hide-type="click" text="Tooltip left" @show="log('show')" @hide="log('hide')"><span>Delay</span></Tooltip>)
<pre><code class="language-javascript">&lt;Tooltip position="left" :delay="1000" hide-type="click" text="Tooltip left" /&gt;</code></pre>
        </p>
    </section>

    <section>
        <h2>Right</h2>
        <p>
            툴팁의 위치를 우측으로 설정할 수 있으며 <strong>max-width</strong> 값을 300px로 정합니다. 만약에 툴팁이 길어지면 자동으로 줄바꿈을 합니다.
            그리고 툴팁은 가운데 정렬됩니다.
            (<Tooltip class="tooltip_4" position="right" :width="300" align="left" hide-type="click" text="Tooltip right, Tooltip right, Tooltip right, Tooltip right, Tooltip right, Tooltip right">
                <span>Over</span>
                <template #tooltip>
                    <div class="popover right">
                        <div class="head">Subject</div>
                        <div class="body">
                            <div class="image"><i class="icon-caution"></i></div>
                            <div class="message">Tooltip right, Tooltip right, Tooltip right, Tooltip right, Tooltip right, Tooltip right</div>
                        </div>
                    </div>
                </template>
            </Tooltip>)
        </p>
    </section>
</template>
