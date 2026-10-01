import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPublisherDisplayDate } from '../utilities/publisherDate'
import { getStoryDetailDate } from '../utilities/storyDate'

vi.mock('~/composables/states', () => ({ useIsApp: () => ({ value: false }) }))
beforeAll(() => vi.stubGlobal('defineNuxtPlugin', (plugin) => plugin))
afterEach(() => vi.useRealTimers())
const freeze = (time = '2026-10-01T14:00:00Z') => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(time))
}

// Run under several TZ values using Vitest itself; no child-process TS loader
// and no file paths derived from the caller's current working directory.
describe('Publisher story detail dates', () => {
  it.each([
    ['1993-06-27T00:00:00-04:00', '1993-06-27'],
    ['1993-06-27T00:00:00-0400', '1993-06-27'],
    ['1993-06-27T00:00:00.123456', '1993-06-27'],
    ['1993-06-27', '1993-06-27'],
    ['2026-01-01T01:00:00Z', '2025-12-31'],
    ['2026-03-08T03:30:00-04:00', '2026-03-08'],
    ['2026-11-01T02:30:00-05:00', '2026-11-01'],
  ])('normalizes %s to a calendar date', (input, expected) => {
    expect(getPublisherDisplayDate(input)).toBe(expected)
  })
  it.each(['1900-01-01T00:00:00Z', '1900-01-01', 'Episode 12', 'invalid', '2026-02-30', '2026-13-01', '2026-01-01T25:00:00', '', null, undefined])(
    'rejects unknown or malformed dates: %s', input => expect(getPublisherDisplayDate(input)).toBeUndefined(),
  )
  it('uses release time for same-day stories before and after the editorial noon placeholder', async () => {
    const { getDate } = await import('../utilities/helpers')
    const item = { cmsSource: 'publisher', displayDate: '2026-10-01', publicationDate: '2026-10-01T08:39:00Z' }
    for (const now of ['2026-10-01T12:00:00Z', '2026-10-01T18:00:00Z']) {
      freeze(now)
      expect(getStoryDetailDate(item, getDate)).toBe(getDate(item, 'LLL d'))
      expect(getStoryDetailDate(item, getDate)).not.toContain('in ')
    }
  })
  it('runs the real relative formatter and preserves existing newscast labels', async () => {
    freeze()
    const { getDate } = await import('../utilities/helpers')
    const item = { cmsSource: 'publisher', displayDate: '2026-10-01', publicationDate: '2026-10-01T13:00:00Z' }
    expect(getStoryDetailDate(item, getDate)).toBe('1 hour ago')
    const saved = { cmsSource: 'publisher', meta: { firstPublishedAt: 'Thu, 01 Oct 2026 13:00:00 GMT' } }
    expect(getDate(saved)).toBe('1 hour ago')
  })
  it('corrects an archive detail without changing cards, saved items or the player', async () => {
    freeze()
    const { getDate } = await import('../utilities/helpers')
    const item = { cmsSource: 'publisher', displayDate: '1993-06-27', publicationDate: '2000-01-01T12:00:00Z', meta: { firstPublishedAt: '2000-01-01T12:00:00Z' } }
    expect(getStoryDetailDate(item, getDate)).toBe('Jun 27, 1993')
    expect(getDate(item)).toBe(getDate({ ...item, displayDate: undefined }))
    expect(getDate({ cmsSource: 'publisher', meta: item.meta })).toBe(getDate(item))
  })
  it('falls back to the existing label for future airings, invalid or absent editorial dates', async () => {
    freeze()
    const { getDate } = await import('../utilities/helpers')
    for (const displayDate of ['2026-10-02', 'invalid', '1900-01-01', undefined]) {
      const item = { cmsSource: 'publisher', displayDate, publicationDate: '2025-04-01T12:00:00Z' }
      expect(getStoryDetailDate(item, getDate)).toBe(getDate(item, 'LLL d'))
    }
  })
  it('leaves other CMS sources unchanged, including local midnight behavior', async () => {
    freeze('2026-10-02T04:30:00Z')
    const { getDate } = await import('../utilities/helpers')
    for (const cmsSource of ['wagtail', 'simplecast', 'npr', 'publisher']) {
      const item = { cmsSource, publicationDate: '2026-10-02T03:30:00Z' }
      expect(getStoryDetailDate(item, getDate)).toBe(getDate(item, 'LLL d'))
    }
  })
  it('does not invent a date for an undated Publisher story', async () => {
    freeze()
    const { getDate } = await import('../utilities/helpers')
    expect(getStoryDetailDate({ cmsSource: 'publisher' }, getDate)).toBeNull()
  })
})
