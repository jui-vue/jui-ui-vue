import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import Tree from "../src/components/Tree.vue"

describe("Tree", () => {
    it("renders the root node's title", () => {
        const wrapper = mount(Tree, { props: { root: { title: "C:\\" } } })
        expect(wrapper.find("li.root").text()).toContain("C:\\")
    })

    it("append(data) adds a top-level child under the root", () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "child1" })
        expect(wrapper.vm.list()).toHaveLength(1)
        expect(wrapper.vm.list()[0].data.title).toBe("child1")
        expect(wrapper.vm.list()[0].index).toBe("0")
    })

    it("append(index, data) adds a child under the node at that index", () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.append("0", { title: "a-child" })
        const node = wrapper.vm.get("0")
        expect(node.children).toHaveLength(1)
        expect(node.children[0].data.title).toBe("a-child")
        expect(node.children[0].index).toBe("0.0")
    })

    it("remove(index) deletes a node and its subtree", () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.append({ title: "b" })
        wrapper.vm.remove("0")
        expect(wrapper.vm.list()).toHaveLength(1)
        expect(wrapper.vm.list()[0].data.title).toBe("b")
        expect(wrapper.vm.list()[0].index).toBe("0") // 재인덱싱됨
    })

    it("open(index)/fold(index) toggle a node's children visibility and emit events", async () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.append("0", { title: "a-child" })
        await wrapper.vm.$nextTick()

        wrapper.vm.fold("0")
        expect(wrapper.emitted("fold")).toBeTruthy()
        expect(wrapper.vm.get("0").type).toBe("fold")

        wrapper.vm.open("0")
        expect(wrapper.emitted("open")).toBeTruthy()
        expect(wrapper.vm.get("0").type).toBe("open")
    })

    it("select(index) sets activeIndex() and emits select", () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.select("0")
        expect(wrapper.vm.activeIndex()).toBe("0")
        expect(wrapper.emitted("select")[0][0].data.title).toBe("a")
    })

    it("clicking a node's label emits select via the DOM", async () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        await wrapper.vm.$nextTick()
        await wrapper.find("li:not(.root) > div").trigger("click")
        expect(wrapper.emitted("select")).toBeTruthy()
    })

    it("clicking the toggle icon folds an open node with children", async () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.append("0", { title: "a-child" })
        await wrapper.vm.$nextTick()

        const aNode = wrapper.findAll("li")[1] // [0]=root, [1]=a
        await aNode.find("i").trigger("click")
        expect(wrapper.vm.get("0").type).toBe("fold")
    })

    it("move(index, targetIndex) reparents a node and updates indices", () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.append({ title: "b" })
        wrapper.vm.move("1", "0.0") // b를 a의 자식으로
        expect(wrapper.vm.list()).toHaveLength(1)
        expect(wrapper.vm.get("0").children).toHaveLength(1)
        expect(wrapper.vm.get("0").children[0].data.title).toBe("b")
    })

    it("move() refuses to move a node into its own descendant", () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.append("0", { title: "a-child" })
        wrapper.vm.move("0", "0.0.0") // a를 자기 자손 밑으로 옮기려는 시도 -> 무시되어야 함
        expect(wrapper.vm.list()).toHaveLength(1)
        expect(wrapper.vm.get("0").data.title).toBe("a")
    })

    it("listAll()/getAll() return the node and all descendants flattened", () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" } } })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.append("0", { title: "a-child" })
        expect(wrapper.vm.listAll()).toHaveLength(2)
        expect(wrapper.vm.getAll("0")).toHaveLength(2) // a 자신 + a-child
    })

    it("rootHide=true hides the root row but keeps its children visible", async () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" }, rootHide: true } })
        wrapper.vm.append({ title: "a" })
        await wrapper.vm.$nextTick()
        const rootLi = wrapper.find("li.root")
        expect(rootLi.find("i").isVisible()).toBe(false)
        expect(wrapper.find("li:not(.root)").text()).toContain("a")
    })

    it("drag=true: dropping a dragged node onto another node moves it as that node's last child", async () => {
        const wrapper = mount(Tree, { props: { root: { title: "root" }, drag: true }, attachTo: document.body })
        wrapper.vm.append({ title: "a" })
        wrapper.vm.append({ title: "b" })
        await wrapper.vm.$nextTick()

        const items = wrapper.findAll("li:not(.root)")
        await items[0].trigger("mousedown") // a 드래그 시작
        await items[1].trigger("mouseup") // b 위에 드롭

        expect(wrapper.vm.get("0").data.title).toBe("b")
        expect(wrapper.vm.get("0").children[0].data.title).toBe("a")
        wrapper.unmount()
    })

    it("custom #default scoped slot overrides the default node label", async () => {
        const wrapper = mount(Tree, {
            props: { root: { title: "root" } },
            slots: { default: `<template #default="{ node }"><b>{{ node.data.title }}!!</b></template>` }
        })
        wrapper.vm.append({ title: "a" })
        await wrapper.vm.$nextTick()
        expect(wrapper.find("li.root b").text()).toBe("root!!")
    })
})
