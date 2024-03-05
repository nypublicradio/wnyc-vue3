<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
import { checkIsFavorited, addToFavorites } from "~/utilities/helpers"

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(["on-click"])

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  saved: {
    type: Boolean,
    default: false,
  },
})

// check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(props.data.slug)
})

const user = useCurrentUser()

// add item to favorites
const handleAddToFavorites = () => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites(props.data, isFavorited.value)
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}
</script>

<template>
  <div
    class="browse-item flex justify-content-between align-items-center p-ripple cursor-pointer"
    v-ripple
    v-if="props.data"
  >
    <div class="flex gap-3 w-full" @click="emit('on-click')">
      <VImage
        :src="props.data.image.template ?? props.data.image.url"
        :height="116"
        :width="116"
        :ratio="[1, 1]"
        :srcset="[2]"
        class="flex-none"
        style="height: 116px; width: 116px; background-color: var(--background2)"
      />
      <div class="flex gap-1 flex-column align-items-start">
        <!-- <LiveBadge v-if="props.data.isLive" class="mb-1" /> -->
        <h2>{{ props.data.title }}</h2>
        <p v-for="org in props.data?.producingOrganizations" :key="org.name">
          {{ org.name }}
        </p>
      </div>
    </div>
    <Button text plain rounded class="flex-none z-1">
      <template #icon>
        <StarIcon class="h-2rem" :active="isFavorited" @click="handleAddToFavorites" />
      </template>
    </Button>
  </div>
  <div v-else>
    <skeleton-show-item />
  </div>
</template>

<style lang="scss" scoped>
.browse-item {
}
</style>
