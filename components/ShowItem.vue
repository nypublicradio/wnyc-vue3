<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
import { deleteFavorite, saveFavorite, checkIsFavorited } from "~/utilities/helpers"

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(["onClick, onDeleteFavorite, onSaveFavorite"])

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
const route = useRoute()
// check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(props.data.slug)
})

const user = useCurrentUser()

//console.log("props.data = ", props.data);
// add item to favorites
const addFavorite = async () => {
  isFavorited.value = true
  await saveFavorite(props.data, props.data?.type)
  emit("onSaveFavorite")
}
// remove item from favorites
const removeFavorite = async () => {
  isFavorited.value = false
  await deleteFavorite(props.data)
  emit("onDeleteFavorite")
}
//console.log("showItem =", props.data)
</script>

<template>
  <div class="browse-item flex justify-content-between align-items-center p-ripple">
    <div class="flex gap-3 w-full" v-ripple @click.prevent="emit('onClick')">
      <VImage
        :src="props.data.image.template"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
        :srcset="[2]"
        class="flex-none"
        style="min-height: 72px; min-width: 72px; background-color: var(--background2)"
      />
      <div class="flex gap-1 flex-column align-items-start">
        <!-- <LiveBadge v-if="props.data.isLive" class="mb-1" /> -->
        <h2>{{ props.data.title }}</h2>
        <p v-for="org in props.data?.producingOrganizations" :key="org.name">
          {{ org.name }}
        </p>
      </div>
    </div>
    <Button v-if="user" text plain rounded class="flex-none">
      <template #icon>
        <StarIcon
          class="h-2rem"
          :active="isFavorited"
          @click="isFavorited ? removeFavorite() : addFavorite()"
        />
      </template>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.browse-item {
}
</style>
