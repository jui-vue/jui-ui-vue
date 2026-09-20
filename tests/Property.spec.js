import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Property from "../src/components/Property.vue"

describe("Property", () => {
    it("renders a group header and its following items", () => {
        const wrapper = mount(Property, {
            props: {
                items: [
                    { type: "group", title: "Views" },
                    { title: "Name", key: "name", value: "hi" }
                ]
            }
        })
        expect(wrapper.find(".property-header-item").text()).toContain("Views")
        expect(wrapper.find("[data-key='name']").exists()).toBe(true)
    })

    it("clicking a group header collapses its following rows until the next group", async () => {
        const wrapper = mount(Property, {
            props: {
                items: [
                    { type: "group", title: "A" },
                    { title: "a1", key: "a1", value: "" },
                    { type: "group", title: "B" },
                    { title: "b1", key: "b1", value: "" }
                ]
            }
        })
        await wrapper.find(".property-header-item").trigger("click")
        const a1 = wrapper.find("[data-key='a1']")
        const b1 = wrapper.find("[data-key='b1']")
        expect(a1.isVisible()).toBe(false)
        expect(b1.isVisible()).toBe(true) // 다른 그룹 소속이라 영향 없음
    })

    it("text input emits change (debounced) with the typed value", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Property, { props: { items: [{ title: "Name", key: "name", value: "" }] } })
        const input = wrapper.find("input[type=text]")
        await input.setValue("hello")
        vi.advanceTimersByTime(300)
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted("change")[0]).toEqual([wrapper.vm.getItem("name"), "hello", ""])
        vi.useRealTimers()
    })

    it("checkbox toggles between true/false and emits change", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Property, { props: { items: [{ type: "checkbox", title: "On", key: "on", value: false }] } })
        await wrapper.find(".property-render span").trigger("click")
        vi.advanceTimersByTime(150)
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted("change")[0][1]).toBe(true)
        vi.useRealTimers()
    })

    it("select renders options and emits change on change", async () => {
        const wrapper = mount(Property, {
            props: { items: [{ type: "select", title: "Theme", key: "theme", value: "a", items: ["a", "b", "c"] }] }
        })
        const options = wrapper.findAll("option")
        expect(options.map((o) => o.text())).toEqual(["a", "b", "c"])
        await wrapper.find("select").setValue("b")
        expect(wrapper.emitted("change")[0][1]).toBe("b")
    })

    it("number input emits a numeric value", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Property, { props: { items: [{ type: "number", title: "N", key: "n", value: 1, min: 0, max: 10 }] } })
        await wrapper.find("input[type=number]").setValue(7)
        vi.advanceTimersByTime(300)
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted("change")[0][1]).toBe(7)
        vi.useRealTimers()
    })

    it("range input updates the progress width/text immediately and debounces the change event", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Property, {
            props: { items: [{ type: "range", title: "R", key: "r", value: 50, min: 0, max: 100 }] }
        })
        const range = wrapper.find("input[type=range]")
        await range.setValue(80)
        expect(wrapper.find(".range-progress").element.style.width).toBe("80px")
        expect(wrapper.text()).toContain("80")
        vi.advanceTimersByTime(300)
        await wrapper.vm.$nextTick()
        // 원본은 value+postfix로 항상 문자열 결합해서 넘긴다(postfix가 빈 문자열이어도 결과가
        // string이 됨 — "80"+"" === "80") — 그 동작을 그대로 재현했다.
        expect(wrapper.emitted("change")[0][1]).toBe("80")
        vi.useRealTimers()
    })

    it("getValue()/getAllValue()/setValue() mirror the 원본 API (group items excluded)", () => {
        const wrapper = mount(Property, {
            props: {
                items: [
                    { type: "group", title: "G" },
                    { title: "a", key: "a", value: 1 },
                    { title: "b", key: "b", value: 2 }
                ]
            }
        })
        expect(wrapper.vm.getValue()).toEqual({ a: 1, b: 2 })
        expect(wrapper.vm.getValue("a")).toBe(1)
        wrapper.vm.setValue({ a: 10 })
        expect(wrapper.vm.getValue("a")).toBe(10)
    })

    it("nested 'property' type renders a recursive Property and bubbles change as the nested getAllValue()", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Property, {
            props: {
                items: [
                    {
                        type: "property",
                        title: "Nested",
                        key: "nested",
                        items: [{ title: "x", key: "x", value: "1" }]
                    }
                ]
            }
        })
        const nestedInput = wrapper.find("input[type=text]")
        await nestedInput.setValue("2")
        vi.advanceTimersByTime(300)
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted("change")[0][1]).toEqual({ x: "2" })
        vi.useRealTimers()
    })
})
