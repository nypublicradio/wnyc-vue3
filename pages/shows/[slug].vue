<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'

import StarIcon from '~/components/icons/StarIcon.vue'
import PlayIcon from '~/components/icons/PlayIcon.vue'
import ShareIcon from '~/components/icons/ShareIcon.vue'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
console.log('route = ', route)

const { data: show } = await useFetch(
  `${config.public.BFF_URL}/api/show/${route.params.slug}`
)
const thisShow = ref(show?.value ?? null)
const pagination = ref(thisShow?.value.episodes.meta ?? null)
const episodes = ref(thisShow?.value.episodes.data ?? null)
const showImage = ref(thisShow?.value.show.included[1].attributes.template)
const showTitle = ref(thisShow?.value.show.data.attributes.title)
const showTease = ref(thisShow?.value.show.data.attributes.tease)

console.log('thisShow = ', thisShow)

// navigate back to home and track it
const backHome = () => {
  router.go(-1)
}

const goToEpisodePage = (ep) => {
  navigateTo(`/shows/episode/${ep.attributes.slug}`)
}

const togglePlayMostRecentEpisode = () => {
  console.log('togglePlay')
}
const handleStar = () => {
  console.log('handleStar')
}
const handleShare = () => {
  console.log('handleShare')
}

watch(show, () => {
  thisShow.value = show.value
})
</script>

<template>
  <section class="shows-page">
    <div class="flex align-items-center">
      <Button
        class="back-btn text-color -ml-4"
        icon="pi pi-chevron-left"
        rounded
        text
        severity="secondary"
        aria-label="back to previous page"
        @click="backHome"
        label="Browse"
      />
    </div>

    <VImage
      :src="showImage"
      :alt="`${showTitle} show image`"
      :width="144"
      :height="144"
      class="show-image max-w-9rem m-auto"
      :ratio="[1, 1]"
      :srcset="[2]"
      style="min-height: 144px"
    />
    <div class="flex justify-content-center align-items-center gap-2 mt-2 mb-4">
      <Button rounded text plain @click="handleStar">
        <template #icon> <StarIcon class="w-2rem" /></template>
      </Button>

      <Button
        class="w-3rem h-3rem"
        severity="secondary"
        rounded
        @click="togglePlayMostRecentEpisode"
      >
        <template #icon> <PlayIcon class="w-1rem h-1rem" /></template>
      </Button>
      <Button text plain rounded @click="handleShare">
        <template #icon> <ShareIcon /></template>
      </Button>
    </div>
    <h2 class="text-lg mt-2">{{ showTitle }}</h2>
    <div
      v-if="showTease"
      class="text-sm mt-2 html-formatting"
      v-html="showTease"
    />
    <h2 class="mt-4">Episodes</h2>
    <div class="flex flex-column gap-4 mt-2">
      <EpisodeItem
        v-for="ep in episodes"
        :show="ep"
        :key="ep.id"
        @onClick="goToEpisodePage(ep)"
      />
    </div>
  </section>
</template>

<style lang="scss">
.shows-page {
}
</style>
