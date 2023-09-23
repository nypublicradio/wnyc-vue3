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
</script>

<template>
  <div class="author flex gap-2">
    <div v-if="props.imgSrc" class="image-holder">
      <VImagePublisher
        :src="props.imgSrc"
        :ratio="[1, 1]"
        alt="author image"
        class="image"
      />
    </div>
    <div class="name flex flex-column justify-content-center">
      <h2>{{ props.name }}</h2>

      <!-- <VFlexibleLink :to="props.to">
        <h2>{{ props.name }}</h2>
      </VFlexibleLink> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.author {
  .image-holder {
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>

<style lang="scss">
// TEMP, updated in DS comp, remove with updated
.author {
  .image-holder {
    .image {
      display: block;
    }
  }
}
</style>
