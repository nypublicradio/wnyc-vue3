<script lang="ts" setup>
import { usePlaylistQueueSideBar } from "~/composables/states"
import { usePlaylistQueue } from "~/composables/usePlaylistQueue"
import { trackClickEvent } from "~/utilities/helpers"
import type { DataTableRowReorderEvent } from "primevue/datatable"

type PlaylistItem = Record<string, any>

const playlistQueueSideBar = usePlaylistQueueSideBar()
const { playlist, isCurrentEpisode, removeFromPlaylist, reorderPlaylist } =
  usePlaylistQueue()

// the row of the item that is playing looks selected
const getRowClass = (item: PlaylistItem) =>
  isCurrentEpisode(item) ? "is-playing" : undefined

// handle the reorder of the playlist when the user drags a row
const handleReorder = (e: DataTableRowReorderEvent) => {
  reorderPlaylist(e.value)
  trackClickEvent(
    "Click Tracking - Playlist Queue Reorder",
    "Playlist Queue",
    `moved from ${e.dragIndex} to ${e.dropIndex}`
  )
}

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
    <h2 class="mb-4 ml-4 md: ml-0">Playlist</h2>
    <DataTable
      v-if="playlist.items.length"
      :value="playlist.items"
      dataKey="id"
      :showHeaders="false"
      :rowClass="getRowClass"
      class="playlist-queue-table"
      @row-reorder="handleReorder"
    >
      <Column rowReorder class="w-1rem pr-0" />
      <Column>
        <template #body="{ data }">
          <MediaCard
            :data="data"
            isHorizontal
            imgCol="xs:w-4rem md:w-8rem"
            :size="{ xs: [112, 112], md: [130, 130] }"
            :allowVerticalEffect="false"
            @on-click="playlistQueueSideBar = false"
          />
        </template>
      </Column>
      <Column class="w-1rem pl-0 pr-1">
        <template #body="{ data }">
          <!-- the playing item can't be removed, otherwise the playlist loses track of what plays next -->
          <Button
            icon="pi pi-trash"
            severity="secondary"
            variant="text"
            :disabled="isCurrentEpisode(data)"
            :aria-label="`Remove ${data?.title} from the playlist`"
            @click="handleRemove(data)"
          />
        </template>
      </Column>
    </DataTable>
    <p v-else>Your playlist is empty.</p>
  </div>
</template>

<style lang="scss" scoped>
.root {
  padding-bottom: calc($playerHeightBrowser + 40px);
  padding-left: 2rem;
  padding-right: 2rem;
  @include media("<md") {
    padding-left: 0;
    padding-right: 0;
  }
}
.playlist-queue-table {
  .p-datatable-table-container {
    overflow: visible;
  }
  :deep(.p-datatable-tbody > tr) {
    background: transparent;
  }
  :deep(.p-datatable-tbody > tr.is-playing) {
    //background: var(--p-datatable-row-selected-background);
    background: var(--p-surface-25);
  }
}
</style>
