<script setup>
import { goToEpisodePage, goToStoryPage, hasAudio, getDate } from "~/utilities/helpers"

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
  hideDate: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(["on-click"])

// handle the click event and navigate to the appropriate page
const onClick = (item) => {
  emit("on-click")
  //TODO: the audio condition should be changed to something more reliable
  if (hasAudio(item.audio)) {
    goToEpisodePage(props.item)
  } else {
    goToStoryPage(props.item, { src: props.item.cmsSource })
  }
}
</script>

<template>
  <div v-if="props.item" class="card-large p-ripple" v-ripple>
    <VFlexibleLink
      class="card-click w-full h-full absolute top-0 left-0 z-1 cursor-pointer"
      raw
      @click.prevent="onClick(props.item)"
    >
      <!--    :to="`story/${props.item.id}?src=${props.item.cmsSource}`" -->
    </VFlexibleLink>
    <div class="top" v-if="props.item?.image">
      <VImage
        :src="props.item?.image?.template"
        :width="248"
        :height="159"
        :ratio="[248, 159]"
      />
    </div>
    <div class="bottom flex flex-column gap-2 justify-content-between">
      <div class="flex flex-column gap-2">
        <div class="title text-sm font-bold font-meta line-height-2">
          {{ props.item.title }}
        </div>
        <!-- <pre class="text-xs">{{ props.item }}</pre> -->
        <HtmlConvert
          v-if="props.item.tease"
          :htmlContent="props.item.tease"
          class="desc"
          :key="`tease-${props.item.id || props.item.slug || 'default'}`"
        />

        <PipeData class="text-xs" :hidePipe="props.hideDate">
          <template #left>{{ props.item?.headers?.brand.title }}</template>
          <template #right v-if="!props.hideDate">
            {{ getDate(props.item) }}
          </template>
        </PipeData>
      </div>
      <div class="flex justify-content-between align-items-center">
        <slot name="play" />
        <slot name="menu" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.card-large {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  max-width: 248px;
  min-width: 248px;
  background-color: var(--p-surface-25);
  position: relative;
  .bottom {
    padding: 1rem;
    height: 100%;
    .title {
      @include cardTitle();
    }
    .desc {
      @include cardBody();
    }
  }
}
</style>
