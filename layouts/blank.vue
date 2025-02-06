<script setup>
const route = useRoute()

useHead({
  bodyAttrs: {
    class: "template-blank",
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
