<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

useHead({
  bodyAttrs: {
    class: 'hide-header hide-bottom-menu background-gradient style-mode-dark',
  },
})
</script>

<template>
  <div>
    <section class="index-page flex flex-column">
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
        <Button
          class="w-13rem m-auto"
          label="Create Free Account"
          rounded
          size="small"
        />
        <p>or</p>
        <Button
          class="w-13rem m-auto"
          label="Log in"
          rounded
          size="small"
          severity="secondary"
        />
        <p>
          <VFlexibleLink to="/home">Skip this</VFlexibleLink>, I’ll create an
          account later.
        </p>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
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
