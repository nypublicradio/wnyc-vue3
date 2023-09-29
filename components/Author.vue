<script setup>
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
const props = defineProps({
  name: {
    type: String,
    default: null,
  },
  imgSrc: {
    type: String,
    default: null,
  },
  to: {
    type: String,
    default: null,
  },
})
const emit = defineEmits(['on-click'])

// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
// TEMP fix to make ripple work
</script>

<template>
  <VFlexibleLink
    :to="props.to"
    @click="emit('on-click')"
    raw
    class="author p-ripple border-round-3xl pr-3"
    v-ripple
  >
    <div class="flex gap-2 p-0">
      <div
        v-if="props.imgSrc"
        class="image-holder border-circle overflow-hidden"
      >
        <VImagePublisher
          :src="props.imgSrc"
          :ratio="[1, 1]"
          alt="author image"
          class="image"
        />
      </div>
      <div class="name flex flex-column justify-content-center">
        <h2>{{ props.name }}</h2>
      </div>
    </div>
  </VFlexibleLink>
</template>
