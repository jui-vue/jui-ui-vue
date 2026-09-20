# jui-ui-vue

A native Vue 3 (Composition API) rewrite of [jui-ui](https://github.com/juijs/jui-ui)'s 24
components — no jQuery, no `juijs` core dependency.

## Install

```bash
npm install jui-ui-vue
```

## Usage

Register everything as a plugin:

```js
import { createApp } from "vue"
import JuiUiVue from "jui-ui-vue"
import "jui-ui-vue/style.css"

createApp(App).use(JuiUiVue).mount("#app")
```

Or import individual components:

```vue
<script setup>
import { Select, Datepicker } from "jui-ui-vue"
import "jui-ui-vue/style.css"
</script>
```

## Components

Switch, ButtonGroup, Tab, NumberChecker, Accordion, Progress, AutoComplete, StringChecker,
Paging, Notify, Tooltip, Select, Modal, TimePicker, Window, Splitter, Dropdown, Combo,
Colorpicker, Slider, Layout, Datepicker, Property, Tree.

## Development

This package lives at `vue/` inside the [jui-ui-vue](https://github.com/jui-vue/jui-ui-vue)
repo, alongside the original jQuery-based `jui-ui` source it was ported from.

```bash
npm install
npm run dev     # playground app
npm run test    # vitest
npm run build   # build the publishable package into dist/
```

## License

MIT
