<script setup async>
import { setStatusDarkMode } from "~/utilities/helpers"
import { useCurrentUserProfile } from "~/composables/states.ts"
import { useBrowserTopColorDarkMode } from "~/composables/globals.ts"

useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu solid-bg",
  },
})

definePageMeta({
  layout: "default",
  //middleware: ["check-auth-provider"],
})

const currentUserProfile = useCurrentUserProfile()
const browserTopColorDarkMode = useBrowserTopColorDarkMode()
const route = useRoute()

onBeforeMount(() => {
  // this page has the body class "style-mode-dark", so we need to force the status bar to be dark as well
  setStatusDarkMode(true)
})

onMounted(() => {
  setTimeout(() => {
    navigateTo("/home")
  }, 500)
})

onUnmounted(() => {
  // check if are set to light mode first, if yes, then set the status bar back to light mode
  setStatusDarkMode(currentUserProfile.value?.dark_mode)
})
</script>
<template>
  <div>
    <Html>
      <Head>
        <Title>WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News</Title>
        <Meta
          name="og:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <!-- force browser top color dark -->
        <Meta name="theme-color" :content="browserTopColorDarkMode" />
        <Meta name="msapplication-TileColor" :content="browserTopColorDarkMode" />
      </Head>
    </Html>
    <div class="page style-mode-dark" :class="[`${String(route.name)}`]">
      <Transition name="fade">
        <section class="loading-holder">
          <WnycLoader class="loader-anim" />
        </section>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-holder {
  display: flex;
  position: absolute;
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  width: 100vw;
  left: 0;
  right: 0;

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

.index-page {
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}
</style>
