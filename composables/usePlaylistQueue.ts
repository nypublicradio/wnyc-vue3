import { computed, watch } from "vue"
import type { InjectionKey } from "vue"
import {
  useCurrentEpisode,
  useIsApp,
  usePlaylistQueueState,
} from "~/composables/states"
import { togglePlayEpisode, hasAudio } from "~/utilities/helpers"

type PlaylistItem = Record<string, any>

// context provided by PlaylistProvider to the MediaCards rendered inside it (a curated list or the show episodes list)
export interface PlaylistQueueProviderContext {
  register: (item: PlaylistItem) => void
  unregister: (item: PlaylistItem) => void
  startPlaylist: (item: PlaylistItem) => void
}

export const PLAYLIST_QUEUE_PROVIDER_KEY: InjectionKey<PlaylistQueueProviderContext> =
  Symbol("playlistQueueProvider")

// the mounted curated list providers keyed by their curated list block id, so components outside a curated list (e.g. ShowHeader) can start its playlist
// only populated on the client (providers register on mount)
const mountedCuratedListProviders = new Map<string, PlaylistQueueProviderContext>()

export const registerCuratedListProvider = (
  sourceKey: string,
  provider: PlaylistQueueProviderContext
) => {
  mountedCuratedListProviders.set(sourceKey, provider)
}

export const unregisterCuratedListProvider = (
  sourceKey: string,
  provider: PlaylistQueueProviderContext
) => {
  // a newer provider for the same list may have mounted before this one unmounted
  if (mountedCuratedListProviders.get(sourceKey) === provider) {
    mountedCuratedListProviders.delete(sourceKey)
  }
}

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

  // populate the playlist from a curated list block when one of its items is played from outside the list (e.g. ShowHeader)
  const startPlaylistFromCuratedList = (
    curatedList: PlaylistItem,
    clickedItem: PlaylistItem
  ) => {
    const sourceKey = String(curatedList?.id)
    // the curated list is rendered on this page, use its rendered items
    const provider = mountedCuratedListProviders.get(sourceKey)
    if (provider) {
      provider.startPlaylist(clickedItem)
      return
    }
    // the curated list is not rendered on this page, use all of its playable items
    const playableItems = (curatedList?.value?.list?.listItems ?? []).filter(
      (item: PlaylistItem) => hasAudio(item?.audio)
    )
    setPlaylistFromCuratedList(sourceKey, playableItems, clickedItem)
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

  // position of the current item in the playlist, -1 when nothing in the playlist is selected (e.g. the live stream is playing)
  const currentIndex = computed(() =>
    playlist.value.items.findIndex(
      (item) => toId(item) === playlist.value.currentId
    )
  )

  // whether there is an item before/after the current one, e.g. to disable the previous/next buttons at the start/end of the playlist
  const hasPrevious = computed(() => currentIndex.value > 0)
  const hasNext = computed(
    () =>
      currentIndex.value !== -1 &&
      currentIndex.value < playlist.value.items.length - 1
  )

  // play the playlist item at the given position
  const playPlaylistItemAt = (index: number) => {
    const item = playlist.value.items[index]
    // move the current item right away (the watcher only catches up on the next tick), so quick repeated presses step through the playlist instead of toggling pause on the item that is loading
    playlist.value.currentId = toId(item)
    togglePlayEpisode(item)
  }

  // play the item after the current one, returns false at the end of the playlist or when nothing in it is selected
  const playNextInPlaylist = () => {
    if (!hasNext.value) return false
    playPlaylistItemAt(currentIndex.value + 1)
    return true
  }

  // play the item before the current one, returns false at the start of the playlist or when nothing in it is selected
  const playPreviousInPlaylist = () => {
    if (!hasPrevious.value) return false
    playPlaylistItemAt(currentIndex.value - 1)
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

  // browser media controls (e.g. Chrome's media hub): hook the next/previous track buttons up to the playlist
  // the browser has no default for these buttons, so they are greyed out until a handler is set, and a null handler greys them out again
  // the app (iOS/Android) uses the native player's lock screen controls instead, so it is skipped there
  // this should only be called once, from the AudioPlayer, so there is only one watcher for the life of the app
  const initMediaSessionPlaylistControls = () => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return
    const isApp = useIsApp()
    watch(
      [hasNext, hasPrevious, isApp],
      ([canPlayNext, canPlayPrevious, inApp]) => {
        navigator.mediaSession.setActionHandler(
          "nexttrack",
          canPlayNext && !inApp ? () => playNextInPlaylist() : null
        )
        navigator.mediaSession.setActionHandler(
          "previoustrack",
          canPlayPrevious && !inApp ? () => playPreviousInPlaylist() : null
        )
      },
      { immediate: true }
    )
  }

  return {
    playlist,
    isCurrentEpisode,
    setPlaylistFromCuratedList,
    startPlaylistFromCuratedList,
    appendToPlaylist,
    removeFromPlaylist,
    reorderPlaylist,
    hasNext,
    hasPrevious,
    playNextInPlaylist,
    playPreviousInPlaylist,
    initPlaylistQueueWatcher,
    initMediaSessionPlaylistControls,
  }
}
