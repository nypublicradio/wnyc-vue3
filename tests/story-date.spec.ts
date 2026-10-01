import { afterEach, describe, expect, it, vi } from 'vitest'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { format } from 'date-fns'
import { getPublisherPublicationDate, getStoryDate } from '../utilities/storyDate'

afterEach(() => vi.useRealTimers())

describe('Publisher date display across server and viewer timezones', () => {
  it.each(['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Pacific/Honolulu', 'Asia/Tokyo'])(
    'retains the editorial calendar day in %s, including serialized server dates', (timezone) => {
      const moduleUrl = pathToFileURL(resolve('utilities/storyDate.ts')).href
      const code = `
        import { getPublisherPublicationDate, getStoryDate } from ${JSON.stringify(moduleUrl)};
        const dates = ['1993-06-27T00:00:00-04:00', '1993-06-27T00:00:00', '1993-06-27'];
        const labels = dates.map(newsdate => {
          const publicationDate = getPublisherPublicationDate({ newsdate });
          const data = JSON.parse(JSON.stringify({ cmsSource: 'publisher', publicationDate, meta: { firstPublishedAt: publicationDate } }));
          return { instant: publicationDate.toISOString(), label: getStoryDate(data, 'LLL d', () => 'today') };
        });
        const fallback = getPublisherPublicationDate({ publishAt: '2000-01-01T00:00:00' });
        labels.push({ instant: fallback.toISOString(), label: getStoryDate({ cmsSource: 'publisher', publicationDate: fallback }, 'LLL d', () => 'today') });
        labels.push({ label: getStoryDate({ cmsSource: 'publisher', meta: { firstPublishedAt: '2000-01-01T00:00:00' } }, 'LLL d', () => 'today') });
        console.log(JSON.stringify(labels));
      `
      const child = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
        env: { ...process.env, TZ: timezone }, encoding: 'utf8',
      })
      expect(child.status, child.stderr).toBe(0)
      expect(JSON.parse(child.stdout)).toEqual([
        ...Array.from({ length: 3 }, () => ({ instant: '1993-06-27T04:00:00.000Z', label: 'Jun 27, 1993' })),
        { instant: '2000-01-01T05:00:00.000Z', label: 'Jan 1, 2000' },
        { label: 'Jan 1, 2000' },
      ])
    },
  )

  it('uses the Publisher calendar for today and the year boundary', () => {
    vi.useFakeTimers()
    // It is already 2026 in UTC, but still December 31, 2025 in New York.
    vi.setSystemTime(new Date('2026-01-01T00:30:00Z'))
    const relativeTime = vi.fn(() => '6 hours ago')
    const today = getPublisherPublicationDate({ newsdate: '2025-12-31T12:00:00-05:00' })
    expect(getStoryDate({ cmsSource: 'publisher', publicationDate: today }, 'LLL d', relativeTime)).toBe('6 hours ago')
    expect(relativeTime).toHaveBeenCalledWith(today)
    const yesterday = getPublisherPublicationDate({ newsdate: '2025-12-30T12:00:00-05:00' })
    expect(getStoryDate({ cmsSource: 'publisher', publicationDate: yesterday }, 'LLL d', relativeTime)).toBe('Dec 30')
  })

  it('retains viewer-local formatting and saved metadata priority for other CMS sources', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'))
    const original = new Date('1993-06-27T04:00:00Z')
    const data = { cmsSource: 'wagtail', publicationDate: '2000-01-01T00:00:00Z', meta: { firstPublishedAt: original } }
    expect(getStoryDate(data, 'LLL d', () => 'today')).toBe(format(original, 'LLL d, yyyy'))
  })

  it('preserves an explicit UTC release timestamp when falling back', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'))
    const date = getPublisherPublicationDate({ publishAt: '2000-01-01T00:00:00Z' })
    expect(date).toEqual(new Date('2000-01-01T00:00:00Z'))
    expect(getStoryDate({ cmsSource: 'publisher', publicationDate: date }, 'LLL d', () => 'today')).toBe('Dec 31, 1999')
  })

  it('passes a real instant to relative time for an offsetless saved Publisher date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'))
    const relativeTime = vi.fn(() => '4 hours ago')
    const data = { cmsSource: 'publisher', meta: { firstPublishedAt: '2026-10-01T04:00:00' } }
    expect(getStoryDate(data, 'LLL d', relativeTime)).toBe('4 hours ago')
    expect(relativeTime).toHaveBeenCalledWith(new Date('2026-10-01T08:00:00Z'))
  })

  it('keeps same-day relative time for non-Publisher sources', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'))
    const date = new Date('2026-10-01T11:00:00Z')
    const relativeTime = vi.fn(() => '1 hour ago')
    expect(getStoryDate({ cmsSource: 'wagtail', publicationDate: date }, 'LLL d', relativeTime)).toBe('1 hour ago')
    expect(relativeTime).toHaveBeenCalledWith(date)
  })

  it.each([
    ['2026-03-08T01:30:00', '2026-03-08T06:30:00Z', 'Mar 8'],
    ['2026-03-08T03:30:00', '2026-03-08T07:30:00Z', 'Mar 8'],
    ['2026-11-01T00:30:00', '2026-11-01T04:30:00Z', 'Nov 1'],
    ['2026-11-01T02:30:00', '2026-11-01T07:30:00Z', 'Nov 1'],
    ['1993-06-27T00:00:00-0400', '1993-06-27T04:00:00Z', 'Jun 27, 1993'],
    ['1993-06-27T00:00:00.123456', '1993-06-27T04:00:00.123Z', 'Jun 27, 1993'],
  ])('preserves editorial dates around DST and supported timestamp formats: %s', (newsdate, instant, label) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-01T12:00:00Z'))
    const date = getPublisherPublicationDate({ newsdate })
    expect(date).toEqual(new Date(instant))
    expect(getStoryDate({ cmsSource: 'publisher', publicationDate: date }, 'LLL d', () => 'today')).toBe(label)
  })

  it('returns no timestamp when both Publisher dates are invalid', () => {
    expect(getPublisherPublicationDate({ newsdate: 'invalid', publishAt: 'also invalid' })).toBeUndefined()
  })
})
