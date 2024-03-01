<script setup>
import axios from "axios"
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

const getEpisodes = async () => {
  try {
    const option = {
      method: "GET",
      url: `${config.public.PUBLISHER_BASE_API}v3/story/`,
      params: {
        [props.show.type]: props.show.slug,
        ordering: "-newsdate",
        page: 1,
        page_size: props.episodesPerShow,
        audio_only: true,
      },
    }
    const res = await axios(option)
    const resData = res.data.data
    for (let i = 0; i < resData.length; i++) {
      resData[i].cmsSource = cmsSources.PUBLISHER
      resData[i] = normalizeArticlePage(humps.camelizeKeys(resData[i]))
    }
    //console.log(resData)

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
    <EpisodeItem
      :data="episode"
      v-for="episode in fetchedEpisodes"
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

<style></style>
