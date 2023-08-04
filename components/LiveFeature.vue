<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import {
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
} from '~/composables/states'
import { trackClickEvent } from '~/utilities/helpers'
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

// handles play button click that updates the currentEpisode and isEpisodePlaying states
const togglePlay = () => {
  if (!currentEpisode.value) {
    currentEpisode.value = currentEpisodeHolder.value
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  trackClickEvent('Click Tracking - Live Feature', 'Home Page', 'toggle play')
}
</script>

<template>
  <div class="live-feature flex">
    <div class="image-holder">
      <transition name="fade">
        <VImage
          v-if="currentEpisodeHolder?.image"
          :src="currentEpisodeHolder?.image"
          :ratio="[1, 1]"
          alt="show poster image"
          class="image"
        />
        <WnycLoader v-else class="image-loader-anim" size="30%" />
      </transition>
    </div>
    <div class="content w-full">
      <transition name="fade">
        <div
          v-if="currentEpisodeHolder"
          class="flex flex-column gap-2 justify-content-center"
        >
          <h2>{{ currentEpisodeHolder?.title }}</h2>
          <div
            class="blurb truncate t2lines"
            v-html="currentEpisodeHolder?.details"
          ></div>
          <SmallPlay
            :label="currentEpisodeHolder?.station"
            live
            :isPLaying="isEpisodePlaying"
            @onClick="togglePlay"
          />
        </div>
        <div
          class="skeleton-holder flex flex-column justify-content-center w-full absolute"
          v-else
        >
          <Skeleton
            height="20px"
            width="6rem"
            borderRadius="16px"
            style="margin-bottom: 6px"
          ></Skeleton>
          <div class="w-full desc">
            <Skeleton
              height="13px"
              width="90%"
              borderRadius="16px"
              style="margin-bottom: 6px"
            ></Skeleton>
            <Skeleton height="13px" width="94%" borderRadius="16px"></Skeleton>
          </div>
          <Skeleton height="28px" width="9rem" borderRadius="16px"></Skeleton>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$container-breakpoint-xs: useBreakpointOrFallback('xs', 375px);
.live-feature {
  container-type: inline-size;
  position: relative;
  background-color: var(--live-feature-background);

  .image-holder {
    position: relative;
    flex: none;
    width: 138px;
    height: 138px;
    background-color: #ffffff;
    .image,
    .image-loader-anim {
      position: absolute;
      width: 138px;
      height: 138px;
    }
  }
  .content {
    padding: 1rem;
    .skeleton-holder {
      gap: 0.5rem;
    }
  }
}
@container (max-width: #{$container-breakpoint-xs}) {
  .live-feature {
    .image-holder {
      flex: none;
      width: 90px;
      height: 90px;
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
      .skeleton-holder {
        .desc {
          display: none;
        }
      }
    }
  }
}
</style>
