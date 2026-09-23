import { createRouter, createWebHashHistory } from "vue-router"

export const exampleRoutes = [
    { path: "/switch", name: "switch", label: "Switch", component: () => import("./SwitchPage.vue") },
    { path: "/button", name: "button", label: "Button", component: () => import("./ButtonPage.vue") },
    { path: "/tab", name: "tab", label: "Tab", component: () => import("./TabPage.vue") },
    { path: "/numberchecker", name: "numberchecker", label: "NumberChecker", component: () => import("./NumberCheckerPage.vue") },
    { path: "/accordion", name: "accordion", label: "Accordion", component: () => import("./AccordionPage.vue") },
    { path: "/progress", name: "progress", label: "Progress", component: () => import("./ProgressPage.vue") },
    { path: "/autocomplete", name: "autocomplete", label: "AutoComplete", component: () => import("./AutoCompletePage.vue") },
    { path: "/stringchecker", name: "stringchecker", label: "StringChecker", component: () => import("./StringCheckerPage.vue") },
    { path: "/paging", name: "paging", label: "Paging", component: () => import("./PagingPage.vue") },
    { path: "/notify", name: "notify", label: "Notify", component: () => import("./NotifyPage.vue") },
    { path: "/tooltip", name: "tooltip", label: "Tooltip", component: () => import("./TooltipPage.vue") },
    { path: "/select", name: "select", label: "Select", component: () => import("./SelectPage.vue") },
    { path: "/modal", name: "modal", label: "Modal", component: () => import("./ModalPage.vue") },
    { path: "/timepicker", name: "timepicker", label: "TimePicker", component: () => import("./TimePickerPage.vue") },
    { path: "/window", name: "window", label: "Window", component: () => import("./WindowPage.vue") },
    { path: "/splitter", name: "splitter", label: "Splitter", component: () => import("./SplitterPage.vue") },
    { path: "/dropdown", name: "dropdown", label: "Dropdown", component: () => import("./DropdownPage.vue") },
    { path: "/combo", name: "combo", label: "Combo", component: () => import("./ComboPage.vue") },
    { path: "/colorpicker", name: "colorpicker", label: "Colorpicker", component: () => import("./ColorpickerPage.vue") },
    { path: "/slider", name: "slider", label: "Slider", component: () => import("./SliderPage.vue") },
    { path: "/layout", name: "layout", label: "Layout", component: () => import("./LayoutPage.vue") },
    { path: "/datepicker", name: "datepicker", label: "Datepicker", component: () => import("./DatepickerPage.vue") },
    { path: "/property", name: "property", label: "Property", component: () => import("./PropertyPage.vue") },
    { path: "/tree", name: "tree", label: "Tree", component: () => import("./TreePage.vue") },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: "/", redirect: "/switch" }, ...exampleRoutes.map((r) => ({ path: r.path, name: r.name, component: r.component }))],
})
