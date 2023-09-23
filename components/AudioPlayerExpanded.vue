<script setup>
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher.vue'
import VProgressScrubber from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VProgressScrubber.vue'
import {
  trackClickEvent,
  isLiveStream,
  whenTime,
  resizePublisherImageUrl,
} from '~/utilities/helpers'
import {
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useIsPlayerMinimized,
  useIsStreamLoading,
  useCurrentEpisodeDuration,
  useCurrentEpisodeProgress,
} from '~/composables/states'

const emit = defineEmits(['close-panel'])

const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const isPlayerMinimized = useIsPlayerMinimized()
const isStreamLoading = useIsStreamLoading()
const currentEpisodeDuration = useCurrentEpisodeDuration()
const currentEpisodeProgress = useCurrentEpisodeProgress()

const expandedFooterRef = ref(null)
const expandedFooterheight = ref(0)

onMounted(() => {
  expandedFooterheight.value = `${expandedFooterRef.value.offsetHeight}px`
})

const moreFromClick = () => {
  trackClickEvent(
    `Click Tracking - Expanded Audio Player More from ${currentEpisode.title}`,
    'Expanded Audio Player',
    currentEpisode.title
  )
  emit('close-panel')
  navigateTo(`/shows/${currentEpisode.slug}`)
}
</script>

<template>
  <section class="expanded-player flex flex-column gap-3">
    <VImagePublisher
      :src="currentEpisode.image"
      :alt="`${currentEpisode.title} show image`"
      :width="144"
      :height="144"
      class="show-image max-w-9rem m-auto"
      :ratio="[1, 1]"
    />
    <div v-if="!isLiveStream" class="station live flex gap-2">
      <LiveBadge />
      <p>{{ currentEpisode.station }}</p>
      <h2 class="text-lg">{{ currentEpisode.title }}</h2>
    </div>
    <div v-else class="station">
      <PipeData class="text-xs" :hidePipe="whenTime(currentEpisode)">
        <template #left
          ><h2>{{ currentEpisode.title }}</h2></template
        >
        <template #right>
          <h2 class="nobreak">{{ whenTime(currentEpisode) }}</h2>
        </template>
      </PipeData>
    </div>
    <h2 class="title">{{ currentEpisode.onTodaysShowHeadline }}</h2>

    <div v-if="!isLiveStream" class="progress-holder">
      <VProgressScrubber :progress="currentEpisodeProgress" />
      <div class="flex justify-content-between">
        <div>{{ currentEpisodeProgress }}</div>
        <div>{{ currentEpisodeDuration }}</div>
      </div>
    </div>

    <div class="controls flex gap-3 justify-content-center">
      <Button disabled="!isLiveStream" severity="secondary" rounded>
        <template #icon> <Previous10 /></template>
      </Button>
      <Button v-if="isEpisodePlaying" severity="secondary" rounded>
        <template #icon> <PauseIcon /></template>
      </Button>
      <Button v-else severity="secondary" rounded>
        <template #icon> <PlayIcon /></template>
      </Button>
      <Button disabled="!isLiveStream" severity="secondary" rounded>
        <template #icon> <Next10 /></template>
      </Button>
    </div>
    <div class="tools flex justify-content-between">
      <div v-if="isLiveStream" class="flex gap-3">
        <Button text severity="secondary" rounded>
          <template #icon> <FollowIcon /></template>
        </Button>
        <Button text severity="secondary" rounded>
          <template #icon> <SleepIcon /></template>
        </Button>
      </div>
      <div v-else class="flex gap-3">
        <Button text severity="secondary" rounded>
          <template #icon> <StarIcon /></template>
        </Button>
        <Button text severity="secondary" rounded>
          <template #icon> <DownloadIcon /></template>
        </Button>
      </div>
      <div class="flex gap-3">
        <Button text severity="secondary" rounded>
          <template #icon> <ShareIcon /></template>
        </Button>
        <Button icon="pi pi-ellipsis-v" text severity="secondary" rounded>
        </Button>
      </div>
    </div>
    <VImagePublisher
      v-if="currentEpisode.onTodaysShowImageTemplate"
      :src="currentEpisode.onTodaysShowImageTemplate"
      :alt="`${currentEpisode.title} featured image`"
      :width="421"
      :height="275"
      class="show-feature-image"
    >
      <template #caption>
        <div
          class="caption text-sm mt-2"
          v-html="currentEpisode.onTodaysShowImageCaption"
        />
      </template>
      <template #belowImage>
        <div
          class="caption text-sm mt-2 html-formatting"
          v-html="currentEpisode.episodeBody"
        />
      </template>
    </VImagePublisher>

    <div v-if="currentEpisode.onTodaysShowHosts">
      <div class="flex gap-4 flex-wrap">
        <ClientOnly>
          <Author
            v-for="author in currentEpisode.onTodaysShowHosts"
            :imgSrc="resizePublisherImageUrl(author.image, 40, 40, 80)"
            :name="`${author['first-name']} ${author['last-name']}`"
            :to="author.url"
          />
        </ClientOnly>
      </div>
    </div>
    <div v-if="currentEpisode.episodeTranscript">
      <h2>Transcript</h2>
      <div
        v-html="currentEpisode.episodeTranscript"
        class="html-formatting"
      ></div>
    </div>

    <div ref="expandedFooterRef" class="expanded-footer">
      <section class="pb-2">
        <hr class="mb-2" />
        <Button
          text
          severity="secondary"
          :label="`More from ${currentEpisode.title}`"
          icon="pi pi-chevron-right"
          iconPos="right"
          class="flex m-auto"
          @click="moreFromClick"
        />
      </section>
    </div>
  </section>
</template>

<style lang="scss">
:root {
  .persistent-player {
    .expanded-player {
      padding-bottom: calc(
        $bottomMenuHeight + env(safe-area-inset-bottom) +
          v-bind(expandedFooterheight)
      );
      .expanded-footer {
        background: var(--persistent-player-bg);
        display: block;
        position: fixed;
        //height: 45px;
        bottom: 0;
        left: 0;
        width: 100%;
        transition: bottom $transitionDuration;
        -webkit-transition: bottom $transitionDuration;
      }
      .progress-holder {
        .progress-control {
          position: relative;
          left: unset;
          padding-bottom: 0.75rem;
          width: 100%;
          .p-slider-horizontal .p-slider-range {
            height: 0.286rem;
          }
        }
      }
      .controls {
        .p-button {
          width: 50px;
          height: 50px;
          .play-icon,
          .pause-icon {
            width: 20px;
            height: 20px;
          }
        }
      }
      .tools {
      }
    }
    &.expanded {
      .expanded-footer {
        bottom: calc($bottomMenuHeight + env(safe-area-inset-bottom));
      }
    }
    .template-blank {
      .expanded-footer {
        bottom: env(safe-area-inset-bottom) !important;
      }
    }
  }
}
</style>
