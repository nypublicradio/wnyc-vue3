<script setup>
import { trackClickEvent, whenTime, getMinutes } from '~/utilities/helpers'
import { useTogglePlayTrigger, useCurrentEpisode } from '~/composables/states'

const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

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
  image: 'https://media.wnyc.org/i/60/60/l/85/1/WNYC_news.png',
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
  image: 'https://media.wnyc.org/i/60/60/l/85/1/WNYC_news.png',
  'id3-size': 15111,
  file: 'https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/newscast/news_latest_newscast.mp3',
  details: "<p>Here are the stories we're following today.</p>",
  state: 'done',
}

// handles play button click that updates the currentEpisode if it is a different file and togglePlayTrigger states
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
</script>

<template>
  <div>
    <div class="latest-news-updates grid">
      <div class="col-6">
        <div class="card-small" @click="togglePlay(local)">
          <Badge label="Local NYC News" />
          <div class="news-title">
            <div class="font-bold">Current Headlines</div>
            <PipeData>
              <template #left>WNYC</template>
              <template #right>
                <span class="nobreak">{{ whenTime(local) }}</span>
              </template>
            </PipeData>
          </div>
          <PlayButton :label="getMinutes(local.duration)" :episode="local" />
        </div>
      </div>
      <div class="col-6">
        <div class="card-small" @click="togglePlay(national)">
          <Badge
            label="national NYC News"
            color="var(--background-500)"
            bg-color="var(--indigo-500)"
          />
          <div class="news-title">
            <div class="font-bold">11AM Update</div>
            <PipeData>
              <template #left>WNYC</template>
              <template #right>
                <span class="nobreak">{{ whenTime(national) }}</span>
              </template>
            </PipeData>
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
  .card-small {
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
