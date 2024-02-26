<script setup>
import { useToast } from "primevue/usetoast"
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
import {
  deleteFavorite,
  saveFavorite,
  checkIsFavorited,
  getFavoritedItems,
} from "~/utilities/helpers"

import { useAccountPromptSideBar } from "~/composables/states"

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(["on-click, onDeleteFavorite, onSaveFavorite"])

const toast = useToast()
const accountPromptSideBar = useAccountPromptSideBar()
const props = defineProps({
  data: {
    type: Object,
    default: {},
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

//console.log("props.data = ", props.data);
// add item to favorites
const handleAddToFavorites = async () => {
  if (user.value) {
    if (isFavorited.value) {
      await deleteFavorite(props.data)
      getFavoritedItems()
      isFavorited.value = false
      emit("onDeleteFavorite")
    } else {
      await saveFavorite(props.data, props.data?.type)
      getFavoritedItems()
      isFavorited.value = true
      emit("onSaveFavorite")
    }
    toast.add({
      severity: "info",
      summary: "Updated your favorites.",
      life: 3000,
    })
    trackClickEvent(
      "Click Tracking - Add/remove from favorites",
      "Show Item",
      props.data?.title
    )
  } else {
    accountPromptSideBar.value = true
  }
}
</script>

<template>
  <div
    class="browse-item flex justify-content-between align-items-center p-ripple"
    v-ripple
  >
    <div class="flex gap-3 w-full" @click="emit('on-click')">
      <VImage
        :src="props.data.image.template"
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
    <Button text plain rounded class="flex-none">
      <template #icon>
        <StarIcon class="h-2rem" :active="isFavorited" @click="handleAddToFavorites" />
      </template>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.browse-item {
}
</style>
