<script setup>
import { useUpdateCommentCounts } from '~/composables/comments'
//onBeforeMount(async () => {
const config = useRuntimeConfig()
const { data: pagedata } = useFetch(`${config.public.BFF_URL}/api/homepage`)
const bucketItems = ref(pagedata?.value?.middle_bucket ?? null)
const topStories = ref(pagedata?.value?.top_stories ?? null)
const localNewscast = ref(pagedata?.value?.local_newscast ?? null)
const nationalNewscast = ref(pagedata?.value?.national_newscast ?? null)

definePageMeta({
  layout: 'default',
  layoutTransition: {
    name: 'login',
  },
})
useHead({
  bodyAttrs: {
    class: 'show-header',
  },
})

watch(pagedata, () => {
  bucketItems.value = pagedata.value.middle_bucket
  topStories.value = pagedata.value.top_stories
  localNewscast.value = pagedata.value.local_newscast
  nationalNewscast.value = pagedata.value.national_newscast
})

// onMounted(async () => {
//   await useUpdateCommentCounts(topStories.value)
// })
</script>

<template>
  <div>
    <!-- <ClientOnly>
        <div class="mt-4 container">
          <h3 class="mb-4">Current User:</h3>
          <p class="mb-4">{{ currentUser }}</p>
          <h3 class="mb-4">User Profile Data:</h3>
          <p class="mb-4">{{ currentUserProfile }}</p>
        </div>
      </ClientOnly> -->

    <LiveFeature />
    <!-- <div class="grid gap-3">
        <div class="col-fixed ad300 hidden lg:block">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
        <div class="col-12 ad300 lg:hidden">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
      </div> -->

    <section>
      <h2 class="mt-4 mb-2">Latest News Updates</h2>
      <LatestNewsUpdates
        class="pt-2"
        :localNewscast="localNewscast"
        :nationalNewscast="nationalNewscast"
      />
    </section>
    <section>
      <h2 class="mb-2">Top stories from Gothamist</h2>
      <!-- <pre>{{ topStories[0] }}</pre> -->
      <TopStories :articles="topStories" />
    </section>
    <section>
      <h2>Featured from WNYC</h2>
    </section>
    <WNYCFeatured :bucketItems="bucketItems" />
  </div>
</template>
