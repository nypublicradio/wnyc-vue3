<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
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
  width: {
    type: Number,
    default: 40,
  },
  height: {
    type: Number,
    default: 40,
  },
})
const emit = defineEmits(['on-click'])

// TEMP fix to make ripple work+
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
      <!-- <pre>{{ props }}</pre> -->
      <div v-if="props.imgSrc" class="image-holder">
        <VImage
          :src="props.imgSrc"
          :ratio="[1, 1]"
          :width="props.width"
          :height="props.height"
          alt="author image"
          class="image"
        />
      </div>
      <div
        v-else
        class="image-holder flex align-items-center justify-content-center border-1"
      >
        <UserIcon />
      </div>
      <div class="name flex flex-column justify-content-center">
        <h2>{{ props.name }}</h2>
      </div>
    </div>
  </VFlexibleLink>
</template>

<style lang="scss" scoped>
.author {
  .image-holder {
    border-radius: 50%;
    overflow: hidden;
    width: 40px;
    height: 40px;
  }
}
</style>
