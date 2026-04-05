<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
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
const podcastId = ref(null)
const episodes = ref(null)
const pendingMore = ref(true)
const updatedSlug = ref(props.show.slug)

// fetch is executed when fetchShow is called, and when updatedSlug is populated
const {
  data: showInfo,
  error,
  execute: fetchShow,
} = useFetch(
  () =>
    `${config.public.BFF_URL}/api/pages/wagtail/${updatedSlug.value}?showOnly=true`,
  {
    onResponse(res) {
      //console.log("res.response._data = ", res.response._data)
      const pId = res.response._data.linkedDataSource?.[0]?.value?.id
      if (pId) {
        podcastId.value = pId
      } else {
        pendingMore.value = false
      }
    },
    immediate: false,
  }
)

// Check if the show slug needs to be updated due to a redirect
const checkRedirectAndFetch = async () => {
  try {
    const { data: cachedRedirects } = await useFetch(
      "/api/show-slug-redirects",
      {
        key: "global-show-redirects",
        getCachedData(key, nuxtApp) {
          return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
        },
      }
    )

    const redirect = cachedRedirects.value?.find(
      (r) =>
        r.from.endsWith(`/${props.show.slug}`) || r.from === props.show.slug
    )

    if (redirect) {
      // Extract the slug from the redirect destination URL
      const newSlug = redirect.to.split("/").filter(Boolean).pop()
      updatedSlug.value = newSlug
      fetchShow() // Fetch explicitly with the updated slug
      return newSlug
    } else {
      fetchShow() // Manually trigger if no change to updatedSlug
      return props.show.slug
    }
  } catch (e) {
    console.error("Failed to process redirect:", e)
    fetchShow() // Fallback anyway
    return props.show.slug
  }
}

// Call the function on setup
checkRedirectAndFetch()

// watching for the podcastId to change to fetch episodes
const { error: scError } = useFetch(
  () =>
    `${config.public.BFF_URL}/api/v3/show/${
      podcastId.value
    }/episodes?offset=0&limit=${props.episodesPerShow || 3}`,
  {
    onResponse(res) {
      //meta.value = res.response._data.meta
      //episodes.value = res.response._data.data
      //console.log("res.response._data.data = ", res.response._data.data)
      episodes.value = res.response._data.data
      // missing show title added from show data
      episodes.value.forEach((episode) => {
        episode.showTitle = showInfo.value.title
      })
      pendingMore.value = false
    },
    onError(error) {
      //pendingMore.value = false
      const globalToast = useGlobalToast()
      globalToast.value = {
        severity: "error",
        summary:
          "Sorry. We are having trouble loading more episodes. Please try again later.",
        life: null,
        closable: true,
      }
      console.error("error = ", error)
    },
    watch: [podcastId],
    immediate: false,
  }
)
</script>
<template>
  <div v-if="!pendingMore" :key="props.show.media_id">
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
  <div v-else>
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
  <FetchError v-if="scError || error" />
</template>
