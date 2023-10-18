<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
import { getMinutes, getDate } from '~/utilities/helpers'
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(['onClick'])

const props = defineProps({
  show: {
    type: Object,
    default: {},
    required: true,
  },
})
</script>

<template>
  <div
    class="episode-item flex justify-content-between align-items-center p-ripple"
  >
    <div class="flex gap-3" @click.prevent="emit('onClick')" v-ripple>
      <VImage
        class="flex-none"
        :src="props.show.image"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
      />
      <div class="flex gap-1 flex-column align-items-start">
        <h2 class="text-sm line-height-2">{{ props.show.title }}</h2>
        <p>{{ props.show.org }}</p>
        <div class="article-metadata flex flex-column gap-1">
          <PipeData class="text-xs">
            <template #left>
              <p class="text-xs">{{ getMinutes(props.show.duration, 1) }}</p>
            </template>
            <template #right>
              <p class="text-xs">{{ getDate(props.show.date) }}</p>
            </template>
          </PipeData>
          <ProgressBar
            :value="50"
            style="height: 4px"
            :showValue="false"
          ></ProgressBar>
        </div>
      </div>
    </div>
    <Button
      class="text-cyan-500 hover:bg-cyan-50"
      icon="pi pi-ellipsis-v"
      text
      rounded
      aria-label="menu"
      type="button"
      aria-haspopup="true"
      aria-controls="overlay_menu"
    />
  </div>
</template>

<style lang="scss" scoped>
.episode-item {
}
</style>
