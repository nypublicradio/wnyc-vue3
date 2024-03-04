<script setup>
import humps from "humps"
import { cmsSources } from "~/composables/globals"
import { normalizeArticlePage } from "~/composables/data/articlePages"
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
const fetchedEpisodes = ref(null)

//fetch the number of episodes for the props.show
const getEpisodes = async () => {
  try {
    const res = await $fetch(`${config.public.PUBLISHER_BASE_API}v3/story/`, {
      params: {
        [props.show.type]: props.show.slug,
        ordering: "-newsdate",
        page: 1,
        page_size: props.episodesPerShow,
        audio_only: true,
      },
    })
    const resData = res.data
    for (let i = 0; i < resData.length; i++) {
      resData[i].cmsSource = cmsSources.PUBLISHER
      resData[i] = normalizeArticlePage(humps.camelizeKeys(resData[i]))
    }

    fetchedEpisodes.value = resData
  } catch (e) {
    console.error("getEpisodes error = ", e)
  }
}
onMounted(() => {
  setTimeout(() => {
    getEpisodes()
  }, 500)
})
</script>
<template>
  <div v-if="fetchedEpisodes">
    <!-- <pre class="text-xs">{{ fetchedEpisodes }}</pre> -->
    <EpisodeItem
      v-for="episode in fetchedEpisodes"
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
</template>
