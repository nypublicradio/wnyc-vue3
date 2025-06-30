<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
  fallbackImage: {
    type: String,
    default: null,
  },
  imgSrc: {
    type: String,
    default: null,
  },
  showTitle: {
    type: Boolean,
    default: false,
  },
  showPlayButton: {
    type: Boolean,
    default: true,
  },
  showShare: {
    type: Boolean,
    default: true,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  isInDownloads: {
    type: Boolean,
    default: false,
  },
  isSegment: {
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
    default: false,
  },
  imgCol: {
    type: String,
    default: "md:h-auto md:w-12",
  },
  imgWidth: {
    type: Number,
    default: 437,
  },
  imgHeight: {
    type: Number,
    default: 282,
  },
  imgSrcset: {
    type: Array,
    default: [2],
  },
})
</script>

<template>
  <div
    class="media-card skeleton-holder"
    :style="`cursor: ${props.isSegment ? 'default !important' : ''}`"
    :class="[
      {
        'show-bg': props.showBg,
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
      >
        <Skeleton height="16px" width="24px" borderRadius="16px" class="mb-1" />
        <Skeleton height="12px" width="32px" borderRadius="16px" />
      </div>
      <div class="image overflow-hidden p-0 col-fixed" :class="props.imgCol">
        <Skeleton
          v-if="props.showImage"
          class="flex-none skeleton-image"
          :height="
            props.isVertical || (props.isHorizontal && !props.isFeature)
              ? 'auto'
              : '116px'
          "
          :width="
            props.isVertical || (props.isHorizontal && !props.isFeature)
              ? '100%'
              : '116px'
          "
          borderRadius="0px"
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
            <div class="article-metadata">
              <div class="flex gap-2 align-items-center mb-1">
                <Skeleton
                  height="12px"
                  width="70px"
                  borderRadius="16px"
                  class="opacity-70"
                />
                <Skeleton
                  height="8px"
                  width="8px"
                  borderRadius="50%"
                  class="opacity-50"
                />
                <Skeleton
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
              v-if="props.showPlayButton"
              height="32px"
              width="80px"
              borderRadius="16px"
              class="z-2"
            />
            <Skeleton v-else height="32px" width="60px" borderRadius="16px" class="z-2" />

            <slot>
              <div class="flex gap-1 align-items-center">
                <Skeleton
                  v-if="!props.saved"
                  height="24px"
                  width="24px"
                  borderRadius="50%"
                  class="z-1 opacity-70"
                />
                <Skeleton
                  v-else
                  height="32px"
                  width="32px"
                  borderRadius="50%"
                  class="z-1"
                />
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
      aspect-ratio: var(--img-width, 437) / var(--img-height, 282);
      min-height: 116px;
    }

    .skeleton-title-container {
      width: 100%;
    }
  }

  .holder {
    position: relative;
    overflow: hidden;
    height: 100%;
    border-radius: 8px;
    .event {
      background-color: var(--p-surface-950);
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
    @include media(">md") {
      background-color: var(--p-surface-25);
      .content {
        padding: 1rem !important;
      }
    }
    .content {
      height: auto;
      padding: 0 0 0 1rem;
    }
    .image {
      @include media("<md") {
        width: 116px;
        height: 116px;
        flex: 0 0 auto;
      }
      @include media("<xs") {
        width: 80px;
        height: 80px;
      }
    }
  }

  &.show-bg {
    .holder {
      background-color: var(--p-surface-25);
      .content {
        padding: 1rem !important;
      }
    }
    @include media("<md") {
      background-color: transparent;
      .content {
        padding: 0 0 0 1rem !important;
      }
    }
  }

  .button-holder {
    margin-bottom: -6px;
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
    @include media(">md") {
      .holder {
        flex-direction: row;
        background-color: var(--p-surface-25);
        border-radius: 8px;
      }
      .holder {
        .content {
          padding: 1rem !important;
        }
      }
    }
    @include media("<md") {
      .holder {
        .image {
          width: 116px !important;
          height: 116px !important;
          flex: 0 0 auto;
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
        }
        .content {
          padding: 1rem !important;
        }
      }
    }
  }

  &.is-vertical {
    .content {
      padding: 1rem !important;
    }
    .image {
      width: 100% !important;
      height: auto !important;
    }
    .holder {
      background-color: var(--p-surface-25);
      flex-direction: column;
    }
    .skeleton-image {
      height: 200px !important;
      width: 100% !important;
    }
  }
}
</style>
