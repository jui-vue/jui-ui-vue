import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import Switch from "../src/components/Switch.vue"

describe("Switch", () => {
    it("renders off by default", () => {
        const wrapper = mount(Switch)
        expect(wrapper.classes()).not.toContain("on")
    })

    it("reflects modelValue as .on class", () => {
        const wrapper = mount(Switch, { props: { modelValue: true } })
        expect(wrapper.classes()).toContain("on")
    })

    it("emits update:modelValue and change on click", async () => {
        const wrapper = mount(Switch, { props: { modelValue: false } })
        await wrapper.trigger("click")

        expect(wrapper.emitted("update:modelValue")[0]).toEqual([true])
        expect(wrapper.emitted("change")[0]).toEqual([true])
    })

    it("uses toggleEvent instead of click when given", async () => {
        const wrapper = mount(Switch, { props: { modelValue: false, toggleEvent: "mouseenter" } })

        await wrapper.trigger("click")
        expect(wrapper.emitted("update:modelValue")).toBeUndefined()

        await wrapper.trigger("mouseenter")
        expect(wrapper.emitted("update:modelValue")[0]).toEqual([true])
    })
})
