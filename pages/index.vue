<script setup>
definePageMeta({
  layout: "default",
  //middleware: ["check-auth-provider"],
})

const route = useRoute()

useHead({
  title: "WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu hide-footer",
  },
})

// Redirect to /home immediately (works on both server and client)
// Server-side: sends a 302 redirect so /home loads with full SSR data
// Client-side (app mode): navigates after mount for the loader animation
if (import.meta.server) {
  navigateTo("/home", { redirectCode: 302 })
}

onMounted(() => {
  setTimeout(() => {
    navigateTo("/home")
  }, 100)
})
</script>
<template>
  <div class="index">
    <div class="page" :class="[`${String(route.name)}`]">
      <Transition name="fade">
        <section class="loading-holder">
          <WnycLoader class="loader-anim" color="var(--p-surface-950)" />
        </section>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.index {
  min-height: 100vh;
  .loading-holder {
    display: flex;
    position: absolute;
    height: calc(
      100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
    );
    width: 100%;
    left: 0;
    right: 0;
    background-color: #ffffff;

    .loader-anim {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      width: 100px;
      height: 50px;
    }
  }
}
</style>
