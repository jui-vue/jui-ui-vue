import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import Progress from "../src/components/Progress.vue"

describe("Progress", () => {
    it("sets the bar width as a percentage of (value - min) / (max - min)", () => {
        const wrapper = mount(Progress, { props: { modelValue: 30 } })
        expect(wrapper.find(".bar").attributes("style")).toContain("width: 30%")
    })

    it("respects custom min/max range", () => {
        const wrapper = mount(Progress, { props: { modelValue: 25, min: 0, max: 50 } })
        expect(wrapper.find(".bar").attributes("style")).toContain("width: 50%")
    })

    it("orient=vertical sets height instead of width", () => {
        const wrapper = mount(Progress, { props: { modelValue: 40, orient: "vertical" } })
        const style = wrapper.find(".bar").attributes("style")
        expect(style).toContain("height: 40%")
        expect(style).not.toContain("width")
    })

    it("applies variant and orient classes to the root", () => {
        const wrapper = mount(Progress, { props: { modelValue: 0, variant: "simple flat", orient: "vertical" } })
        expect(wrapper.classes()).toContain("vertical")
        expect(wrapper.classes()).toContain("simple")
        expect(wrapper.classes()).toContain("flat")
    })

    it("applies striped/animated classes to the bar", () => {
        const wrapper = mount(Progress, { props: { modelValue: 0, striped: true, animated: true } })
        const bar = wrapper.find(".bar")
        expect(bar.classes()).toContain("striped")
        expect(bar.classes()).toContain("animated")
    })

    it("exposed getValue/setValue mirror modelValue", () => {
        const wrapper = mount(Progress, { props: { modelValue: 20 } })
        expect(wrapper.vm.getValue()).toBe(20)

        wrapper.vm.setValue(80)
        expect(wrapper.emitted("update:modelValue")[0]).toEqual([80])
    })
})
