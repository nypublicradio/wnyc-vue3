<script setup>
//import { useUpdateCommentCounts } from "~/composables/comments"

const config = useRuntimeConfig()
const { data: pagedata } = useFetch(`${config.public.BFF_URL}/api/homepage`)
const homeTemplate = ref(pagedata?.value?.home_template ?? null)
const topStories = ref(pagedata?.value?.top_stories ?? null)
const localNewscast = ref(pagedata?.value?.local_newscast ?? null)
const nationalNewscast = ref(pagedata?.value?.national_newscast ?? null)

definePageMeta({
  layout: "default",
  layoutTransition: {
    name: "login",
  },
})
useHead({
  bodyAttrs: {
    class: "show-header",
  },
})

watch(pagedata, () => {
  homeTemplate.value = pagedata.value.home_template
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
      <h2 class="mb-2">Top stories</h2>
      <!-- <pre>{{ topStories[0] }}</pre> -->
      <TopStories :articles="topStories" />
    </section>
    <div v-for="section in homeTemplate" :key="section.title">
      <div v-if="section.data.length">
        <section>
          <h2>{{ section.title }}</h2>
        </section>
        <section>
          <TopStories
            v-if="section.componentType === 'default'"
            :articles="section.data"
          />
        </section>
        <WNYCFeatured else :articles="section.data" />
      </div>
    </div>
  </div>
</template>
