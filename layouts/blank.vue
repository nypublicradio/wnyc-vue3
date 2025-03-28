<script setup>
import { useIsApp } from "~/composables/states.ts"

const isApp = useIsApp()
const route = useRoute()

useHead({
  bodyAttrs: {
    class: `template-blank ${isApp.value ? " app" : " browser"}`,
  },
})
</script>
<template>
  <div class="page" :class="[`${String(route.name)}`]">
    <div class="top-safe-cover" />
    <header></header>
    <main>
      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>
