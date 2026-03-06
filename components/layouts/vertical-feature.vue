<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
import { mediaTypes } from "~/composables/globals"
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  list: {
    type: Object,
    required: true,
  },
  maxItems: {
    type: Number,
    default: 5,
  },
  seeMore: {
    type: Object,
    default: null,
    required: false,
  },
  isThin: {
    type: Boolean,
    default: false,
  },
})
// TODO: use new smarter ratio calc
const reactiveItems = toRef(props.list, "listItems")
const squareSizes = {
  xs: [435, 435],
  sm: [435, 435],
  md: [435, 435],
  lg: [446, 446],
  xl: [516, 516],
}

const rectSizes = {
  xs: [435, 290],
  sm: [664, 443],
  md: [664, 443],
  lg: [885, 590],
  xl: [664, 443],
}
const leftCol = ref(props.isThin ? "col-12 md:col-8" : "lg:col-6")
const rightCol = ref(props.isThin ? "col-12" : "lg:col-6")
const isSquare = ref(false)

onBeforeMount(() => {
  const featureItem = reactiveItems.value[0]
  const imgHeight = Number(
    featureItem.imageFullHeight || featureItem.image?.height
  )
  const imgWidth = Number(
    featureItem.imageFullWidth || featureItem.image?.width
  )
  if (featureItem.cmsSource === mediaTypes.SIMPLECAST) {
    isSquare.value = true
  } else if (
    featureItem &&
    imgHeight &&
    imgWidth &&
    !isNaN(imgHeight) &&
    !isNaN(imgWidth) &&
    imgHeight !== 0
  ) {
    isSquare.value = imgHeight === imgWidth
  } else {
    isSquare.value = false
  }
})

watch(isSquare, (newVal) => {
  leftCol.value = props.isThin
    ? "col-12 md:col-8"
    : newVal
    ? "lg:col-5"
    : "lg:col-5 xl:col-6"
  rightCol.value = props.isThin
    ? "col-12 lg:col-12"
    : newVal
    ? "lg:col-7"
    : "lg:col-7 xl:col-6"
})

watch(isSquare, (newVal) => {
  if (props.isThin) return
  leftCol.value = newVal ? "lg:col-5" : "lg:col-5 xl:col-6"
  rightCol.value = newVal ? "lg:col-7" : "lg:col-7 xl:col-6"
})

const featureSizes = computed(() => {
  return isSquare.value ? squareSizes : rectSizes
})

const featureTitleClasses = props.isThin ? "text-xxl" : ""
const listImgColClasses = props.isThin
  ? "w-7rem md:w-7rem lg:w-7rem xl:w-7rem"
  : "w-7rem md:w-12rem lg:w-13rem xl:w-13rem"

const listTitleClasses = props.isThin ? "text-base" : "text-base lg:text-lg"
const listTextClasses = props.isThin ? "text-sm" : "text-base lg:text-base"
</script>

<template>
  <div
    class="layout layout-vertical-feature"
    :class="{ 'is-thin': props.isThin }"
  >
    <LayoutsTitleHeader
      :label="props.label || props.list.title"
      :seeMore="props.seeMore"
    />
    <!-- <pre class="text-xs">{{ reactiveItems }}</pre> -->
    <div class="grid">
      <MediaCard
        v-if="reactiveItems.length > 0"
        class="xs:col-12 sm:col-7 md:col-6 mx-auto mb-2 lg:mb-0 align-self-start"
        :class="leftCol"
        :data="reactiveItems?.[0]"
        is-vertical
        is-feature
        showTease
        :titleClasses="featureTitleClasses"
        :teaseClasses="listTextClasses"
        :pipeClasses="listTextClasses"
        :showTitleClasses="listTextClasses"
        :size="featureSizes"
        @on-click="dynamicNavigation(reactiveItems[0])"
      />
      <skeleton-media-card
        v-else
        class="col-12 mb-2 lg:mb-0"
        :class="leftCol"
        is-vertical
        is-feature
        :size="featureSizes"
      />

      <div class="col-12 grid grid-nogutter gap-3 h-full" :class="rightCol">
        <template v-if="reactiveItems.length > 0">
          <MediaCard
            v-for="(article, index) in reactiveItems.slice(
              1,
              props.maxItems === null ? undefined : props.maxItems
            )"
            :key="`${article.id}-${index}`"
            class="col-12"
            :data="article"
            is-horizontal
            is-event
            :showBg="!props.isThin"
            :imgCol="listImgColClasses"
            :titleClasses="listTitleClasses"
            :teaseClasses="listTextClasses"
            :pipeClasses="listTextClasses"
            :showTitleClasses="listTextClasses"
            :allowVerticalEffect="false"
            :ratio="[1, 1]"
            :size="{
              xs: [112, 112],
              md: [208, 208],
            }"
            @on-click="dynamicNavigation(article)"
          />
        </template>
        <skeleton-media-card
          v-else
          v-for="index in 5"
          :key="`skeleton-vertical-feature-${index}`"
          class="col-12 mb-5"
          is-horizontal
          is-event
          imgCol="w-7rem md:w-12rem lg:w-13rem xl:w-13rem"
          :size="{
            xs: [112, 112],
            md: [176, 176],
          }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.layout-vertical-feature {
  .media-card.is-feature {
    .holder {
      background-color: transparent !important;
      .image {
        border-radius: var(--media-card-border-radius) !important;
        overflow: hidden;
      }
      .content {
        text-align: center !important;
        h2 {
          font-size: var(--font-size-12);
          line-height: var(--font-size-13);
          text-align: center !important;
        }
        .content-flex {
          gap: 1.25rem !important;
          .top,
          .text,
          .tease-metadata-holder {
            gap: 1.25rem !important;
          }
          .tease-metadata-holder {
            flex-direction: column-reverse !important;
          }
        }
        .button-holder .temp {
          display: block !important;
        }
        @include media("<lg") {
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
          h2 {
            font-size: var(--font-size-9);
            line-height: var(--font-size-10);
          }
          .content-flex {
            gap: 0.75rem !important;
            .top,
            .text,
            .tease-metadata-holder {
              gap: 0.75rem !important;
            }
          }
        }
      }
    }
  }
  &.is-thin {
    .media-card.is-feature {
      .holder {
        .content {
          h2 {
            font-size: var(--font-size-9);
            line-height: var(--font-size-10);
          }
        }
      }
    }
  }
}
</style>

