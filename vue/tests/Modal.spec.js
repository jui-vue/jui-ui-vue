import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import Modal from "../src/components/Modal.vue"

describe("Modal", () => {
    it("renders nothing when modelValue is false", () => {
        const wrapper = mount(Modal, { props: { modelValue: false }, attachTo: document.body })
        expect(document.querySelector(".modal-backdrop")).toBeNull()
        wrapper.unmount()
    })

    it("fixed=false renders in place (no Teleport) with position:absolute", () => {
        const wrapper = mount(Modal, {
            props: { modelValue: true, fixed: false },
            slots: { default: "<div class=\"msgbox\">Inner</div>" }
        })

        // Teleport로 body에 빠져나가지 않고, wrapper 자신의 하위에 렌더링된다
        const backdrop = wrapper.find(".modal-backdrop")
        expect(backdrop.exists()).toBe(true)
        expect(backdrop.element.style.position).toBe("absolute")
        expect(wrapper.find(".msgbox").text()).toBe("Inner")
        expect(document.querySelector(".modal-backdrop")).toBeNull() // body로 안 나감
    })

    it("teleports the backdrop + slot content to body by default when shown", () => {
        const wrapper = mount(Modal, {
            props: { modelValue: true },
            slots: { default: "<div class=\"msgbox\">Hello</div>" },
            attachTo: document.body
        })

        const backdrop = document.querySelector(".modal-backdrop")
        expect(backdrop).not.toBeNull()
        expect(document.querySelector(".modal-content .msgbox").textContent).toBe("Hello")
        wrapper.unmount()
    })

    it("clicking the backdrop hides it when autoHide is true (default)", async () => {
        const wrapper = mount(Modal, {
            props: { modelValue: true },
            slots: { default: "<div class=\"msgbox\">Hello</div>" },
            attachTo: document.body
        })

        document.querySelector(".modal-backdrop").dispatchEvent(new MouseEvent("click", { bubbles: true }))
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted("update:modelValue")[0]).toEqual([false])
        wrapper.unmount()
    })

    it("clicking inside the modal content does not close it (event.stop)", async () => {
        const wrapper = mount(Modal, {
            props: { modelValue: true },
            slots: { default: "<div class=\"msgbox\">Hello</div>" },
            attachTo: document.body
        })

        document.querySelector(".msgbox").dispatchEvent(new MouseEvent("click", { bubbles: true }))
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted("update:modelValue")).toBeUndefined()
        wrapper.unmount()
    })

    it("autoHide=false ignores backdrop clicks", async () => {
        const wrapper = mount(Modal, {
            props: { modelValue: true, autoHide: false },
            slots: { default: "<div class=\"msgbox\">Hello</div>" },
            attachTo: document.body
        })

        document.querySelector(".modal-backdrop").dispatchEvent(new MouseEvent("click", { bubbles: true }))
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted("update:modelValue")).toBeUndefined()
        wrapper.unmount()
    })

    it("emits show/hide when modelValue toggles", async () => {
        const wrapper = mount(Modal, { props: { modelValue: false }, attachTo: document.body })

        await wrapper.setProps({ modelValue: true })
        expect(wrapper.emitted("show")).toHaveLength(1)

        await wrapper.setProps({ modelValue: false })
        expect(wrapper.emitted("hide")).toHaveLength(1)
        wrapper.unmount()
    })

    it("exposed show()/hide() emit update:modelValue", () => {
        const wrapper = mount(Modal, { props: { modelValue: false }, attachTo: document.body })

        wrapper.vm.show()
        expect(wrapper.emitted("update:modelValue")[0]).toEqual([true])

        wrapper.vm.hide()
        expect(wrapper.emitted("update:modelValue")[1]).toEqual([false])
        wrapper.unmount()
    })

    it("applies color/opacity/index as backdrop styles", () => {
        const wrapper = mount(Modal, {
            props: { modelValue: true, color: "gray", opacity: 0.5, index: 2 },
            attachTo: document.body
        })

        const backdrop = document.querySelector(".modal-backdrop")
        expect(backdrop.style.backgroundColor).toBe("gray")
        expect(backdrop.style.opacity).toBe("0.5")
        expect(backdrop.style.zIndex).toBe("5002")
        wrapper.unmount()
    })

    it("opacity only dims the backdrop, not the modal content (부모 opacity가 자식까지 반투명하게 만드는 버그 방지)", () => {
        const wrapper = mount(Modal, {
            props: { modelValue: true, opacity: 0.4 },
            slots: { default: "<div class=\"msgbox\">Hello</div>" },
            attachTo: document.body
        })

        const content = document.querySelector(".modal-content")
        expect(content.style.opacity).toBe("")
        wrapper.unmount()
    })
})
