<script setup>
import { formatPublisherImage, getMinutes, whenTime } from '~/utilities/helpers'
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

const props = defineProps({
  item: {
    type: Object,
    default: null,
    required: true,
  },
})
</script>

<template>
  <div>
    <VFlexibleLink
      raw
      :to="`story/${props.item.attributes.slug}`"
      class="card-large mb-4"
    >
      <div class="top">
        <VImage
          :src="formatPublisherImage(props.item.attributes)"
          :width="248"
          :height="159"
          :ratio="[248, 159]"
        />
      </div>
      <div class="bottom flex flex-column gap-2 justify-content-between">
        <div class="flex flex-column gap-2">
          <div class="title text-sm font-bold font-meta line-height-2">
            {{ props.item.attributes.title }}
          </div>
          <div class="desc">
            {{ props.item.attributes.tease }}
          </div>
          <PipeData class="text-xs">
            <template #left>{{ props.item.attributes.showTitle }}</template>
            <template #right>
              <span class="nobreak">{{ whenTime(props.item.attributes) }}</span>
            </template>
          </PipeData>
        </div>
        <div class="flex justify-content-between align-items-center">
          <slot name="play" />
          <slot name="menu" />
        </div>
      </div>
    </VFlexibleLink>
  </div>
</template>

<style lang="scss">
.card-large {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  max-width: 248px;
  background-color: var(--background2);
  .top {
  }
  .bottom {
    padding: 1rem;
    height: 100%;
    .title {
      @include truncate();
      @include t3lines();
    }
    .desc {
      @include truncate();
      @include t4lines();
      font-size: 13px;
    }
  }
}
</style>
