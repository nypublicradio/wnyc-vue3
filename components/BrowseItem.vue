<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
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
    class="browse-item flex justify-content-between align-items-center p-ripple"
  >
    <div class="flex gap-3" v-ripple @click.prevent="emit('onClick')">
      <VImage
        :src="props.show.image.template"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
        :srcset="[2]"
        class="flex-none"
        style="
          min-height: 72px;
          min-width: 72px;
          background-color: var(--background2);
        "
      />
      <div class="flex gap-1 flex-column align-items-start">
        <!-- <LiveBadge v-if="props.show.isLive" class="mb-1" /> -->
        <h2>{{ props.show.title }}</h2>
        <p v-for="org in props.show?.producingOrganizations">{{ org.name }}</p>
      </div>
    </div>
    <Button text plain rounded class="flex-none">
      <template #icon>
        <StarIcon class="h-2rem" :active="false" />
      </template>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.browse-item {
}
</style>
