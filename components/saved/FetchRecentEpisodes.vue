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
const episodes = ref(null)
const pendingMore = ref(true)
const updatedSlug = ref(props.show.slug)

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
      const newSlug = redirect.to.split("/").filter(Boolean).pop()
      updatedSlug.value = newSlug
    }
  } catch (e) {
    console.error("Failed to process redirect:", e)
  }
}

await checkRedirectAndFetch()

const { data: showInfo, error } = useFetch(
  () =>
    `${config.public.BFF_URL}/api/pages/wagtail/${updatedSlug.value}?showOnly=true`
)

const podcastId = computed(
  () => showInfo.value?.linkedDataSource?.[0]?.value?.id ?? null
)

// if there's no podcastId after show loads, stop pending
watch(showInfo, (val) => {
  if (val && !val.linkedDataSource?.[0]?.value?.id) {
    pendingMore.value = false
  }
})

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
        episode.showTitle = showInfo.value?.title
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
