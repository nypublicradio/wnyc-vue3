<script setup>
import { dynamicNavigation, isolateSlug } from "~/utilities/helpers"

const props = defineProps({
  episodesPerShow: {
    type: Number,
    default: 3,
  },
  show: {
    type: Object,
    default: null,
  },
})

const config = useRuntimeConfig()

// 1. Fetch global redirects once per SSR payload (cached globally)
const { data: cachedRedirects } = await useFetchWrapper(
  "/api/show-slug-redirects",
  {
    key: "global-show-redirects",
  }
)

// 2. Fetch show info & episodes in a single consolidated pass
const {
  data: episodes,
  status,
  error,
} = await useAsyncData(`recent-episodes-${props.show?.slug}`, async () => {
  // Resolve redirect slug natively
  const r = cachedRedirects.value?.find(
    (r) => r.from.endsWith(`/${props.show.slug}`) || r.from === props.show.slug
  )
  const slug = r ? isolateSlug(r.to) : props.show.slug

  // Fetch Wagtail show config safely
  const showInfo = await $fetch(
    `${config.public.BFF_URL}/api/pages/wagtail/${slug}?showOnly=true`
  ).catch((e) => {
    if (e.response?.status === 404) return null
    throw e
  })

  const podcastId = showInfo?.linkedDataSource?.[0]?.value?.id
  if (!podcastId) return []

  // Fetch the recent episodes
  const episodeData = await $fetch(
    `${config.public.BFF_URL}/api/v3/show/${podcastId}/episodes`,
    { query: { offset: 0, limit: props.episodesPerShow } }
  ).catch((e) => {
    if (e.response?.status === 404) return null
    throw e
  })

  // Return the formatted array payload straight into `episodes.value`
  const items = episodeData?.data || []
  return items.map((ep) => ({ ...ep, showTitle: showInfo?.title }))
})
</script>
<template>
  <div v-if="status === 'pending'">
    <skeleton-media-card
      v-for="i in props.episodesPerShow"
      :key="`sk-${i}`"
      showPlayButton
      is-horizontal
      imgCol="w-7rem h-7rem md:w-12rem md:h-12rem"
      :size="[1, 1]"
      :showBg="false"
      :showBgMobile="false"
      class="my-5"
    />
  </div>
  <div v-else-if="episodes && episodes.length > 0" :key="props.show.media_id">
    <MediaCard
      v-for="episode in episodes"
      :key="episode.id"
      :data="episode"
      class="my-5"
      showPlayButton
      is-horizontal
      imgCol="w-7rem h-7rem md:w-12rem md:h-12rem"
      :size="{ xs: [112, 112], md: [192, 192] }"
      :showBg="false"
      :showBgMobile="false"
      showTease
      @on-click="dynamicNavigation(episode)"
    />
    <hr class="mt-5 mb-0" />
  </div>
  <FetchError v-if="error" />
</template>