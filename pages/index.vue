<script setup>
import { useBrowserTopColorDarkMode } from "~/composables/globals.ts"

definePageMeta({
  layout: "default",
  //middleware: ["check-auth-provider"],
})

const browserTopColorDarkMode = useBrowserTopColorDarkMode()
const route = useRoute()

useHead({
  title: "WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu hide-footer",
  },
  meta: [
    {
      name: "og:title",
      content:
        "WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    {
      name: "twitter:title",
      content:
        "WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    { name: "theme-color", content: browserTopColorDarkMode },
    { name: "msapplication-TileColor", content: browserTopColorDarkMode },
  ],
})

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
          <WnycLoader class="loader-anim" />
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
