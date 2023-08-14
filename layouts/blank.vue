<script setup>
const route = useRoute()

useHead({
  bodyAttrs: {
    class: 'template-blank',
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

<style lang="scss" scoped>
body {
  background: var(--background);
  transform: none;
  height: 100% !important;
  margin: 0;
  background-repeat: no-repeat;
  background-attachment: fixed;
  max-height: unset !important;
  position: relative !important;
  &.hide-header {
    header {
      display: none;
    }
    main {
      margin-top: 0;
    }
  }
  &.hide-bottom-menu {
    .bottom-menu {
      display: none;
    }
    main {
      padding-bottom: 0px; // account for the sticky bottom menu
    }
  }
  &.background2 {
    background: var(--background2);
    .p-divider .p-divider-content {
      background: var(--background2);
    }
  }
  &.background-gradient {
    background: linear-gradient(to bottom, #1b223c, #244873);
    background: $backgroundGradient1;
    transform: none;
    height: 100% !important;
    margin: 0;
    background-repeat: no-repeat;
    background-attachment: fixed;
    max-height: unset !important;
    position: relative !important;
  }
  // main {
  //   margin-top: 0;
  //   padding-bottom: calc(
  //     $bottomMenuHeight + $playerHeight
  //   ); // account for the sticky bottom menu
  // }
}
</style>
