import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import Window from "../src/components/Window.vue"

describe("Window", () => {
    it("renders nothing when modelValue is false", () => {
        const wrapper = mount(Window, { props: { modelValue: false }, attachTo: document.body })
        expect(document.querySelector(".window")).toBeNull()
        wrapper.unmount()
    })

    it("renders head/body/title via Teleport(to body) when modelValue is true", () => {
        const wrapper = mount(Window, {
            props: { modelValue: true, title: "My Window" },
            slots: { default: "<p>content</p>" },
            attachTo: document.body
        })
        const el = document.querySelector(".window")
        expect(el).not.toBeNull()
        expect(el.querySelector(".head .title").textContent).toBe("My Window")
        expect(el.querySelector(".body").innerHTML).toContain("content")
        wrapper.unmount()
    })

    it("clicking the close button emits update:modelValue(false)", async () => {
        const wrapper = mount(Window, { props: { modelValue: true }, attachTo: document.body })
        await document.querySelector(".window .close").dispatchEvent(new MouseEvent("click", { bubbles: true }))
        expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([false])
        wrapper.unmount()
    })

    it("emits show/hide when modelValue prop toggles", async () => {
        const wrapper = mount(Window, { props: { modelValue: false }, attachTo: document.body })
        await wrapper.setProps({ modelValue: true })
        expect(wrapper.emitted("show")).toHaveLength(1)
        await wrapper.setProps({ modelValue: false })
        expect(wrapper.emitted("hide")).toHaveLength(1)
        wrapper.unmount()
    })

    it("does not render a .foot element when no foot slot is given, renders one when given", () => {
        const w1 = mount(Window, { props: { modelValue: true }, attachTo: document.body })
        expect(document.querySelector(".window .foot")).toBeNull()
        w1.unmount()

        const w2 = mount(Window, {
            props: { modelValue: true },
            slots: { foot: "<button>OK</button>" },
            attachTo: document.body
        })
        expect(document.querySelector(".window .foot")).not.toBeNull()
        w2.unmount()
    })

    it("renders a resize handle by default, and hides it when resize=false", () => {
        const w1 = mount(Window, { props: { modelValue: true }, attachTo: document.body })
        expect(document.querySelector(".window .resize")).not.toBeNull()
        w1.unmount()

        const w2 = mount(Window, { props: { modelValue: true, resize: false }, attachTo: document.body })
        expect(document.querySelector(".window .resize")).toBeNull()
        w2.unmount()
    })

    it("modal=true renders a modal-backdrop and disables move/resize (no resize handle)", () => {
        const wrapper = mount(Window, { props: { modelValue: true, modal: true }, attachTo: document.body })
        expect(document.querySelector(".modal-backdrop")).not.toBeNull()
        expect(document.querySelector(".window .resize")).toBeNull()
        wrapper.unmount()
    })

    it("exposed show()/hide() emit update:modelValue", async () => {
        const wrapper = mount(Window, { props: { modelValue: false }, attachTo: document.body })
        wrapper.vm.show()
        expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([true])
        wrapper.vm.hide()
        expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([false])
        wrapper.unmount()
    })

    it("exposed setSize() updates the rendered width/height", async () => {
        const wrapper = mount(Window, { props: { modelValue: true, width: 400, height: 300 }, attachTo: document.body })
        wrapper.vm.setSize(500, 350)
        await wrapper.vm.$nextTick()
        const el = document.querySelector(".window")
        expect(el.style.width).toBe("500px")
        expect(el.style.height).toBe("350px")
        wrapper.unmount()
    })

    it("dragging the head moves the window (mousedown on head, mousemove/mouseup on document)", async () => {
        const wrapper = mount(Window, {
            props: { modelValue: true, left: 100, top: 100, width: 400, height: 300 },
            attachTo: document.body
        })
        const head = document.querySelector(".window .head")
        head.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, pageX: 110, pageY: 110 }))
        document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, pageX: 160, pageY: 170 }))
        document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }))
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted("move")).toBeTruthy()
        wrapper.unmount()
    })
})
