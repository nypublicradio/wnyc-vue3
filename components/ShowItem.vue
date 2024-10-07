<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import FollowIcon from "~/components/icons/FollowIcon.vue"
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
import { checkIsFavorited, addToFavorites2 } from "~/utilities/helpers"
import { useCurrentEpisodeHolder, useCurrentEpisode } from "~/composables/states"

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(["on-click", "on-delete-favorite"])

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  menu: {
    type: Boolean,
    default: false,
  },
})

const user = useCurrentUser()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const currentEpisode = useCurrentEpisode()

// check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(props.data.slug)
})

const handleIsLiveIndicator = computed(() => {
  return (
    currentEpisodeHolder.value?.title === props.data.title ||
    currentEpisode?.value?.title === props.data.title
  )
})

// add item to favorites
const handleAddToFavorites = () => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: props.data,
    isFavorited: isFavorited.value,
    message: isFavorited.value ? "Show unfollowed." : "Show followed.",
    callback: () => {
      emit("on-delete-favorite")
    },
  })
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}
// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: "Unfollow show",
      customIcon: FollowIcon,
      active: isFavorited.value,
      title: bucketItem.title,
      command: () => {
        handleAddToFavorites()
      },
    },
  ]
}
</script>

<template>
  <div
    class="browse-item flex justify-content-between align-items-center p-ripple cursor-pointer"
    v-ripple
    v-if="props.data"
  >
    <div
      class="card-click flex gap-3 w-full"
      @click="emit('on-click')"
      @keypress.enter.space="emit('on-click')"
      tabindex="0"
      aria-role="button"
      :aria-label="`${props.data.title} show details`"
    >
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
        <LiveBadge v-if="handleIsLiveIndicator" class="mb-1" />
        <h2 class="text-sm line-height-2 truncate t2lines no-hyphens">
          {{ props.data.title }}
        </h2>
        <p v-for="org in props.data?.producingOrganizations" :key="org.name">
          {{ org.name }}
        </p>
      </div>
    </div>
    <DotMenu
      v-if="props.menu"
      :menuItems="getDotMenuItems(props.data)"
      label=""
      @changeEmit="onMenuChange"
      class="z-1"
      height="32px"
      width="32px"
    />
    <Button
      v-else
      text
      plain
      rounded
      class="flex-none z-1 flex-row-reverse"
      aria-label="follow"
    >
      <template #icon>
        <FollowIcon class="h-2rem" :active="isFavorited" @click="handleAddToFavorites" />
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
