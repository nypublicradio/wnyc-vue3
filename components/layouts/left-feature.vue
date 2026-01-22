<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  maxItems: {
    type: Number,
    default: 4,
  },
})
// TODO: use new smarter ratio calc
const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-left-feature">
    <h2 class="mb-4">{{ props.list.title }}</h2>

    <div class="grid">
      <MediaCard
        v-if="reactiveItems.length > 0"
        class="col-12 lg:col-6 mb-2 lg:mb-0"
        :data="reactiveItems?.[0]"
        is-vertical
        is-feature
        showTease
        :size="{
          xs: [317, 211],
          sm: [518, 345],
          md: [622, 441],
          lg: [885, 590],
          xl: [664, 443],
        }"
        @on-click="dynamicNavigation(reactiveItems[0])"
      />
      <skeleton-media-card
        v-else
        class="col-12 lg:col-6 mb-2 lg:mb-0"
        is-vertical
        is-feature
        :size="{
          xs: [317, 211],
          sm: [518, 345],
          md: [622, 441],
          lg: [885, 590],
          xl: [664, 443],
        }"
      />

      <div class="col-12 lg:col-6 grid grid-nogutter gap-3 h-full">
        <template v-if="reactiveItems.length > 0">
          <MediaCard
            v-for="(article, index) in reactiveItems.slice(1, props.maxItems)"
            :key="`${article.id}-${index}`"
            class="col-12"
            :data="article"
            is-horizontal
            is-event
            imgCol="w-7rem md:w-11rem lg:w-11rem"
            :ratio="[1, 1]"
            :size="{
              xs: [112, 112],
              md: [176, 176],
            }"
            @on-click="dynamicNavigation(article)"
          />
        </template>
        <skeleton-media-card
          v-else
          v-for="index in 5"
          :key="`skeleton-2-${index}`"
          class="col-12 mb-5"
          is-horizontal
          is-event
          imgCol="w-7rem md:w-11rem lg:w-11rem"
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
.layout-left-feature {
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
        @include media("<md") {
          h2 {
            font-size: var(--font-size-9);
            line-height: var(--font-size-8);
          }
          .content-flex {
            gap: 0.75rem !important;
            .top,
            .text,
            .tease-metadata-holder {
              gap: 0.75rem !important;
            }
          }
          .button-holder {
            margin: 0 -1rem;
          }
        }
      }
    }
  }
}
</style>

