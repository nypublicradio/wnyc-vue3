<script setup>
import {
  formatPublisherImageUrl,
  getMinutes,
  whenTime,
} from '~/utilities/helpers'
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher'

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
    <div class="card-large mb-4">
      <div class="top">
        <VImagePublisher
          :src="
            formatPublisherImageUrl(props.item.attributes.imageMain.template)
          "
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
          <div
            class="desc text-xs line-height-3"
            v-html="props.item.attributes.body"
          />
          <PipeData class="text-xs">
            <template #left>{{ props.item.attributes.showTitle }}</template>
            <template #right>
              <span class="nobreak">{{ whenTime(props.item.attributes) }}</span>
            </template>
          </PipeData>
        </div>
        <div class="flex justify-content-between align-items-center">
          <slot name="play">
            <PlayButton
              :label="getMinutes(props.item.attributes.estimatedDuration, 1)"
              :episode="normalizedItem"
              @onClick="togglePlay"
            />
          </slot>
          <slot name="menu" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
    }
  }
}
</style>
