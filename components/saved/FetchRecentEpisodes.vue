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

// const { data: oldShow } = useFetch(
//   `${config.public.BFF_URL}/api/show/${props.show.slug}`,
//   {
//     params: {
//       pageSize: props.episodesPerShow,
//     },
//   }
// )
//console.log("props.show = ", props.show)
const podcastId = ref(null)
const episodes = ref(null)
const pendingMore = ref(true)
const {
  data: show,
  status,
  error,
} = useFetch(
  `${config.public.BFF_URL}/api/pages/wagtail/${props.show.slug}?showOnly=true`,
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
  }
)

const {
  data,
  status: scStatus,
  error: scError,
} = useFetch(
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
        episode.showTitle = show.value.title
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
    <!-- {{ podcastId }} -->
    <!-- <pre>{{ oldShow }}</pre> -->
    <!-- <pre>{{ episodes }}</pre> -->
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
