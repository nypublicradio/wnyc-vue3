import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import type { EffectScope, Ref } from 'vue'

vi.mock('~/composables/states', async () => {
  const { ref } = await import('vue')
  const currentEpisode = ref(null)
  const playlistState = ref({ sourceKey: null, items: [], currentId: null })
  return {
    useCurrentEpisode: () => currentEpisode,
    usePlaylistQueueState: () => playlistState,
  }
})

vi.mock('~/utilities/helpers', () => ({
  togglePlayEpisode: vi.fn(),
  hasAudio: (audio: unknown) => typeof audio === 'string' && audio.trim() !== '',
}))

const { useCurrentEpisode, usePlaylistQueueState } = await import('~/composables/states')
const { togglePlayEpisode } = await import('~/utilities/helpers')
const {
  usePlaylistQueue,
  registerCuratedListProvider,
  unregisterCuratedListProvider,
} = await import('~/composables/usePlaylistQueue')

const currentEpisode = useCurrentEpisode() as Ref<Record<string, any> | null>
const playlist = usePlaylistQueueState() as Ref<{
  sourceKey: string | null
  items: Record<string, any>[]
  currentId: string | null
}>

const episode = (id: number | string) => ({ id, title: `Episode ${id}`, audio: `https://audio/${id}.mp3` })
const ids = () => playlist.value.items.map((item) => item.id)

let scope: EffectScope

beforeEach(() => {
  currentEpisode.value = null
  playlist.value = { sourceKey: null, items: [], currentId: null }
  vi.mocked(togglePlayEpisode).mockClear()
  // the watcher is normally registered once by the AudioPlayer
  scope = effectScope()
  scope.run(() => usePlaylistQueue().initPlaylistQueueWatcher())
})

afterEach(() => {
  scope.stop()
})

describe('playlist queue', () => {
  it('replaces the playlist with the curated list and selects the played item', async () => {
    const { setPlaylistFromCuratedList } = usePlaylistQueue()
    const list = [episode(1), episode(2), episode(3)]

    setPlaylistFromCuratedList('list-a', list, list[2])
    currentEpisode.value = list[2]
    await nextTick()

    expect(ids()).toEqual([1, 2, 3])
    expect(playlist.value.sourceKey).toBe('list-a')
    expect(playlist.value.currentId).toBe('3')
  })

  it('does not reset the playlist on a pause/resume click of the current episode', async () => {
    const { setPlaylistFromCuratedList } = usePlaylistQueue()
    const list = [episode(1), episode(2)]
    setPlaylistFromCuratedList('list-a', list, list[0])
    currentEpisode.value = list[0]
    await nextTick()

    setPlaylistFromCuratedList('list-b', [episode(1), episode(9)], episode(1))

    expect(ids()).toEqual([1, 2])
    expect(playlist.value.sourceKey).toBe('list-a')
  })

  it('keeps the user order when the same curated list plays another of its items', async () => {
    const { setPlaylistFromCuratedList, reorderPlaylist } = usePlaylistQueue()
    const list = [episode(1), episode(2), episode(3)]
    setPlaylistFromCuratedList('list-a', list, list[0])
    currentEpisode.value = list[0]
    await nextTick()
    reorderPlaylist([list[0], list[2], list[1]])

    setPlaylistFromCuratedList('list-a', list, list[1])
    currentEpisode.value = list[1]
    await nextTick()

    expect(ids()).toEqual([1, 3, 2])
    expect(playlist.value.currentId).toBe('2')
  })

  it('replaces the playlist with a single episode played from outside it', async () => {
    const { setPlaylistFromCuratedList } = usePlaylistQueue()
    const list = [episode(1), episode(2)]
    setPlaylistFromCuratedList('list-a', list, list[0])
    currentEpisode.value = list[0]
    await nextTick()

    currentEpisode.value = episode(42)
    await nextTick()

    expect(ids()).toEqual([42])
    expect(playlist.value.sourceKey).toBeNull()
    expect(playlist.value.currentId).toBe('42')
  })

  it('keeps the playlist but deselects it when the live stream plays', async () => {
    const { setPlaylistFromCuratedList } = usePlaylistQueue()
    const list = [episode(1), episode(2)]
    setPlaylistFromCuratedList('list-a', list, list[0])
    currentEpisode.value = list[0]
    await nextTick()

    currentEpisode.value = { id: 'wnyc-fm939', hls: 'https://live/stream.m3u8' }
    await nextTick()

    expect(ids()).toEqual([1, 2])
    expect(playlist.value.currentId).toBeNull()
  })

  it('ignores the current episode being cleared when an episode ends', async () => {
    currentEpisode.value = episode(1)
    await nextTick()

    currentEpisode.value = null
    await nextTick()

    expect(ids()).toEqual([1])
    expect(playlist.value.currentId).toBe('1')
  })

  it('matches number and string ids', async () => {
    const { setPlaylistFromCuratedList, isCurrentEpisode } = usePlaylistQueue()
    setPlaylistFromCuratedList('list-a', [episode(1), episode(2)], episode(2))
    currentEpisode.value = episode('2')
    await nextTick()

    expect(ids()).toEqual([1, 2])
    expect(playlist.value.currentId).toBe('2')
    expect(isCurrentEpisode(episode(2))).toBe(true)
  })

  it('plays the next item in the reordered playlist and stops at the end', async () => {
    const { setPlaylistFromCuratedList, reorderPlaylist, playNextInPlaylist } = usePlaylistQueue()
    const list = [episode(1), episode(2), episode(3)]
    setPlaylistFromCuratedList('list-a', list, list[0])
    currentEpisode.value = list[0]
    await nextTick()
    reorderPlaylist([list[0], list[2], list[1]])

    // the episode ended
    currentEpisode.value = null
    expect(playNextInPlaylist()).toBe(true)
    expect(togglePlayEpisode).toHaveBeenLastCalledWith(list[2])

    playlist.value.currentId = '2'
    expect(playNextInPlaylist()).toBe(false)
    expect(playlist.value.currentId).toBeNull()
    expect(ids()).toEqual([1, 3, 2])
  })

  it('has nothing next to play when nothing in the playlist is selected', () => {
    const { playNextInPlaylist } = usePlaylistQueue()
    playlist.value = { sourceKey: 'list-a', items: [episode(1), episode(2)], currentId: null }

    expect(playNextInPlaylist()).toBe(false)
    expect(togglePlayEpisode).not.toHaveBeenCalled()
  })

  it('appends newly rendered items only to the playlist their curated list populated', () => {
    const { appendToPlaylist } = usePlaylistQueue()
    playlist.value = { sourceKey: 'list-a', items: [episode(1), episode(2)], currentId: '1' }

    appendToPlaylist('list-b', [episode(7)])
    expect(ids()).toEqual([1, 2])

    appendToPlaylist('list-a', [episode(2), episode(3)])
    expect(ids()).toEqual([1, 2, 3])
  })

  it('starts the playlist through the mounted provider of a curated list played from outside it', () => {
    const { startPlaylistFromCuratedList } = usePlaylistQueue()
    const provider = { register: vi.fn(), unregister: vi.fn(), startPlaylist: vi.fn() }
    const curatedList = { id: 'block-1', value: { list: { listItems: [episode(1), episode(2)] } } }
    registerCuratedListProvider('block-1', provider)

    startPlaylistFromCuratedList(curatedList, episode(1))

    expect(provider.startPlaylist).toHaveBeenCalledWith(episode(1))
    unregisterCuratedListProvider('block-1', provider)
  })

  it('uses all playable items of a curated list that is not rendered on the page', () => {
    const { startPlaylistFromCuratedList } = usePlaylistQueue()
    const curatedList = {
      id: 'block-2',
      value: { list: { listItems: [episode(1), { id: 2, title: 'Article', audio: '' }, episode(3)] } },
    }

    startPlaylistFromCuratedList(curatedList, episode(1))

    expect(ids()).toEqual([1, 3])
    expect(playlist.value.sourceKey).toBe('block-2')
  })

  it('keeps a newer provider registered when an older one for the same list unmounts', () => {
    const { startPlaylistFromCuratedList } = usePlaylistQueue()
    const oldProvider = { register: vi.fn(), unregister: vi.fn(), startPlaylist: vi.fn() }
    const newProvider = { register: vi.fn(), unregister: vi.fn(), startPlaylist: vi.fn() }
    registerCuratedListProvider('block-3', oldProvider)
    registerCuratedListProvider('block-3', newProvider)
    unregisterCuratedListProvider('block-3', oldProvider)

    startPlaylistFromCuratedList({ id: 'block-3' }, episode(1))

    expect(newProvider.startPlaylist).toHaveBeenCalledWith(episode(1))
    expect(oldProvider.startPlaylist).not.toHaveBeenCalled()
    unregisterCuratedListProvider('block-3', newProvider)
  })

  it('removes an item from the playlist', () => {
    const { removeFromPlaylist } = usePlaylistQueue()
    playlist.value = { sourceKey: 'list-a', items: [episode(1), episode(2)], currentId: '1' }

    removeFromPlaylist(episode('2'))

    expect(ids()).toEqual([1])
  })
})
