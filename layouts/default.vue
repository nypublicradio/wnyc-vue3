<script setup lang="ts">
import VSmartHeader from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VSmartHeader.vue"
const route = useRoute()
useHead({
  bodyAttrs: {
    class: "template-default",
  },
})
</script>

<template>
  <div class="page" :class="[`${String(route.name)}`]">
    <div class="top-safe-cover" />

    <header :class="[{ show: route.name === 'home' }]">
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
    margin-top: calc((var(--header-height) + env(safe-area-inset-top)) * -1) !important;
    transition: margin-top $transitionDuration ease;
  }
}
header.show {
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
