<script setup lang="ts">
import { useIsApp } from "~/composables/states"

const isApp = useIsApp()
const route = useRoute()
// control pages that show the smart header for app
const pagesToShowSmartHeaderArray = ["home"]
const showSmartHeader = ref(false)

const bodyClass = computed(
  () =>
    `template-default ${isApp.value ? "app" : "browser"} ${
      showSmartHeader.value ? "show-header" : ""
    }`
)

useHead({
  bodyAttrs: {
    class: bodyClass,
  },
})

//check when the route changes
watch(
  () => route.path,
  () => {
    showSmartHeader.value = isApp.value
      ? pagesToShowSmartHeaderArray.includes(route.name as string)
      : true
  },
  { immediate: true }
)
</script>

<template>
  <div class="page flex flex-column h-screen" :class="[`${String(route.name)}`]">
    <div class="top-safe-cover" />
    <SkipToContent />
    <header>
      <VSmartHeader
        v-if="isApp"
        :hero-buffer="400"
        :resume-delay="0"
        class="the-smart-header-app"
        :hide="!showSmartHeader"
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
body {
  &.show-header {
    main {
      padding-top: $headerHeight;
      @include media(">lg") {
        padding-top: calc($headerHeight)- 6px;
      }
    }
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
