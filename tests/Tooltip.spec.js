import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import Tooltip from "../src/components/Tooltip.vue"

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe("Tooltip", () => {
    it("does not render the bubble until triggered", () => {
        const wrapper = mount(Tooltip, { props: { text: "hi" }, slots: { default: "Over" } })
        expect(wrapper.find(".tooltip").exists()).toBe(false)
    })

    it("mouseover shows the tooltip immediately when delay=0, mouseout hides it", async () => {
        const wrapper = mount(Tooltip, { props: { text: "hi" } })

        await wrapper.trigger("mouseover")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()
        expect(wrapper.find(".tooltip .message").text()).toBe("hi")
        expect(wrapper.emitted("show")).toHaveLength(1)

        await wrapper.trigger("mouseout")
        expect(wrapper.find(".tooltip").exists()).toBe(false)
        expect(wrapper.emitted("hide")).toHaveLength(1)
    })

    it("respects the delay before showing", async () => {
        const wrapper = mount(Tooltip, { props: { text: "hi", delay: 1000 } })

        await wrapper.trigger("mouseover")
        expect(wrapper.find(".tooltip").exists()).toBe(false)

        vi.advanceTimersByTime(999)
        await wrapper.vm.$nextTick()
        expect(wrapper.find(".tooltip").exists()).toBe(false)

        vi.advanceTimersByTime(1)
        await wrapper.vm.$nextTick()
        expect(wrapper.find(".tooltip").exists()).toBe(true)
    })

    it("empty text never shows a tooltip", async () => {
        const wrapper = mount(Tooltip, { props: { text: "" } })
        await wrapper.trigger("mouseover")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()
        expect(wrapper.find(".tooltip").exists()).toBe(false)
    })

    it("showType=click toggles show/hide on repeated clicks when hideType is the same", async () => {
        const wrapper = mount(Tooltip, { props: { text: "hi", showType: "click", hideType: "click" } })

        await wrapper.trigger("click")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()
        expect(wrapper.find(".tooltip").exists()).toBe(true)

        await wrapper.trigger("click")
        expect(wrapper.find(".tooltip").exists()).toBe(false)
    })

    it("applies position class and inline color", async () => {
        const wrapper = mount(Tooltip, { props: { text: "hi", position: "right", color: "gray" } })
        await wrapper.trigger("mouseover")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()

        const bubble = wrapper.find(".tooltip")
        expect(bubble.classes()).toContain("right")
        expect(bubble.find(".message").attributes("style")).toContain("background-color");
    })

    it("exposed update() changes the shown text without needing to re-show", async () => {
        const wrapper = mount(Tooltip, { props: { text: "old" } })
        await wrapper.trigger("mouseover")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()

        wrapper.vm.update("new")
        await wrapper.vm.$nextTick()
        expect(wrapper.find(".tooltip .message").text()).toBe("new")
    })

    it("a #tooltip slot overrides the default message rendering (popover-style custom content)", async () => {
        const wrapper = mount(Tooltip, {
            props: { text: "ignored" },
            slots: { tooltip: "<div class=\"popover-body\">custom</div>" }
        })
        await wrapper.trigger("mouseover")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()

        expect(wrapper.find(".popover-body").exists()).toBe(true)
        expect(wrapper.find(".message").exists()).toBe(false)
    })
})
