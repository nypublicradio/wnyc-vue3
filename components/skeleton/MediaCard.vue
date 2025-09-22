<script setup>
const props = defineProps({
  hideDate: {
    type: Boolean,
    default: false,
  },
  showTease: {
    type: Boolean,
    default: false,
  },
  showTitle: {
    type: Boolean,
    default: false,
  },
  showPlayButton: {
    type: Boolean,
    default: true,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  isSegment: {
    type: Boolean,
    default: false,
  },
  hasSegments: {
    type: Boolean,
    default: false,
  },
  showImage: {
    type: Boolean,
    default: true,
  },
  isFeature: {
    type: Boolean,
    default: false,
  },
  isEvent: {
    type: Boolean,
    default: false,
  },
  isHorizontal: {
    type: Boolean,
    default: false,
  },
  isVertical: {
    type: Boolean,
    default: false,
  },
  showBg: {
    type: Boolean,
    default: true,
  },
  showBgMobile: {
    type: Boolean,
    default: false,
  },
  imgCol: {
    type: String,
    default: "md:h-auto md:w-12",
  },
  // Responsive image size configuration
  // Object format: { xs: [112,112], md: [600,400] } - different sizes per breakpoint
  // Array format: [3, 2] - converted to ratio-based default size for backward compatibility
  // Default: {} uses [300,200] default size with smart cascading
  size: {
    type: [Array, Object],
    default: () => ({ xs: [112, 112], md: [438, 292] }),
  },
})

// Use the same composable as the main MediaCard for consistency
import { useVImageDimensions } from "~/composables/useVImageDimensions"

const { width: imageWidth, height: imageHeight } = useVImageDimensions({
  size: props.size,
})
</script>

<template>
  <div
    class="media-card skeleton-holder"
    :style="`cursor: ${props.isSegment ? 'default !important' : ''}`"
    :class="[
      {
        'show-image': props.showImage,
        'show-bg': props.showBg,
        'show-bg-mobile': props.showBgMobile,
        'is-feature': props.isFeature,
        'is-horizontal': props.isHorizontal,
        'is-vertical': props.isVertical,
      },
    ]"
  >
    <div class="holder flex flex-nogutter">
      <div
        v-if="props.isEvent"
        class="event flex flex-column w-4rem h-4rem absolute top-0 left-0 z-2"
      ></div>
      <div
        v-if="props.showImage"
        class="image overflow-hidden p-0 col-fixed"
        :class="props.imgCol"
        :style="`aspect-ratio: ${imageWidth / imageHeight};`"
      >
        <Skeleton
          class="flex-none skeleton-image"
          borderRadius="0px"
          :style="`aspect-ratio: ${imageWidth / imageHeight};`"
        />
      </div>
      <div class="content col">
        <div class="flex gap-2 flex-column justify-content-between w-full h-full">
          <div class="flex gap-1 flex-column w-full">
            <div class="flex gap-0 flex-column align-items-start">
              <Skeleton
                v-if="props.showTitle"
                height="12px"
                width="60%"
                borderRadius="16px"
                class="mb-1 opacity-70"
              />
              <div class="skeleton-title-container">
                <Skeleton height="14px" width="95%" borderRadius="16px" class="mb-1" />
                <Skeleton
                  v-if="!props.isFeature"
                  height="14px"
                  width="80%"
                  borderRadius="16px"
                  class="mb-1"
                />
                <Skeleton
                  v-if="props.isFeature"
                  height="14px"
                  width="75%"
                  borderRadius="16px"
                  class="mb-1"
                />
                <Skeleton
                  v-if="props.isFeature"
                  height="14px"
                  width="85%"
                  borderRadius="16px"
                  class="mb-1"
                />
              </div>
            </div>
            <div class="flex gap-2 my-1 flex-column" v-if="props.showTease">
              <Skeleton
                height="10px"
                width="100%"
                borderRadius="16px"
                class="opacity-50"
              />
              <Skeleton
                height="10px"
                width="90%"
                borderRadius="16px"
                class="opacity-50"
              />
              <Skeleton
                height="10px"
                width="45%"
                borderRadius="16px"
                class="opacity-50"
              />
            </div>
            <div class="article-metadata">
              <div class="flex gap-2 align-items-center mb-1">
                <Skeleton
                  height="12px"
                  width="70px"
                  borderRadius="16px"
                  class="opacity-70"
                />

                <Skeleton
                  v-if="!props.hideDate"
                  height="8px"
                  width="8px"
                  borderRadius="50%"
                  class="opacity-50"
                />
                <Skeleton
                  v-if="!props.hideDate"
                  height="12px"
                  width="50px"
                  borderRadius="16px"
                  class="opacity-70"
                />
              </div>
              <Skeleton
                v-if="props.isSegment"
                height="10px"
                width="40%"
                borderRadius="16px"
                class="opacity-50"
              />
            </div>
          </div>
          <div
            class="button-holder flex justify-content-between align-items-center flex-wrap"
          >
            <Skeleton
              v-if="props.showPlayButton && !props.hasSegments"
              height="28px"
              width="92px"
              borderRadius="16px"
              class="z-2"
            />
            <Skeleton v-else height="28px" width="60px" borderRadius="16px" class="z-2" />

            <slot>
              <div class="flex align-items-center gap-4">
                <Skeleton class="" height="16px" width="16px" borderRadius="16px" />
                <Skeleton class="mr-2" height="25px" width="5px" borderRadius="16px" />
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.media-card {
  position: relative;
  cursor: pointer;
  height: auto;

  &.skeleton-holder {
    pointer-events: none;
    cursor: default !important;

    .skeleton-image {
      width: 100% !important;
      height: auto !important;
      min-height: 112px;
    }

    .skeleton-title-container {
      width: 100%;
    }
  }

  .holder {
    position: relative;
    overflow: hidden;
    height: 100%;
    .event {
      background-color: var(--p-surface-200);
      padding: 12px;
      justify-content: center;
      align-items: center;
    }
    @include media("<md") {
      border-radius: 0;
    }
    flex-direction: column;
    @include media("<md") {
      flex-direction: row;
    }
    // @include media(">=md") {
    //   background-color: var(--p-surface-25);
    //   .content {
    //     padding: 1rem !important;
    //   }
    // }
    .content {
      height: auto;
      padding: 0 0 0 1rem;
    }
    .image {
      @include media("<md") {
        width: 112px;
        height: 112px;
        flex: 0 0 auto;
        .skeleton-image {
          width: 112px;
          height: 112px;
          aspect-ratio: 1;
          min-height: 112px;
        }
      }
      @include media("<xs") {
        width: 80px;
        height: 80px;
        .skeleton-image {
          width: 80px;
          height: 80px;
          aspect-ratio: 1;
          min-height: 80px;
        }
      }
    }
  }

  &.show-bg {
    .holder {
      background-color: var(--p-surface-25);
      border-radius: 8px;
      .content {
        padding: 1rem !important;
      }
    }
    @include media("<md") {
      .holder {
        background-color: transparent;
        border-radius: 0;
        .content {
          padding: 0 0 0 1rem !important;
        }
      }
    }
  }

  &.show-bg-mobile {
    @include media("<md") {
      .holder {
        background-color: var(--p-surface-25);
        border-radius: 8px;
        .content {
          padding: 1rem !important;
        }
      }
    }
  }

  &.is-feature {
    .skeleton-title-container {
      .p-skeleton {
        height: 16px !important;
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 8px;
        }
      }
    }
  }

  &.is-horizontal {
    @include media(">=md") {
      .holder {
        flex-direction: row;
      }
    }
    @include media("<md") {
      .holder {
        .image {
          width: 112px !important;
          height: 112px !important;
          flex: 0 0 auto;
          .skeleton-image {
            width: 112px !important;
            height: 112px !important;
            aspect-ratio: 1 !important;
            min-height: 112px !important;
          }
        }
      }
    }
  }

  &.is-horizontal.is-feature {
    .holder {
      flex-direction: row;
    }
    @include media("<md") {
      .holder {
        background-color: var(--p-surface-25);
        border-radius: 8px;
        flex-direction: column;
        .image {
          width: 100% !important;
          height: auto !important;
          .skeleton-image {
            width: 100% !important;
            height: auto !important;
            min-height: auto;
          }
        }
        .content {
          padding: 1rem !important;
        }
      }
    }
    &.show-bg {
      border-radius: 8px;
    }
  }

  &.is-vertical {
    .image {
      width: 100%;
      height: auto;
      .skeleton-image {
        width: 100%;
        height: auto;
        min-height: 200px;
      }
    }
    .holder {
      background-color: var(--p-surface-25);
      flex-direction: column;
      .content {
        padding: 1rem !important;
      }
    }
  }
  &:not(.show-image) {
    .holder {
      .content {
        padding: 0;
      }
    }
  }
}
</style>
