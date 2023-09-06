<script setup>
import { trackClickEvent, howLongAgo } from '~/utilities/helpers'
import { useTogglePlayTrigger, useCurrentEpisode } from '~/composables/states'

const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

// const { data: local } = await useFetch(
//   'https://api.wnyc.org/api/v3/media-file/news_latest_newscast.mp3'
// )
// const { data: national } = await useFetch(
//   'https://www.wnyc.org/audio/json/346659/'
// )

const national = {
  type: 'media-file',
  id: '235725',
  first_published_at: '2022-03-24T05:00:50.783506-04:00',
  updated_date: null,
  bitrate: 128,
  error: 'g',
  duration: 178000,
  filename: 'news_latest_npr.mp3',
  title: 'National News',
  image: '	https://media.wnyc.org/i/60/60/l/85/1/WNYC_news.png',
  'id3-size': 15111,
  file: 'https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/newscast/news_latest_npr.mp3',
  details: '<p>Latest news from NPR.</p>',
  state: 'done',
}
const local = {
  type: 'media-file',
  id: '235724',
  first_published_at: '2022-03-24T05:00:50.783506-04:00',
  updated_date: '2022-03-24T05:00:50.783506-04:40',
  bitrate: 128,
  error: 'g',
  duration: 124000,
  filename: 'news_latest_newscast.mp3',
  title: 'Local NYC News',
  image: '	https://media.wnyc.org/i/60/60/l/85/1/WNYC_news.png',
  'id3-size': 15111,
  file: 'https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/newscast/news_latest_newscast.mp3',
  details: "<p>Here are the stories we're following today.</p>",
  state: 'done',
}

// const props = defineProps({
//   //   propVar: {
//   //     type: Boolean,
//   //     default: false,
//   //   },
// })

const togglePlay = (media) => {
  if (currentEpisode.value?.file !== media.file) {
    currentEpisode.value = media
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  trackClickEvent(
    'Click Tracking - Latest News Updates',
    media.title,
    'toggle play'
  )
}

const getMinutes = (ms) => {
  const seconds = Math.floor(ms / 1000)
  let minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  remainingSeconds > 30 ? minutes++ : minutes
  return `${minutes} min`
}
</script>

<template>
  <div>
    <div class="latest-news-updates grid">
      <div class="col-6">
        <div class="news-card" @click="togglePlay(local)">
          <badge label="Local NYC News" />
          <div class="news-title">
            <div class="font-bold">Current Headlines</div>
            <div>
              WNYC&nbsp;|&nbsp;{{
                local.updated_date
                  ? howLongAgo(local.updated_date)
                  : howLongAgo(local.first_published_at)
              }}
            </div>
          </div>
          <PlayButton :label="getMinutes(local.duration)" :episode="local" />
        </div>
      </div>
      <div class="col-6">
        <div class="news-card" @click="togglePlay(national)">
          <badge
            label="national NYC News"
            color="var(--background-500)"
            bg-color="var(--indigo-500)"
          />
          <div class="news-title">
            <div class="font-bold">11AM Update</div>
            <div>
              NPR&nbsp;|&nbsp;{{
                national.updated_date
                  ? howLongAgo(national.updated_date)
                  : howLongAgo(national.first_published_at)
              }}
            </div>
          </div>
          <PlayButton
            :label="getMinutes(national.duration)"
            :episode="national"
          />
        </div>
      </div>
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
