<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

const props = defineProps({
  newWindow: {
    default: false,
    type: Boolean,
  },
  title: {
    default: null,
    type: String,
  },
  url: {
    default: null,
    type: String,
  },
})
</script>
<template>
  <v-flexible-link
    raw
    v-if="url"
    :to="url"
    :target="newWindow && '_blank'"
    class="segment-list-item"
    @click="$emit('componentEvent', url)"
  >
    <div class="segment-list-item-title">
      {{ title }}
    </div>
    <div class="segment-list-item-icon">
      <i class="pi pi-chevron-right"></i>
    </div>
  </v-flexible-link>
  <div v-else class="segment-list-item">
    {{ title }}
  </div>
</template>

<style lang="scss" scoped>
.segment-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(map-get($colors, 'coolwhite'), 0.2) !important;
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
}

.segment-list-item .segment-list-item-title {
  width: 100%;
  padding-right: 1rem;
}
</style>
