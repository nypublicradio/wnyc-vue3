<script setup lang="ts">
import { useIsApp } from "~/composables/states"

const isApp = useIsApp()
const route = useRoute()
useHead({
  bodyAttrs: {
    class: "template-default" + (isApp.value ? " app" : " browser"),
  },
})
</script>

<template>
  <div class="page" :class="[`${String(route.name)}`]">
    <div class="top-safe-cover" />

    <header :class="[{ show: route.name === 'home', browser: !isApp, app: isApp }]">
      <VSmartHeader :hero-buffer="400" :resume-delay="0">
        <TheHeader />
      </VSmartHeader>
    </header>

    <main>
      <div class="content">
        <slot />
      </div>
    </main>
    <BottomMenu />
  </div>
</template>

<style lang="scss">
header {
  .v-smart-header {
    margin-top: calc((var(--header-height) + env(safe-area-inset-top)) * -2) !important;
    @include media(">lg") {
      margin-top: calc(
        (var(--header-height) + var(--header-bottom-height) + env(safe-area-inset-top)) *
          -1
      ) !important;
    }
    transition: margin-top var(--p-transition-duration) ease;
  }
}
header.show,
header.browser {
  .v-smart-header {
    margin-top: 0 !important;
  }
}
</style>
<style lang="scss" scoped>
.content {
  z-index: 10;
  position: relative;
}
</style>
