<script setup>
import { useRoute } from "vue-router"
import { exampleRoutes } from "./router"

const route = useRoute()
</script>

<template>
  <div class="shell">
    <nav class="sidebar">
      <h1>jui-ui-vue</h1>
      <p class="hint">jui-ui component library rewritten as native Vue 3 components (all 24 components). Each page is a small demo, one per component.</p>
      <ul>
        <li v-for="r in exampleRoutes" :key="r.path">
          <RouterLink :to="r.path" :class="{ active: route.path === r.path }">
            {{ r.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
  padding: 20px 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.sidebar h1 {
  font-size: 16px;
  margin: 0 0 4px;
}

.hint {
  font-size: 12px;
  color: #666;
  margin: 0 0 16px;
  line-height: 1.4;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar a {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  text-decoration: none;
  color: #222;
  font-size: 13px;
  font-weight: 500;
}

.sidebar a:hover {
  background: #f2f2f2;
}

.sidebar a.active {
  background: #eee7fb;
  color: #6d31d6;
}

.content {
  flex: 1;
  min-width: 0;
  padding: 24px 32px;
  box-sizing: border-box;
}
</style>
