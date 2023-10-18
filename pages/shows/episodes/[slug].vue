<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import { templatizePublisherImageUrl } from '~/utilities/helpers'
// navigate back to home and track it
const route = useRoute()
const router = useRouter()
const backToShow = () => {
  router.go(-1)
}
</script>

<template>
  <section class="episode-page">
    <div class="flex align-items-center">
      <Button
        class="back-btn text-color -ml-3"
        icon="pi pi-chevron-left"
        rounded
        text
        severity="secondary"
        aria-label="back to previous page"
        @click="backToShow"
      />
      <h2>Back to Show</h2>
      <h1>Episode page</h1>
    </div>
  </section>
</template>

<style lang="scss">
.episode-page {
}
</style>
