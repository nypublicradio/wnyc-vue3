<script setup lang="ts">
import { useIsApp } from "~/composables/states"

const isApp = useIsApp()
const route = useRoute()
// control pages that show the smart header for app
const pagesToShowAppSmartHeaderArray = ["home"]
const showAppSmartHeader = ref(false)

const bodyClass = computed(
  () =>
    `template-default ${isApp.value ? "app" : "browser"} ${
      showAppSmartHeader.value && isApp.value ? "show-app-header" : ""
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
    showAppSmartHeader.value = isApp.value
      ? pagesToShowAppSmartHeaderArray.includes(route.name as string)
      : true
    // set the focus to the header (client-side only)
    if (process.client) {
      const header = document.querySelector("the-header")
      if (header) {
        header.focus()
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    class="page flex flex-column h-screen"
    :class="[`${String(route.name)}`]"
  >
    <div class="top-safe-cover" />
    <header>
      <VSmartHeader
        v-if="isApp"
        :hero-buffer="400"
        :resume-delay="0"
        class="the-smart-header-app"
        :hide="!showAppSmartHeader"
        headerHeightCssVar="var(--header-height-app)"
      >
        <TheHeaderApp />
      </VSmartHeader>
      <div v-else>
        <TheHeader showMenu />
        <VSmartHeader
          :hero-buffer="1"
          :resume-delay="0"
          class="the-smart-header-browser"
          headerHeightCssVar="var(--header-height)"
          reverse
          transitionName=""
        >
          <TheHeader />
        </VSmartHeader>
      </div>
    </header>

    <main class="flex-grow-1">
      <div class="content" id="main-content">
        <slot />
      </div>
    </main>
    <BottomMenu v-if="isApp" />
    <footer v-if="!isApp">
      <TheFooter />
    </footer>
  </div>
</template>

<style lang="scss" scoped>
body {
  &.show-app-header {
    main {
      padding-top: $headerHeight;
      @include media(">lg") {
        padding-top: calc($headerHeight)- 6px;
      }
    }
  }
  header {
    z-index: 11;
  }
  .content {
    z-index: 10;
    position: relative;
  }
}
</style>
