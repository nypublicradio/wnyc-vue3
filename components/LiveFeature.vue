<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import {
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsStreamLoading,
} from '~/composables/states'
import { trackClickEvent } from '~/utilities/helpers'
import { updateAllLiveStreams } from '~/composables/data/liveStream'
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const isStreamLoading = useIsStreamLoading()

// handles play button click that updates the currentEpisode and isEpisodePlaying states

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

onMounted(async () => {
  await nextTick()
  // slight delay is needed for some reason when opening the app with a logged in user
  setTimeout(() => {
    updateAllLiveStreams()
  }, 100)
})
</script>

<template>
  <div class="live-feature">
    <div class="inner">
      <VFlexibleLink raw to="/live" class="flex align-items-center">
        <div class="image-holder">
          <transition name="fade">
            <VImage
              v-if="currentEpisodeHolder?.image"
              :src="currentEpisodeHolder?.image"
              :ratio="[1, 1]"
              alt="show poster image"
              class="image"
            />
            <WnycLoader
              v-else
              class="image-loader-anim"
              size="2rem"
              bg
              spinner
            />
            <!-- <div v-else class="image-loader-anim">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div> -->
          </transition>
        </div>
        <div class="content w-full relative">
          <transition name="fade">
            <div
              v-if="currentEpisodeHolder"
              class="flex flex-column gap-2 justify-content-center p-3"
            >
              <pre>{{ currentEpisodeHolder }}</pre>
              <h2>{{ currentEpisodeHolder?.title }}</h2>
              <div
                class="blurb truncate t2lines"
                v-html="
                  currentEpisodeHolder?.onTodaysShowHeadline ??
                  currentEpisodeHolder?.details
                "
              ></div>
              <PlayButton
                :label="currentEpisodeHolder?.station"
                live
                @onClick="togglePlay"
              />
            </div>
            <div
              class="skeleton-holder flex flex-column justify-content-center w-full absolute p-3"
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
                  width="85%"
                  borderRadius="16px"
                  style="margin-bottom: 6px"
                ></Skeleton>
                <Skeleton
                  height="13px"
                  width="90%"
                  borderRadius="16px"
                ></Skeleton>
              </div>
              <Skeleton
                height="28px"
                width="9rem"
                borderRadius="16px"
              ></Skeleton>
            </div>
          </transition>
        </div>
      </VFlexibleLink>
    </div>
  </div>
</template>

<style lang="scss">
// removes extra tags from the blurb
.live-feature .content {
  .blurb {
    font-size: 13px;
    *:not(:first-child) {
      display: none;
    }
  }
}
</style>

<style lang="scss" scoped>
$container-breakpoint-xs: useBreakpointOrFallback('xs', 375px);
.live-feature {
  .inner {
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
      .skeleton-holder {
        gap: 0.5rem;
      }
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
