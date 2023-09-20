<script setup>
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
  <div class="expanded-player">
    <!-- <Vimage
      :src="currentEpisode.image"
      :alt="currentEpisode.title"
      class="expanded-image"
    />
    <VImage
      v-if="currentEpisodeHolder?.image"
      :src="currentEpisodeHolder?.image"
      :ratio="[1, 1]"
      alt="show poster image"
      class="image"
    /> -->
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
  </div>
</template>

<style lang="scss">
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
</style>
