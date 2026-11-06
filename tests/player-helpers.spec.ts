import { describe, expect, it } from 'vitest'
import {
  buildAutoPlayEpisode,
  getStreamUrl,
  isKnownDuration,
  isSameLiveStation,
  stepVolume,
} from '~/utilities/player'

describe('player helpers', () => {
  it('plays the live stream first, then the file, then the audio', () => {
    expect(getStreamUrl({ hls: 'live.m3u8', file: 'file.mp3', audio: 'audio.mp3' })).toBe('live.m3u8')
    expect(getStreamUrl({ file: 'blob:file', audio: 'audio.mp3' })).toBe('blob:file')
    expect(getStreamUrl({ audio: 'audio.mp3' })).toBe('audio.mp3')
    expect(getStreamUrl(null)).toBe('')
  })

  it('only takes real durations', () => {
    expect(isKnownDuration(1834.5)).toBe(true)
    // Android before it knows, web for a live stream, iOS/Android without a payload
    expect(isKnownDuration(0)).toBe(false)
    expect(isKnownDuration(Infinity)).toBe(false)
    expect(isKnownDuration(NaN)).toBe(false)
    expect(isKnownDuration(undefined)).toBe(false)
  })

  it('matches the live station by slug, or by stream when there is no slug', () => {
    const station = { slug: 'wnyc-fm939', hls: 'https://example.org/fm939.m3u8' }
    expect(isSameLiveStation({ slug: 'wnyc-fm939', hls: 'https://other.example.org/x.m3u8' }, station)).toBe(true)
    expect(isSameLiveStation({ slug: 'wnyc-am820', hls: station.hls }, station)).toBe(false)
    expect(isSameLiveStation({ hls: station.hls }, station)).toBe(true)
    expect(isSameLiveStation({ hls: 'https://example.org/am820.m3u8' }, station)).toBe(false)
    expect(isSameLiveStation({}, { slug: 'wnyc-fm939' })).toBe(false)
    expect(isSameLiveStation({ slug: 'wnyc-fm939' }, null)).toBe(false)
  })

  it('steps the volume by 0.1 within 0 and 1', () => {
    expect(stepVolume(0.5, 0.1)).toBe(0.6)
    // no floating point drift: 0.7 + 0.1 is 0.7999999999999999
    expect(stepVolume(0.7, 0.1)).toBe(0.8)
    expect(stepVolume(0.30000000000000004, -0.1)).toBe(0.2)
    expect(stepVolume(1, 0.1)).toBe(1)
    expect(stepVolume(0.05, -0.1)).toBe(0)
    expect(stepVolume(0, -0.1)).toBe(0)
  })

  describe('an item started from the car', () => {
    it('is a live station, with the station slug from its media id', () => {
      const episode = buildAutoPlayEpisode({
        mediaId: 'live:wnyc-fm939',
        isLive: true,
        streamUrl: 'https://example.org/fm939.m3u8',
        title: 'WNYC 93.9 FM',
        artist: 'All Things Considered',
        imageUrl: 'https://example.org/fm939.png',
      })
      expect(episode).toMatchObject({
        id: 'live:wnyc-fm939',
        slug: 'wnyc-fm939',
        hls: 'https://example.org/fm939.m3u8',
        title: 'WNYC 93.9 FM',
        showTitle: 'All Things Considered',
        station: 'All Things Considered',
        player_image: 'https://example.org/fm939.png',
        fromAuto: true,
        hideFavorite: true,
      })
      expect(episode.audio).toBeUndefined()
      expect(episode.file).toBeUndefined()
    })

    it('is an on-demand item, without a station slug', () => {
      const episode = buildAutoPlayEpisode({
        mediaId: 'episode:radiolab:123',
        isLive: false,
        streamUrl: 'https://example.org/123.mp3',
        title: 'An episode',
        duration: 1800,
      })
      expect(episode).toMatchObject({
        id: 'episode:radiolab:123',
        audio: 'https://example.org/123.mp3',
        file: 'https://example.org/123.mp3',
        duration: 1800,
        fromAuto: true,
        hideFavorite: true,
      })
      expect(episode.slug).toBeUndefined()
      expect(episode.hls).toBeUndefined()
    })

    it('falls back to the deprecated id and the media id as title', () => {
      const episode = buildAutoPlayEpisode({ id: 'live:wqxr', isLive: true, streamUrl: 'x.m3u8' })
      expect(episode).toMatchObject({ id: 'live:wqxr', title: 'live:wqxr', slug: 'wqxr' })
    })
  })
})
