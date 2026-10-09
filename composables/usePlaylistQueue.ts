import { watch } from "vue"
import type { InjectionKey } from "vue"
import { useCurrentEpisode, usePlaylistQueueState } from "~/composables/states"
import { togglePlayEpisode } from "~/utilities/helpers"

type PlaylistItem = Record<string, any>

// context provided by CuratedListPlaylistProvider to the MediaCards rendered inside a curated list
export interface PlaylistQueueProviderContext {
  register: (item: PlaylistItem) => void
  unregister: (item: PlaylistItem) => void
  startPlaylist: (item: PlaylistItem) => void
}

export const PLAYLIST_QUEUE_PROVIDER_KEY: InjectionKey<PlaylistQueueProviderContext> =
  Symbol("playlistQueueProvider")

// ids can be numbers or strings depending on the source, so always compare them as strings
const toId = (item: PlaylistItem | null | undefined) =>
  item?.id === undefined || item?.id === null ? null : String(item.id)

// Function to manage the global playlist queue.
export const usePlaylistQueue = () => {
  const playlist = usePlaylistQueueState()
  const currentEpisode = useCurrentEpisode()

  const hasItem = (item: PlaylistItem) =>
    playlist.value.items.some((playlistItem) => toId(playlistItem) === toId(item))

  // whether the item is the episode currently loaded in the player
  const isCurrentEpisode = (item: PlaylistItem) =>
    toId(currentEpisode.value) !== null && toId(currentEpisode.value) === toId(item)

  // replace the playlist with the playable items of a curated list when one of its items is played
  const setPlaylistFromCuratedList = (
    sourceKey: string,
    items: PlaylistItem[],
    clickedItem: PlaylistItem
  ) => {
    // a pause/resume click on the current episode should not undo the user's reorder/removals
    if (isCurrentEpisode(clickedItem)) return
    // this curated list already populated the playlist, the watcher will select the item
    if (playlist.value.sourceKey === sourceKey && hasItem(clickedItem)) return
    // currentId is set by the watcher once the clicked item becomes the current episode
    playlist.value = { sourceKey, items: [...items], currentId: null }
  }

  // append newly rendered curated list items (e.g. "Load More") to the playlist they populated
  const appendToPlaylist = (sourceKey: string, items: PlaylistItem[]) => {
    if (playlist.value.sourceKey !== sourceKey) return
    const newItems = items.filter((item) => !hasItem(item))
    if (newItems.length) {
      playlist.value.items = [...playlist.value.items, ...newItems]
    }
  }

  const removeFromPlaylist = (item: PlaylistItem) => {
    playlist.value.items = playlist.value.items.filter(
      (playlistItem) => toId(playlistItem) !== toId(item)
    )
  }

  const reorderPlaylist = (items: PlaylistItem[]) => {
    playlist.value.items = items
  }

  // play the item after the current one, returns false when there is nothing next to play
  const playNextInPlaylist = () => {
    const currentIndex = playlist.value.items.findIndex(
      (item) => toId(item) === playlist.value.currentId
    )
    const nextItem =
      currentIndex === -1 ? null : playlist.value.items[currentIndex + 1]
    if (!nextItem) {
      playlist.value.currentId = null
      return false
    }
    togglePlayEpisode(nextItem)
    return true
  }

  // keep the playlist in sync with whatever starts playing, from any play entry point
  // this should only be called once, from the AudioPlayer, so there is only one watcher for the life of the app
  const initPlaylistQueueWatcher = () => {
    watch(currentEpisode, (episode) => {
      // the episode ended or is being reloaded
      if (!episode) return
      // live stream: keep the playlist, but nothing in it is playing
      if (episode.hls) {
        playlist.value.currentId = null
        return
      }
      // the episode is already in the playlist, select it
      if (hasItem(episode)) {
        playlist.value.currentId = toId(episode)
        return
      }
      // any other episode replaces the playlist
      playlist.value = {
        sourceKey: null,
        items: [episode],
        currentId: toId(episode),
      }
    })
  }

  return {
    playlist,
    isCurrentEpisode,
    setPlaylistFromCuratedList,
    appendToPlaylist,
    removeFromPlaylist,
    reorderPlaylist,
    playNextInPlaylist,
    initPlaylistQueueWatcher,
  }
}
