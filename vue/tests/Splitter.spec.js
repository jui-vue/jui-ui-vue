import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Splitter from "../src/components/Splitter.vue"

// jsdom은 clientWidth/clientHeight를 항상 0으로 반환하므로, 컨테이너 크기가 필요한
// 테스트에서는 mount 직후 getBoundingClientRect 대신 쓰는 clientWidth/clientHeight를 직접 stub한다.
function stubSize(el, width, height) {
    Object.defineProperty(el, "clientWidth", { configurable: true, value: width })
    Object.defineProperty(el, "clientHeight", { configurable: true, value: height })
}

describe("Splitter", () => {
    it("renders first/second slot content and a splitter bar by default", () => {
        const wrapper = mount(Splitter, {
            slots: { first: "<div class='p1'>A</div>", second: "<div class='p2'>B</div>" }
        })
        expect(wrapper.find(".p1").exists()).toBe(true)
        expect(wrapper.find(".p2").exists()).toBe(true)
        expect(wrapper.find(".ui-splitter").exists()).toBe(true)
    })

    it("computes a 50% split in px from the container width (vertical, default direction)", async () => {
        const wrapper = mount(Splitter, {
            props: { initSize: "50%" },
            attachTo: document.body
        })
        stubSize(wrapper.element, 400, 300)
        wrapper.vm.setInitSize("50%")
        await wrapper.vm.$nextTick()
        const panel1 = wrapper.findAll(".splitter-panel")[0]
        expect(panel1.element.style.width).toBe("200px")
        wrapper.unmount()
    })

    it("clamps the split position to minSize on setInitSize", async () => {
        const wrapper = mount(Splitter, {
            props: { minSize: 50, barSize: 4 },
            attachTo: document.body
        })
        stubSize(wrapper.element, 400, 300)
        wrapper.vm.setInitSize(10) // barSize(4)+minSize(50)=54 미만이므로 54로 clamp
        await wrapper.vm.$nextTick()
        const panel1 = wrapper.findAll(".splitter-panel")[0]
        expect(panel1.element.style.width).toBe("54px")
        wrapper.unmount()
    })

    it("horizontal direction lays out panels with top/height instead of left/width", async () => {
        const wrapper = mount(Splitter, {
            props: { direction: "horizontal", initSize: "50%" },
            attachTo: document.body
        })
        stubSize(wrapper.element, 300, 400)
        wrapper.vm.setInitSize("50%")
        await wrapper.vm.$nextTick()
        const panel1 = wrapper.findAll(".splitter-panel")[0]
        expect(panel1.element.style.height).toBe("200px")
        expect(panel1.element.style.width).toBe("")
        wrapper.unmount()
    })

    it("hidden=0 hides the first panel, fills the second, and hides the bar", async () => {
        const wrapper = mount(Splitter, { props: { hidden: 0 } })
        const [panel1, panel2] = wrapper.findAll(".splitter-panel")
        expect(panel1.element.style.display).toBe("none")
        expect(panel2.element.style.display).not.toBe("none")
        expect(wrapper.find(".ui-splitter").exists()).toBe(false)
    })

    it("toggle(index) emits update:hidden toggling between the index and null", async () => {
        const wrapper = mount(Splitter, { props: { hidden: null } })
        wrapper.vm.toggle(1)
        expect(wrapper.emitted("update:hidden")[0]).toEqual([1])

        await wrapper.setProps({ hidden: 1 })
        wrapper.vm.toggle(1)
        expect(wrapper.emitted("update:hidden")[1]).toEqual([null])
    })

    it("dragging the bar (mousedown/mousemove/mouseup) resizes and emits resize once on mouseup", async () => {
        const wrapper = mount(Splitter, { props: { initSize: 100, minSize: 10 }, attachTo: document.body })
        stubSize(wrapper.element, 400, 300)
        wrapper.vm.setInitSize(100)
        await wrapper.vm.$nextTick()

        const bar = wrapper.find(".ui-splitter")
        bar.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 100 }))
        document.dispatchEvent(new MouseEvent("mousemove", { clientX: 150 }))
        expect(wrapper.emitted("resize")).toBeFalsy()
        document.dispatchEvent(new MouseEvent("mouseup"))
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted("resize")).toBeTruthy()
        const panel1 = wrapper.findAll(".splitter-panel")[0]
        expect(panel1.element.style.width).toBe("150px")
        wrapper.unmount()
    })

    it("fixed=true prevents dragging from starting", async () => {
        const wrapper = mount(Splitter, { props: { initSize: 100, fixed: true }, attachTo: document.body })
        stubSize(wrapper.element, 400, 300)
        wrapper.vm.setInitSize(100)
        await wrapper.vm.$nextTick()

        const bar = wrapper.find(".ui-splitter")
        await bar.trigger("mousedown", { clientX: 100 })
        document.dispatchEvent(new MouseEvent("mousemove", { clientX: 150 }))
        document.dispatchEvent(new MouseEvent("mouseup"))
        expect(wrapper.emitted("resize")).toBeFalsy()
        wrapper.unmount()
    })
})
