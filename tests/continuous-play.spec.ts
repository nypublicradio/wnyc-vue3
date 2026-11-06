import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/composables/states', async () => {
  const { ref } = await import('vue')
  const isLiveStream = ref(false)
  const profile = ref({ continuous_play: true })
  const station = ref({ slug: 'wnyc-fm939', hls: 'https://example.org/live.m3u8' })
  const isPlayingBumper = ref(false)
  return {
    useIsLiveStream: () => isLiveStream,
    useCurrentUserProfile: () => profile,
    useCurrentEpisodeHolder: () => station,
    useIsPlayingBumper: () => isPlayingBumper,
  }
})

vi.mock('~/utilities/helpers', () => ({ togglePlayEpisode: vi.fn() }))
vi.mock('~/composables/globals', () => ({ mediaTypes: { LIVE: 'live' } }))
vi.mock('~/composables/usePlaylistQueue', () => {
  const playNextInPlaylist = vi.fn(() => false)
  return { usePlaylistQueue: () => ({ playNextInPlaylist }) }
})
vi.mock('@nypublicradio/capacitor-remote-streamer', () => ({
  RemoteStreamer: { play: vi.fn(async () => {}) },
}))

const { useCurrentUserProfile, useCurrentEpisodeHolder, useIsPlayingBumper } = await import('~/composables/states')
const { togglePlayEpisode } = await import('~/utilities/helpers')
const { usePlaylistQueue } = await import('~/composables/usePlaylistQueue')
const { RemoteStreamer } = await import('@nypublicradio/capacitor-remote-streamer')
const { useContinuousPlay } = await import('~/composables/useContinuousPlay')

const profile = useCurrentUserProfile()
const station = useCurrentEpisodeHolder()
const isPlayingBumper = useIsPlayingBumper()
const { playNextInPlaylist } = usePlaylistQueue()

describe('continuous play', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    profile.value = { continuous_play: true }
    isPlayingBumper.value = false
  })

  it('plays the next item in the queue', () => {
    vi.mocked(playNextInPlaylist).mockReturnValueOnce(true)
    expect(useContinuousPlay().playNextAfterEnd()).toBe(true)
  })

  it('does nothing when the user turned it off', async () => {
    profile.value = { continuous_play: false }
    const { playNextAfterEnd, playLiveStreamAfterEnd } = useContinuousPlay()
    expect(playNextAfterEnd()).toBe(false)
    await playLiveStreamAfterEnd()
    expect(playNextInPlaylist).not.toHaveBeenCalled()
    expect(RemoteStreamer.play).not.toHaveBeenCalled()
    expect(togglePlayEpisode).not.toHaveBeenCalled()
  })

  it('plays the bundled bumper through the native player, then the live stream when it ends', async () => {
    const { playLiveStreamAfterEnd, bumperEnded } = useContinuousPlay()
    await playLiveStreamAfterEnd()
    expect(RemoteStreamer.play).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'bundle:live-stream-audio-bumpers/wnyc-fm939.mp3' })
    )
    expect(togglePlayEpisode).not.toHaveBeenCalled()

    expect(bumperEnded()).toBe(true)
    expect(togglePlayEpisode).toHaveBeenCalledWith(station.value, 'live')
    // the live stream ending (it doesn't, but an error might) isn't the bumper again
    expect(bumperEnded()).toBe(false)
  })

  it('goes straight to the live stream when the station has no bumper', async () => {
    vi.mocked(RemoteStreamer.play).mockRejectedValueOnce(new Error('Nothing to play'))
    const { playLiveStreamAfterEnd, bumperEnded } = useContinuousPlay()
    await playLiveStreamAfterEnd()
    expect(togglePlayEpisode).toHaveBeenCalledWith(station.value, 'live')
    expect(bumperEnded()).toBe(false)
  })

  it('forgets the bumper when something else starts', async () => {
    const { playLiveStreamAfterEnd, bumperEnded, cancelBumper } = useContinuousPlay()
    await playLiveStreamAfterEnd()
    cancelBumper()
    expect(bumperEnded()).toBe(false)
    expect(togglePlayEpisode).not.toHaveBeenCalled()
  })
})
