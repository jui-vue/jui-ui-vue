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

    it("nudges the bubble back into view without changing its position when clipped off the top", async () => {
        const wrapper = mount(Tooltip, { props: { text: "hi", position: "top" } })
        const originalGetRect = Element.prototype.getBoundingClientRect
        Element.prototype.getBoundingClientRect = function () {
            return this.classList.contains("tooltip")
                ? { top: -20, bottom: 0, left: 0, right: 100, width: 100, height: 20 }
                : { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }
        }

        await wrapper.trigger("mouseover")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()

        const bubble = wrapper.find(".tooltip")
        expect(bubble.classes()).toContain("top")
        // 20px 위로 잘렸으니 그만큼 아래로 밀어넣는다(translate에 그대로 반영됐는지만 확인 -
        // 실제 화면 밖 보정 여부는 jsdom에 레이아웃이 없어 픽셀로는 검증할 수 없다).
        expect(bubble.attributes("style")).toContain("translate(0px, 20px)")

        Element.prototype.getBoundingClientRect = originalGetRect
    })

    it("does not nudge when the bubble is already fully within the viewport", async () => {
        const wrapper = mount(Tooltip, { props: { text: "hi", position: "top" } })
        const originalGetRect = Element.prototype.getBoundingClientRect
        Element.prototype.getBoundingClientRect = function () {
            return this.classList.contains("tooltip")
                ? { top: 40, bottom: 60, left: 0, right: 100, width: 100, height: 20 }
                : { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }
        }

        await wrapper.trigger("mouseover")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()

        expect(wrapper.find(".tooltip").attributes("style")).toContain("translate(0px, 0px)")

        Element.prototype.getBoundingClientRect = originalGetRect
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
        // 커스텀 콘텐츠는 보통 자기 화살표를 따로 갖는다(popover의 ::before/::after) - 기본
        // anchor(검은 삼각형)까지 같이 나오면 두 개가 겹쳐 보인다.
        expect(wrapper.find(".anchor").exists()).toBe(false)
    })

    it("renders the default anchor when no #tooltip slot is given", async () => {
        const wrapper = mount(Tooltip, { props: { text: "hi" } })
        await wrapper.trigger("mouseover")
        vi.runAllTimers()
        await wrapper.vm.$nextTick()

        expect(wrapper.find(".anchor").exists()).toBe(true)
    })
})
