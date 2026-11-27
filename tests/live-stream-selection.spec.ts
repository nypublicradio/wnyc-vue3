import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/composables/states', async () => {
  const { ref } = await import('vue')
  const allCurrentStations = ref(null)
  const currentEpisodeHolder = ref(null)
  const currentStreamStation = ref('wnyc-fm939')
  const profile = ref({ default_live_stream: 'WNYC 93.9 FM' })
  const globalToast = ref(null)
  const currentEpisode = ref(null)
  const isLiveStream = ref(false)
  return {
    useAllCurrentStations: () => allCurrentStations,
    useCurrentEpisodeHolder: () => currentEpisodeHolder,
    useCurrentStreamStation: () => currentStreamStation,
    useCurrentUserProfile: () => profile,
    useGlobalToast: () => globalToast,
    useCurrentEpisode: () => currentEpisode,
    useIsLiveStream: () => isLiveStream,
  }
})

vi.mock('~/utilities/helpers', () => ({
  trackClickEvent: vi.fn(),
  togglePlayEpisode: vi.fn(),
  refreshData: vi.fn(),
  saveRecentlyPlayed: vi.fn(),
}))

vi.stubGlobal('useRuntimeConfig', () => ({ public: { BFF_URL: 'https://bff.example.org' } }))
vi.stubGlobal('$fetch', vi.fn(async () => [
  { slug: 'wnyc-fm939', station: 'WNYC 93.9 FM' },
  { slug: 'wqxr', station: 'WQXR' },
  { slug: 'q2', station: 'New Sounds' },
]))

const {
  useCurrentEpisodeHolder,
  useCurrentStreamStation,
  useCurrentEpisode,
  useIsLiveStream,
  useCurrentUserProfile,
} = await import('~/composables/states')
const { buildAutoPlayEpisode } = await import('~/utilities/player')
const { updateAllLiveStreams } = await import('~/composables/data/liveStream')

const holder = useCurrentEpisodeHolder()
const streamStation = useCurrentStreamStation()
const currentEpisode = useCurrentEpisode()
const isLiveStream = useIsLiveStream()
const profile = useCurrentUserProfile()

const expectSelected = (slug: string) => {
  expect(holder.value?.slug).toBe(slug)
  expect(streamStation.value).toBe(slug)
}

describe('selected live station', () => {
  beforeEach(() => {
    holder.value = null
    streamStation.value = 'wnyc-fm939'
    currentEpisode.value = null
    isLiveStream.value = false
    profile.value = { default_live_stream: 'WNYC 93.9 FM' }
  })

  it('stays on the live station that is playing when the profile is reloaded', async () => {
    isLiveStream.value = true
    currentEpisode.value = { slug: 'wqxr', hls: 'https://stream.wqxr.org/wqxr' }
    await updateAllLiveStreams(true)
    expectSelected('wqxr')
  })

  it('stays on the live station that is playing on a refresh with a stale selection', async () => {
    isLiveStream.value = true
    currentEpisode.value = { slug: 'wqxr', hls: 'https://stream.wqxr.org/wqxr' }
    await updateAllLiveStreams(false)
    expectSelected('wqxr')
  })

  it('selects the profile default when nothing is in the player', async () => {
    streamStation.value = 'q2'
    await updateAllLiveStreams(true)
    expectSelected('wnyc-fm939')
  })

  it('selects the profile default when an on-demand episode is in the player', async () => {
    currentEpisode.value = { slug: 'wqxr', audio: 'https://example.org/episode.mp3' }
    await updateAllLiveStreams(true)
    expectSelected('wnyc-fm939')
  })

  it('stays on a live station started from the car', async () => {
    isLiveStream.value = true
    currentEpisode.value = buildAutoPlayEpisode({
      mediaId: 'live:wqxr',
      isLive: true,
      streamUrl: 'https://stream.wqxr.org/wqxr?listenerid=0',
    })
    await updateAllLiveStreams(true)
    expectSelected('wqxr')
  })
})
