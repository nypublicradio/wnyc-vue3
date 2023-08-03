<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import {
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
} from '~/composables/states'
const { $analytics } = useNuxtApp()
const currentEpisodeHolder = useCurrentEpisodeHolder()

const togglePlay = () => {
  if (!currentEpisode.value) {
    currentEpisode.value = currentEpisodeHolder.value
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  emit('on-click', !isEpisodePlaying.value)
  isPaused.value = !isPaused.value
}
</script>

<template>
  <div class="live-player flex">
    <div class="image-holder">
      <VImage
        v-if="currentEpisodeHolder?.image"
        :src="currentEpisodeHolder?.image"
        :ratio="[1, 1]"
        alt="show poster image"
        class="image"
      />
      <WnycLoader v-else class="image-loader-anim" size="30%" />
    </div>

    <div
      v-if="currentEpisodeHolder"
      class="content flex flex-column gap-2 justify-content-center"
    >
      <h2>{{ currentEpisodeHolder?.title }}</h2>
      <div
        class="blurb truncate t2lines"
        v-html="currentEpisodeHolder?.details"
      ></div>
      <SmallPlay :label="currentEpisodeHolder?.station" live />
    </div>
    <div
      class="content skeleton-holder flex flex-column justify-content-center w-full"
      v-else
    >
      <Skeleton width="6rem" borderRadius="16px"></Skeleton>
      <div class="w-full">
        <Skeleton height="13px" borderRadius="16px" class="mb-1"></Skeleton>
        <Skeleton height="13px" borderRadius="16px"></Skeleton>
      </div>
      <Skeleton height="28px" width="9rem" borderRadius="16px"></Skeleton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$container-breakpoint-xs: useBreakpointOrFallback('xs', 375px);
.live-player {
  container-type: inline-size;
  position: relative;
  background-color: var(--background2);

  .image-holder {
    flex: none;
    .image,
    .image-loader-anim {
      width: 138px;
      height: 138px;
    }
  }
  .content {
    padding: 1rem;
    &.skeleton-holder {
      gap: 0.75rem;
    }
  }
}
@container (max-width: #{$container-breakpoint-xs}) {
  .live-player {
    .image-holder {
      flex: none;
      .image,
      .image-loader-anim {
        width: 90px;
        height: 90px;
      }
    }
    .content {
      .blurb {
        display: none;
      }
    }
  }
}
</style>
