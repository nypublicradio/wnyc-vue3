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

const { data, pending, error } = useFetch(
  `${config.public.BFF_URL}/api/show/${props.show.slug}`,
  {
    params: {
      pageSize: props.episodesPerShow,
    },
  }
)
</script>
<template>
  <div v-if="!pending">
    <EpisodeItem
      v-for="episode in data.episodes.data"
      :data="episode"
      :key="episode.id"
      class="my-5"
      @on-click="dynamicNavigation(episode)"
    />
    <hr />
  </div>
  <div v-else>
    <skeleton-episode-item v-for="i in props.episodesPerShow" :key="i" class="my-5" />
  </div>
  <FetchError v-if="error" />
</template>
