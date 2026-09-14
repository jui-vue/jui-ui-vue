import Switch from "./components/Switch.vue"
import ButtonGroup from "./components/ButtonGroup.vue"
import Tab from "./components/Tab.vue"
import NumberChecker from "./components/NumberChecker.vue"
import Accordion from "./components/Accordion.vue"
import Progress from "./components/Progress.vue"
import AutoComplete from "./components/AutoComplete.vue"
import StringChecker from "./components/StringChecker.vue"
import Paging from "./components/Paging.vue"
import Notify from "./components/Notify.vue"
import Tooltip from "./components/Tooltip.vue"
import Select from "./components/Select.vue"
import Modal from "./components/Modal.vue"
import TimePicker from "./components/TimePicker.vue"
import Window from "./components/Window.vue"
import Splitter from "./components/Splitter.vue"
import Dropdown from "./components/Dropdown.vue"
import Combo from "./components/Combo.vue"
import Colorpicker from "./components/Colorpicker.vue"
import Slider from "./components/Slider.vue"
import Layout from "./components/Layout.vue"
import Datepicker from "./components/Datepicker.vue"
import Property from "./components/Property.vue"
import Tree from "./components/Tree.vue"

import "./styles/theme.less"

const components = {
    Switch,
    ButtonGroup,
    Tab,
    NumberChecker,
    Accordion,
    Progress,
    AutoComplete,
    StringChecker,
    Paging,
    Notify,
    Tooltip,
    Select,
    Modal,
    TimePicker,
    Window,
    Splitter,
    Dropdown,
    Combo,
    Colorpicker,
    Slider,
    Layout,
    Datepicker,
    Property,
    Tree
}

const install = (app) => {
    for (const name in components) {
        app.component(name, components[name])
    }
}

export {
    Switch,
    ButtonGroup,
    Tab,
    NumberChecker,
    Accordion,
    Progress,
    AutoComplete,
    StringChecker,
    Paging,
    Notify,
    Tooltip,
    Select,
    Modal,
    TimePicker,
    Window,
    Splitter,
    Dropdown,
    Combo,
    Colorpicker,
    Slider,
    Layout,
    Datepicker,
    Property,
    Tree,
    install
}

export default { install }
