<script setup lang="ts">
import { ref, computed, provide, watch, onMounted, onBeforeUnmount } from "vue"
import { hasAudio } from "~/utilities/helpers"
import {
  usePlaylistQueue,
  PLAYLIST_QUEUE_PROVIDER_KEY,
  registerCuratedListProvider,
  unregisterCuratedListProvider,
} from "~/composables/usePlaylistQueue"
import type { PlaylistQueueProviderContext } from "~/composables/usePlaylistQueue"

// wraps a curated list layout so the MediaCards rendered inside it can populate the playlist queue
const props = defineProps({
  // all the items in the curated list (block.value.list.listItems)
  items: {
    type: Array as () => Record<string, any>[],
    default: () => [],
  },
  // unique key for this curated list (the curated list block id)
  sourceKey: {
    type: String,
    required: true,
  },
})

const { setPlaylistFromCuratedList, appendToPlaylist } = usePlaylistQueue()

// ids of the MediaCards currently rendered by the layout. An array (not a Set) because a layout can render the same item twice
const renderedIds = ref<string[]>([])

// the rendered items that have audio, in curated list order
const playableItems = computed(() =>
  props.items.filter(
    (item) =>
      renderedIds.value.includes(String(item?.id)) && hasAudio(item?.audio)
  )
)

const provider: PlaylistQueueProviderContext = {
  register: (item) => {
    renderedIds.value.push(String(item?.id))
  },
  unregister: (item) => {
    const index = renderedIds.value.indexOf(String(item?.id))
    if (index > -1) renderedIds.value.splice(index, 1)
  },
  startPlaylist: (item) => {
    setPlaylistFromCuratedList(props.sourceKey, playableItems.value, item)
  },
}

// for the MediaCards rendered inside this curated list
provide(PLAYLIST_QUEUE_PROVIDER_KEY, provider)

// for components outside this curated list that play its items (e.g. ShowHeader)
onMounted(() => registerCuratedListProvider(props.sourceKey, provider))
onBeforeUnmount(() => unregisterCuratedListProvider(props.sourceKey, provider))

// when more items are rendered (e.g. "Load More"), add them to the playlist if this list populated it
// the initial render is skipped so coming back to the page does not re-add items the user removed
watch(playableItems, (newItems, oldItems) => {
  if (!oldItems.length) return
  const oldIds = oldItems.map((item) => String(item?.id))
  appendToPlaylist(
    props.sourceKey,
    newItems.filter((item) => !oldIds.includes(String(item?.id)))
  )
})
</script>

<template>
  <slot />
</template>
