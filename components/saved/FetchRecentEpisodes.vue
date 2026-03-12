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

// const { data, status, error } = useFetch(
//   `${config.public.BFF_URL}/api/show/${props.show.slug}`,
//   {
//     params: {
//       pageSize: props.episodesPerShow,
//     },
//   }
// )
const podcastId = ref(null)
const episodes = ref(null)
const {
  data: show,
  status,
  error,
} = useFetch(
  `${config.public.BFF_URL}/api/pages/wagtail/${props.show.slug}?showOnly=true`,
  {
    onResponse(res) {
      podcastId.value = res.response._data.linkedDataSource[0].value.id
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
      //pendingMore.value = false
      //meta.value = res.response._data.meta
      //episodes.value = res.response._data.data
      console.log("res.response._data.data = ", res.response._data.data)
      episodes.value = res.response._data.data
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
  <div v-if="scStatus === 'success' && episodes">
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
    <hr />
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
