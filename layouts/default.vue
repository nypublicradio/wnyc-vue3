<script setup lang="ts">
import { useIsApp } from "~/composables/states"

const isApp = useIsApp()
const route = useRoute()
useHead({
  bodyAttrs: {
    class: `template-default ${isApp.value ? "app" : "browser"}`,
  },
})
</script>

<template>
  <div class="page flex flex-column h-screen" :class="[`${String(route.name)}`]">
    <div class="top-safe-cover" />
    <SkipToContent />
    <header :class="[{ show: route.name === 'home', browser: !isApp, app: isApp }]">
      <VSmartHeader
        v-if="isApp"
        :hero-buffer="400"
        :resume-delay="0"
        class="the-smart-header-app"
      >
        <TheHeaderApp />
      </VSmartHeader>
      <TheHeader v-else />
    </header>

    <main class="flex-grow-1">
      <div class="content" id="main-content">
        <slot />
      </div>
    </main>
    <BottomMenu />
    <footer v-if="!isApp">
      <TheFooter />
    </footer>
  </div>
</template>

<style lang="scss">
header {
  .the-smart-header-app {
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
</style>
<style lang="scss" scoped>
.skip-to-content-link {
  z-index: 1000;
  position: absolute;
  top: 0;
  left: 0;
  clip: rect(1px, 1px, 1px, 1px);
  padding: 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
.content {
  z-index: 10;
  position: relative;
}
</style>
