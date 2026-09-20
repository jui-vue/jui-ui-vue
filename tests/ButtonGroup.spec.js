import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import ButtonGroup from "../src/components/ButtonGroup.vue"

const items = [
    { text: "A", value: "a" },
    { text: "B", value: "b" },
    { text: "C", value: "c", disabled: true }
]

describe("ButtonGroup", () => {
    it("radio: marks the matching item active", () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "radio", modelValue: "b" } })
        const btns = wrapper.findAll(".btn")

        expect(btns[1].classes()).toContain("active")
        expect(btns[0].classes()).not.toContain("active")
    })

    it("radio: click emits update:modelValue with clicked value", async () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "radio", modelValue: "a" } })
        await wrapper.findAll(".btn")[1].trigger("click")

        expect(wrapper.emitted("update:modelValue")[0]).toEqual(["b"])
    })

    it("radio: disabled item ignores click", async () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "radio", modelValue: "a" } })
        await wrapper.findAll(".btn")[2].trigger("click")

        expect(wrapper.emitted("update:modelValue")).toBeUndefined()
    })

    it("check: toggles value in/out of the array", async () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "check", modelValue: ["a"] } })

        await wrapper.findAll(".btn")[1].trigger("click")
        expect(wrapper.emitted("update:modelValue")[0]).toEqual([["a", "b"]])
    })

    it("group-level disabled ignores clicks on every item and marks them all disabled", async () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "radio", modelValue: "a", disabled: true } })

        wrapper.findAll(".btn").forEach((btn) => expect(btn.classes()).toContain("disabled"))

        await wrapper.findAll(".btn")[1].trigger("click")
        expect(wrapper.emitted("update:modelValue")).toBeUndefined()
    })

    it("radio: defaults to index 0 when neither modelValue nor index is given (원본 opts.index 기본값 0)", () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "radio" } })
        expect(wrapper.findAll(".btn")[0].classes()).toContain("active")
    })

    it("radio: selects by index prop when modelValue is omitted", () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "radio", index: 1 } })
        expect(wrapper.findAll(".btn")[1].classes()).toContain("active")
    })

    it("check: selects by index array when modelValue is omitted", () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "check", index: [0, 1] } })
        const btns = wrapper.findAll(".btn")
        expect(btns[0].classes()).toContain("active")
        expect(btns[1].classes()).toContain("active")
    })

    it("works without v-model: tracks selection internally and still emits change", async () => {
        const wrapper = mount(ButtonGroup, { props: { items, type: "radio", index: 0 } })

        await wrapper.findAll(".btn")[1].trigger("click")

        expect(wrapper.emitted("change")[0][0]).toMatchObject({ value: "b" })
        expect(wrapper.findAll(".btn")[1].classes()).toContain("active")
        expect(wrapper.findAll(".btn")[0].classes()).not.toContain("active")
    })
})
