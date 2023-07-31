<script setup async>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
useHead({
  bodyAttrs: {
    class: 'hide-header hide-bottom-menu background-gradient style-mode-dark',
  },
})

definePageMeta({
  layout: 'blank',
})

definePageMeta({
  middleware: 'check-auth-provider',
})

const route = useRoute()
const isLoading = ref(true)
onMounted(() => {
  setTimeout(() => {
    // if no redirect has happened, we can hide the loading spinner
    isLoading.value = false
  }, 999)
})
</script>
<template>
  <div class="page" :class="[`${String(route.name)}`]">
    <Transition name="fade">
      <section v-if="isLoading" style="position: absolute; height: 100vh">
        <ProgressSpinner
          class="loading-spinner"
          strokeWidth="8"
          animationDuration=".5s"
          aria-label="Custom ProgressSpinner"
        />
      </section>
      <section v-else class="index-page flex flex-column pb-8">
        <WnycLogo class="w-12rem m-auto my-7" />
        <h1 class="headline">What's new?</h1>
        <ul class="list m-auto mt-4 mb-7">
          <li>Listen to WNYC's Live Radio Stream</li>
          <li>Get the latest news updates</li>
          <li>Stream your favorite podcasts</li>
          <li>Read local news from Gothamist</li>
          <li>Follow your favorite shows</li>
        </ul>
        <h1 class="headline mb-4">Get started!</h1>
        <div class="text-center flex flex-column gap-3">
          <VFlexibleLink raw to="/signup" class="w-13rem m-auto">
            <Button
              class="w-full"
              label="Create Free Account"
              rounded
              size="small"
            />
          </VFlexibleLink>
          <p>or</p>
          <VFlexibleLink raw to="/login" class="w-13rem m-auto">
            <Button
              class="w-full"
              label="Log in"
              rounded
              size="small"
              severity="secondary"
            />
          </VFlexibleLink>
          <p>
            <VFlexibleLink to="/home">Skip this</VFlexibleLink>, I'll create an
            account later.
          </p>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.loading-spinner {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 80px;
  height: 80px;
}
.index-page {
  .headline {
    font-size: 30px;
    text-align: center;
    letter-spacing: -0.6px;
    font-family: $fontFamilyTisa;
  }
  .list {
    li {
      font-size: 1rem;
      line-height: normal;
      margin-bottom: 0.5rem;
      letter-spacing: 0.32px;
    }
  }
}
</style>
