<script setup>
import {
  isolateSlug
} from "~/utilities/helpers"

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
const { data: cachedRedirects } = await useFetchWrapper("/api/show-slug-redirects", {
  key: "global-show-redirects",
})

// 2. Fetch show info & episodes in a single consolidated pass
const { data: episodes, status, error } = await useAsyncData(
  `recent-episodes-${props.show?.slug}`,
  async () => {
    // Resolve redirect slug natively
    const redirect = cachedRedirects.value?.find(
      (redirectItem) =>
        redirectItem.from.endsWith(`/${props.show?.slug}`) ||
        redirectItem.from === props.show?.slug
    )

    // if redirect.to is an external url (http/https) skip the rest and return empty array
    if (redirect?.to.startsWith("http")) {
      return []
    }

    const slug = redirect ? isolateSlug(redirect.to) : props.show?.slug

    // Fetch Wagtail show config safely
    const showInfo = await $fetch(
      `${config.public.BFF_URL}/api/pages/wagtail/${slug}?showOnly=true`
    ).catch((e) => {
      if (e.response?.status === 404) return null
      throw e
    })
    // get the Simple cast podcast ID
    const podcastId = showInfo?.linkedDataSource?.[0]?.value?.id
    if (!podcastId) return []

    // Fetch the recent episodes from the podcastId
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
  }
)
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
  <div v-else-if="episodes?.length > 0" :key="props.show?.media_id">
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
    />
    <hr class="mt-5 mb-0" />
  </div>
  <FetchError v-if="error" />
</template>
