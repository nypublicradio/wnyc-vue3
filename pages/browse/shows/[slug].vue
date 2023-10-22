<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'

import StarIcon from '~/components/icons/StarIcon.vue'
import PlayIcon from '~/components/icons/PlayIcon.vue'
import ShareIcon from '~/components/icons/ShareIcon.vue'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const { data: show } = useFetch(
  `${config.public.BFF_URL}/api/show/${route.params.slug}`
)

const pagination = ref(show?.value?.episodes?.meta ?? null)
const episodes = ref(show?.value?.episodes?.data ?? null)
const showImage = ref(show?.value?.show?.image?.template ?? null)
const showTitle = ref(show?.value?.show?.title ?? null)
const showTease = ref(show?.value?.show?.description ?? null)

// navigate back to home and track it
const backHome = () => {
  navigateTo(`/browse`)
}

const goToEpisodePage = (ep) => {
  navigateTo(`/browse/shows/episode/${ep.attributes.slug}`)
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
  pagination.value = show.value.episodes?.meta
  episodes.value = show.value.episodes?.data
  showImage.value = show.value.show?.image?.template
  showTitle.value = show.value.show?.title
  showTease.value = show.value.show?.description
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
      v-if="showImage"
      :src="showImage"
      :alt="`${showTitle} show image`"
      :width="144"
      :height="144"
      class="show-image max-w-9rem m-auto"
      :ratio="[1, 1]"
      :srcset="[2]"
      style="min-height: 144px"
    />
    <Skeleton
      v-else
      class="flex-none show-image max-w-9rem m-auto"
      height="144px"
      width="144px"
      borderRadius="0px"
    ></Skeleton>
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
    <div v-if="showTitle && showTease">
      <h2 class="text-lg mt-2">{{ showTitle }}</h2>
      <div class="text-sm mt-2 html-formatting" v-html="showTease" />
    </div>
    <div v-else>
      <Skeleton
        height="16px"
        width="45%"
        borderRadius="16px"
        style="margin-bottom: 9px"
      ></Skeleton>
      <Skeleton
        height="12px"
        width="95%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      ></Skeleton>
      <Skeleton
        height="12px"
        width="90%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      ></Skeleton>
      <Skeleton
        height="12px"
        width="75%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      ></Skeleton>
    </div>
    <h2 class="mt-4">Episodes</h2>
    <div class="flex flex-column gap-4 mt-2">
      <EpisodeItem
        v-if="episodes"
        v-for="ep in episodes"
        :ep="ep"
        :key="ep.id"
        @onClick="goToEpisodePage(ep)"
        :fallback-image="showImage"
      />
      <EpisodeItemSkeleton v-else v-for="show in 10" />
    </div>
  </section>
</template>

<style lang="scss">
.shows-page {
}
</style>
