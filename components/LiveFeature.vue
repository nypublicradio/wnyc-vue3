<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
} from '~/composables/states'
import {
  trackClickEvent,
  templatizePublisherImageUrl,
} from '~/utilities/helpers'

// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
// TEMP fix to make ripple work

const currentEpisodeHolder = useCurrentEpisodeHolder()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

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
</script>

<template>
  <div class="live-feature">
    <div class="inner">
      <VFlexibleLink
        raw
        to="/live"
        class="flex align-items-center p-ripple"
        v-ripple
      >
        <div class="image-holder">
          <transition name="fade">
            <VImage
              v-if="currentEpisodeHolder?.image"
              :src="templatizePublisherImageUrl(currentEpisodeHolder?.image)"
              :width="138"
              :height="138"
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
                :file="currentEpisodeHolder?.file"
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
      min-height: 138px;
      .skeleton-holder {
        gap: 0.5rem;
      }
    }
  }
}

@container (max-width: #{$container-breakpoint-xs}) {
  .live-feature {
    .inner {
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
        min-height: 90px;
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
}
</style>
