<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher.vue'
import VProgressScrubber from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VProgressScrubber.vue'
import { trackClickEvent, isLiveStream } from '~/utilities/helpers'
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
</script>

<template>
  <section class="expanded-player flex flex-column gap-3">
    <VImagePublisher
      :src="currentEpisode.image"
      :alt="currentEpisode.title"
      :width="144"
      :height="144"
      class="show-image max-w-9rem m-auto"
      :ratio="[1, 1]"
    />
    <div class="station flex gap-2">
      <LiveBadge />
      <p>{{ currentEpisode.station }}</p>
    </div>
    <h2 class="text-lg">{{ currentEpisode.title }}</h2>
    <h2 class="title">{{ currentEpisode.details }}</h2>
    <div class="title" v-html="currentEpisode.episodeTitle" />
    <div class="progress-holder">
      <VProgressScrubber :progress="currentEpisodeProgress" />
      <div class="flex justify-content-between">
        <div>{{ currentEpisodeProgress }}</div>
        <div>{{ currentEpisodeDuration }}</div>
      </div>
    </div>

    <div class="controls flex gap-3 justify-content-center">
      <Button severity="secondary" rounded>
        <template #icon> <Previous10 /></template>
      </Button>
      <Button v-if="isEpisodePlaying" severity="secondary" rounded>
        <template #icon> <PauseIcon /></template>
      </Button>
      <Button v-else severity="secondary" rounded>
        <template #icon> <PlayIcon /></template>
      </Button>
      <Button severity="secondary" rounded>
        <template #icon> <Next10 /></template>
      </Button>
    </div>
    <div class="tools flex justify-content-between">
      <div class="flex gap-2">
        <Button text severity="secondary" rounded>
          <template #icon> <FollowIcon /></template>
        </Button>
        <Button text severity="secondary" rounded>
          <template #icon> <SleepIcon /></template>
        </Button>
      </div>
      <div class="flex gap-2">
        <Button text severity="secondary" rounded>
          <template #icon> <ShareIcon /></template>
        </Button>
        <Button icon="pi pi-ellipsis-v" text severity="secondary" rounded>
        </Button>
      </div>
    </div>
    <div>image</div>
    <div>description</div>
    <div>author</div>
    <hr />
    <div>More from {{ currentEpisode.title }} ></div>

    <!-- <VImage
      v-if="currentEpisodeHolder?.image"
      :src="currentEpisodeHolder?.image"
      :ratio="[1, 1]"
      alt="show poster image"
      class="image"
    /> -->
    <pre>{{ currentEpisode.onTodaysShowImageTemplate }}</pre>
    <pre>{{ currentEpisode }}</pre>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />

    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <pre>{{ currentEpisode }}</pre>
    <div ref="expandedFooterRef" class="expanded-footer">
      This is fixed to the bottom
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
        background-color: var(--red-500);
        display: block;
        position: fixed;
        height: 45px;
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
