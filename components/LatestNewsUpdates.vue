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
  first_published_at: '2023-09-06T05:00:50.783506-04:00',
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
  first_published_at: '2023-08-24T05:00:50.783506-04:00',
  updated_date: '2023-09-07T13:10:50',
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

// returns the rounded up minutes duration of the episode
const getMinutes = (ms) => {
  const seconds = Math.floor(ms / 1000)
  let minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  remainingSeconds > 30 ? minutes++ : minutes
  return `${minutes} min`
}

// returns the time since the episode was published, but checks for updated_date first
const whenTime = (data) => {
  return data.updated_date
    ? howLongAgo(data.updated_date)
    : howLongAgo(data.first_published_at)
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
            <div>WNYC&nbsp;|&nbsp;{{ whenTime(local) }}</div>
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
            <div>NPR&nbsp;|&nbsp;{{ whenTime(national) }}</div>
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
    cursor: pointer;
    .news-title {
      font-size: 0.813rem;
    }
  }
}
</style>
