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

const { data, status, error } = useFetch(
  `${config.public.BFF_URL}/api/show/${props.show.slug}`,
  {
    params: {
      pageSize: props.episodesPerShow,
    },
  }
)
</script>
<template>
  <div v-if="status === 'success'">
    <MediaCard
      v-for="episode in data.episodes.data"
      :key="episode.id"
      :data="episode"
      class="my-5"
      showPlayButton
      is-horizontal
      imgCol="w-7rem"
      :showBg="false"
      :showBgMobile="false"
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
      imgCol="w-7rem"
      :size="[1, 1]"
      :showBg="false"
      :showBgMobile="false"
      class="my-5"
    />
  </div>
  <FetchError v-if="error" />
</template>
