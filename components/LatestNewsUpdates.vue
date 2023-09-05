<script setup>
import { ref, computed, onMounted } from 'vue'
import { trackClickEvent, howLongAgo } from '~/utilities/helpers'
import {
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsStreamLoading,
} from '~/composables/states'

const currentEpisodeHolder = useCurrentEpisodeHolder()
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const isStreamLoading = useIsStreamLoading()

// const { data: local } = await useFetch(
//   'https://api.wnyc.org/api/v3/media-file/news_latest_newscast.mp3'
// )
// const { data: national } = await useFetch(
//   'https://www.wnyc.org/audio/json/346659/'
// )

const national = {
  type: 'media-file',
  id: '235725',
  attributes: {
    first_published_at: '2022-03-24T05:00:50.783506-04:00',
    updated_date: null,
    bitrate: 128,
    error: 'g',
    duration: 178000,
    filename: 'news_latest_npr.mp3',
    'id3-size': 15111,
    path: 'https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/newscast/news_latest_npr.mp3',
    state: 'done',
  },
}
const local = {
  type: 'media-file',
  id: '235724',
  attributes: {
    first_published_at: '2022-03-24T05:00:50.783506-04:00',
    updated_date: '2022-03-24T05:00:50.783506-04:40',
    bitrate: 128,
    error: 'g',
    duration: 151,
    filename: 'news_latest_newscast.mp3',
    'id3-size': 15111,
    path: 'https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/newscast/news_latest_newscast.mp3',
    state: 'done',
  },
}

const props = defineProps({
  //   propVar: {
  //     type: Boolean,
  //     default: false,
  //   },
})

const togglePlay = () => {
  if (
    currentEpisode.value?.slug !== currentEpisodeHolder.value?.slug ||
    currentEpisode.value?.timeStart !== currentEpisodeHolder.value?.timeStart
  ) {
    currentEpisode.value = currentEpisodeHolder.value
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  trackClickEvent('Click Tracking - Live Feature', 'Home Page', 'toggle play')
}

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
</script>

<template>
  <div>
    <div class="latest-news-updates grid">
      <div v-if="local" class="col-6">
        <div class="news-card">
          <badge label="Local NYC News" />
          <div class="news-title">
            <div class="font-bold">Current Headlines</div>
            <div>
              WNYC&nbsp;|&nbsp;{{
                local.attributes.updated_date
                  ? howLongAgo(local.attributes.updated_date)
                  : howLongAgo(local.attributes.first_published_at)
              }}
            </div>
          </div>
          <SmallPlay
            :label="local.attributes.duration"
            :isPLaying="isEpisodePlaying"
            :isLoading="isStreamLoading"
            @onClick="togglePlay"
          />
        </div>
      </div>
      <div class="col-6"><div class="news-card">This is interesting</div></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.latest-news-updates {
  .news-card {
    background-color: var(--background2);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    .news-title {
      font-size: 0.813rem;
    }
  }
}
</style>
