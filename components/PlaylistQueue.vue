<script lang="ts" setup>
import { ref, computed } from "vue"
import { useSortable, moveArrayElement } from "@vueuse/integrations/useSortable"
import { usePlaylistQueueSideBar } from "~/composables/states"
import { usePlaylistQueue } from "~/composables/usePlaylistQueue"
import { trackClickEvent } from "~/utilities/helpers"

const props = defineProps({
  header: {
    type: String,
    default: "Playlist",
  },
})

type PlaylistItem = Record<string, any>

const playlistQueueSideBar = usePlaylistQueueSideBar()
const { playlist, isCurrentEpisode, removeFromPlaylist, reorderPlaylist } =
  usePlaylistQueue()

// the playlist items as a writable ref for useSortable
const playlistItems = computed({
  get: () => playlist.value.items,
  set: (items: PlaylistItem[]) => reorderPlaylist(items),
})

// drag and drop reordering (SortableJS supports touch, unlike the DataTable row reorder)
const listRef = ref<HTMLElement | null>(null)
useSortable(listRef, playlistItems, {
  handle: ".playlist-queue-handle",
  animation: 150,
  // SortableJS event (no types installed): the dragged element, its list and its old/new positions
  onUpdate: (e: {
    item: HTMLElement
    from: HTMLElement
    oldIndex: number
    newIndex: number
  }) => {
    // puts the dragged element back and reorders the playlist so Vue re-renders it in the new order
    moveArrayElement(playlistItems, e.oldIndex, e.newIndex, e)
    trackClickEvent(
      "Click Tracking - Playlist Queue Reorder",
      "Playlist Queue",
      `moved from ${e.oldIndex} to ${e.newIndex}`
    )
  },
})

// handle removing an item from the playlist
const handleRemove = (item: PlaylistItem) => {
  removeFromPlaylist(item)
  trackClickEvent(
    "Click Tracking - Playlist Queue Remove",
    "Playlist Queue",
    `removed = ${item?.title}`
  )
}
</script>
<template>
  <div class="root">
    <!-- rows are not selectable: drag the handle to reorder, use the trash button to remove, and the MediaCard plays/navigates as normal -->
    <h2 v-if="props.header" class="mb-4 ml-4 md:ml-0">{{ props.header }}</h2>
    <!-- the list is always rendered because useSortable attaches to it on mount -->
    <ul ref="listRef" class="playlist-queue-list list-none p-0 m-0">
      <li
        v-for="item in playlist.items"
        :key="String(item.id)"
        class="playlist-queue-item flex align-items-center gap-2 py-2"
        :class="{ 'is-playing': isCurrentEpisode(item) }"
        :aria-current="isCurrentEpisode(item) ? 'true' : undefined"
      >
        <span
          class="playlist-queue-handle flex-none flex align-items-center justify-content-center w-2rem h-3rem"
          :aria-label="`Drag to reorder ${item?.title}`"
        >
          <i class="pi pi-bars"></i>
        </span>
        <MediaCard
          class="flex-1 min-w-0"
          :data="item"
          isHorizontal
          imgCol="xs:w-4rem md:w-9rem"
          :size="{ xs: [112, 112], md: [144, 144] }"
          :allowVerticalEffect="false"
          @on-click="playlistQueueSideBar = false"
        />
        <!-- the playing item can't be removed, otherwise the playlist loses track of what plays next -->
        <Button
          class="flex-none"
          icon="pi pi-trash"
          severity="secondary"
          variant="text"
          :disabled="isCurrentEpisode(item)"
          :aria-label="`Remove ${item?.title} from the playlist`"
          @click="handleRemove(item)"
        />
      </li>
    </ul>
    <p v-if="!playlist.items.length">Your playlist is empty.</p>
  </div>
</template>

<style lang="scss" scoped>
.root {
  padding-bottom: 40px;
  padding-left: 2rem;
  padding-right: 2rem;
  @include media("<md") {
    padding-left: 0;
    padding-right: 0;
  }
}
.playlist-queue-item {
  border-bottom: 1px solid var(--p-content-border-color);
  &.is-playing {
    background: var(--p-surface-25);
  }
}
.playlist-queue-handle {
  cursor: grab;
  // let the handle start a drag on touch devices instead of scrolling the drawer
  touch-action: none;
}
</style>
