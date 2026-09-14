import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { h, nextTick } from "vue"
import Tab from "../src/components/Tab.vue"

const items = [
    { text: "Home", value: "home" },
    { text: "Profile", value: "profile" },
    { text: "Settings", value: "settings", disabled: true }
]

// selectTab/show는 alert()처럼 동기적으로 화면을 멈추는 핸들러 앞에서 실제로 페인트가
// 끝난 뒤 change/click을 emit하려고 nextTick + requestAnimationFrame을 두 번 기다린다
// (Tab.vue의 waitForPaint()와 동일한 순서) — 테스트에서도 최소 그만큼은 기다려준다.
const raf = () =>
    nextTick().then(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    )

describe("Tab", () => {
    it("marks the active tab by modelValue index", () => {
        const wrapper = mount(Tab, { props: { items, modelValue: 1 } })
        const lis = wrapper.findAll("li")

        expect(lis[1].classes()).toContain("active")
        expect(lis[0].classes()).not.toContain("active")
    })

    it("clicking a tab emits update:modelValue and change", async () => {
        const wrapper = mount(Tab, { props: { items, modelValue: 0 } })
        await wrapper.findAll("li")[1].trigger("click")
        await raf()

        expect(wrapper.emitted("update:modelValue")[0]).toEqual([1])
        expect(wrapper.emitted("change")[0][0]).toMatchObject({ index: 1 })
    })

    it("disabled tab ignores click", async () => {
        const wrapper = mount(Tab, { props: { items, modelValue: 0 } })
        await wrapper.findAll("li")[2].trigger("click")

        expect(wrapper.emitted("update:modelValue")).toBeUndefined()
    })

    it("renders the slot content matching the active tab's value", () => {
        const wrapper = mount(Tab, {
            props: { items, modelValue: 0 },
            slots: {
                "panel-home": "<div class=\"panel-home-content\">Home</div>",
                "panel-profile": "<div class=\"panel-profile-content\">Profile</div>"
            }
        })

        expect(wrapper.find(".panel-home-content").isVisible()).toBe(true)
        expect(wrapper.find(".panel-profile-content").isVisible()).toBe(false)
    })

    it("value 기반 슬롯이라 move로 순서가 바뀌어도 콘텐츠가 같은 탭을 계속 따라간다", async () => {
        const wrapper = mount(Tab, {
            props: { items: items.slice(), modelValue: 0 },
            slots: {
                "panel-home": "<div class=\"panel-home-content\">Home</div>",
                "panel-profile": "<div class=\"panel-profile-content\">Profile</div>"
            }
        })

        expect(wrapper.find(".panel-home-content").isVisible()).toBe(true)

        // Home(index 0)을 index 2로 옮기면, 활성 인덱스도 Home을 따라 2로 이동한다.
        await wrapper.vm.move(0, 2)
        expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([2])

        await wrapper.setProps({ modelValue: 2 })
        expect(wrapper.find(".panel-home-content").isVisible()).toBe(true)
        expect(wrapper.find(".panel-profile-content").isVisible()).toBe(false)
    })

    it("item.content가 있으면 슬롯 대신 동적 컴포넌트를 렌더링한다 (append로 추가된 탭용)", async () => {
        const DynamicPanel = {
            props: ["msg"],
            render(ctx) {
                return h("div", { class: "dynamic-panel" }, `동적 콘텐츠: ${ctx.msg}`)
            }
        }
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 0 } })

        await wrapper.vm.append({
            text: "New",
            value: "new",
            content: DynamicPanel,
            contentProps: { msg: "hello" }
        })
        await wrapper.vm.show(3)
        await wrapper.setProps({ modelValue: 3 })

        expect(wrapper.find(".dynamic-panel").text()).toBe("동적 콘텐츠: hello")
    })

    it("drag=false: mousedown/mouseenter never reorder items", async () => {
        const wrapper = mount(Tab, { props: { items, modelValue: 0, drag: false } })
        const lis = wrapper.findAll("li")

        await lis[0].trigger("mousedown")
        await lis[2].trigger("mouseenter")

        expect(wrapper.emitted("update:items")).toBeUndefined()
    })

    it("drag=true: dragging tab 0 onto tab 2 reorders items and follows the moved active tab", async () => {
        const wrapper = mount(Tab, { props: { items, modelValue: 0, drag: true } })
        const lis = wrapper.findAll("li")

        await lis[0].trigger("mousedown")
        expect(wrapper.emitted("dragstart")[0]).toEqual([0, expect.anything()])

        await lis[2].trigger("mouseenter")
        const reordered = wrapper.emitted("update:items")[0][0]
        expect(reordered.map((i) => i.value)).toEqual(["profile", "settings", "home"])
        // Home(원래 modelValue=0으로 활성)이 옮겨졌으니 활성 인덱스도 새 위치(2)를 따라간다
        expect(wrapper.emitted("update:modelValue")[0]).toEqual([2])

        await wrapper.find(".jui-tab").trigger("mouseup")
        expect(wrapper.emitted("dragend")[0]).toEqual([2, expect.anything()])
    })

    it("exposed append/prepend/insert/remove mutate the rendered tab list", async () => {
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 0 } })

        await wrapper.vm.append({ text: "New", value: "new" })
        expect(wrapper.findAll("li").map((li) => li.text())).toEqual(["Home", "Profile", "Settings", "New"])

        await wrapper.vm.prepend({ text: "First", value: "first" })
        expect(wrapper.findAll("li")[0].text()).toBe("First")

        await wrapper.vm.insert(1, { text: "Inserted", value: "inserted" })
        expect(wrapper.findAll("li")[1].text()).toBe("Inserted")

        await wrapper.vm.remove(0)
        expect(wrapper.findAll("li")[0].text()).toBe("Inserted")

        expect(wrapper.emitted("update:items").length).toBeGreaterThanOrEqual(4)
    })

    it("exposed move reorders without emitting dragstart/dragend", async () => {
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 0 } })

        await wrapper.vm.move(0, 2)
        expect(wrapper.findAll("li").map((li) => li.text())).toEqual(["Profile", "Settings", "Home"])
        expect(wrapper.emitted("update:modelValue")[0]).toEqual([2])
        expect(wrapper.emitted("dragstart")).toBeUndefined()
        expect(wrapper.emitted("dragend")).toBeUndefined()
    })

    it("exposed show activates a tab and emits only change (not click)", async () => {
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 0 } })

        await wrapper.vm.show(1)
        expect(wrapper.emitted("update:modelValue")[0]).toEqual([1])
        expect(wrapper.emitted("change")[0][0]).toMatchObject({ index: 1 })
        expect(wrapper.emitted("click")).toBeUndefined()
    })

    it("exposed show refuses a disabled tab", async () => {
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 0 } })

        await wrapper.vm.show(2) // Settings, disabled: true
        expect(wrapper.emitted("update:modelValue")).toBeUndefined()
    })

    it("exposed enable/disable toggle a tab's disabled state, but never the active tab", async () => {
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 0 } })

        await wrapper.vm.enable(2)
        expect(wrapper.findAll("li")[2].classes()).not.toContain("disabled")

        await wrapper.vm.disable(1)
        expect(wrapper.findAll("li")[1].classes()).toContain("disabled")

        // 현재 활성 탭(index 0)은 disable() 이 무시해야 한다
        await wrapper.vm.disable(0)
        expect(wrapper.findAll("li")[0].classes()).not.toContain("disabled")
    })

    it("exposed activeIndex returns the current modelValue", () => {
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 1 } })
        expect(wrapper.vm.activeIndex()).toBe(1)
    })

    it("원본 setActiveNode()와 동일하게, modelValue가 disabled 탭을 가리키면 첫 활성 가능 탭으로 폴백한다", async () => {
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 2 } }) // Settings, disabled

        expect(wrapper.vm.activeIndex()).toBe(0)
        expect(wrapper.findAll("li")[0].classes()).toContain("active")
        expect(wrapper.findAll("li")[2].classes()).not.toContain("active")
        expect(wrapper.emitted("update:modelValue")[0]).toEqual([0])
    })

    it("exposed update replaces the whole list", async () => {
        const wrapper = mount(Tab, { props: { items: items.slice(), modelValue: 0 } })
        const nextItems = [{ text: "Only", value: "only" }]

        await wrapper.vm.update(nextItems)
        expect(wrapper.findAll("li").map((li) => li.text())).toEqual(["Only"])
    })

    it("menu: renders an extra Menu tab and emits changemenu on item click", async () => {
        const menu = [
            { text: "Combo Box1", value: "c1" },
            { text: "Combo Box2", value: "c2" }
        ]
        const wrapper = mount(Tab, { props: { items, modelValue: 0, menu } })

        const menuTab = wrapper.find("li.menu")
        expect(menuTab.exists()).toBe(true)

        await menuTab.trigger("click")
        expect(wrapper.emitted("menu")).toBeTruthy()
        expect(wrapper.findAll(".dropdown li")).toHaveLength(2)

        await wrapper.findAll(".dropdown li")[1].trigger("click")
        expect(wrapper.emitted("changemenu")[0][0]).toMatchObject({ value: "c2", text: "Combo Box2" })
        expect(wrapper.find(".dropdown").exists()).toBe(false)
    })
})
