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

// Run this file in separate Vitest processes with UTC, New York, Los Angeles,
// Brisbane and Tokyo to exercise actual process-local parsing.
describe('Publisher story detail dates', () => {
  it.each([
    ['1993-06-27T00:00:00-04:00', '1993-06-27'],
    ['1993-06-27T00:00:00-0400', '1993-06-27'],
    ['1993-06-27T00:00:00.123456', '1993-06-27'],
    ['1993-06-27', '1993-06-27'],
    ['2026-01-01T01:00:00Z', '2025-12-31'],
    ['2026-03-08T03:30:00-04:00', '2026-03-08'],
    ['2026-03-08T01:30:00', '2026-03-08'],
    ['2026-03-08T03:30:00', '2026-03-08'],
    ['2026-11-01T00:30:00', '2026-11-01'],
    ['2026-11-01T02:30:00', '2026-11-01'],
    ['0001-06-01', '0001-06-01'],
    ['2026-11-01T02:30:00-05:00', '2026-11-01'],
  ])('normalizes %s to a calendar date', (input, expected) => {
    expect(getPublisherDisplayDate(input)).toBe(expected)
  })
  it.each(['1900-01-01T00:00:00Z', '1900-01-01', 'Episode 12', 'invalid', '2026-02-30', '2026-13-01', '2026-01-01T25:00:00', '', null, undefined])(
    'rejects unknown or malformed dates: %s', input => expect(getPublisherDisplayDate(input)).toBeUndefined(),
  )
  it('uses release time for same-day stories before and after the editorial noon placeholder', async () => {
    const { getDate, whenTime } = await import('../utilities/helpers')
    const item = { cmsSource: 'publisher', displayDate: '2026-10-01', publicationDate: '2026-10-01T08:39:00Z' }
    for (const now of ['2026-10-01T12:00:00Z', '2026-10-01T18:00:00Z']) {
      freeze(now)
      expect(getStoryDetailDate(item, getDate, whenTime)).toBe(whenTime(new Date(item.publicationDate)))
      expect(getStoryDetailDate(item, getDate, whenTime)).not.toContain('in ')
    }
  })
  it('runs the real relative formatter and preserves existing newscast labels', async () => {
    freeze('2026-10-01T12:00:00Z')
    const { getDate, whenTime } = await import('../utilities/helpers')
    const item = { cmsSource: 'publisher', displayDate: '2026-10-01', publicationDate: '2026-10-01T11:00:00Z' }
    expect(getStoryDetailDate(item, getDate, whenTime)).toBe('1 hour ago')
    const saved = { cmsSource: 'publisher', meta: { firstPublishedAt: 'Thu, 01 Oct 2026 11:00:00 GMT' } }
    expect(getDate(saved)).toBe('1 hour ago')
    expect(getStoryDetailDate(saved, getDate, whenTime)).toBe('1 hour ago')
  })
  it('corrects an archive detail without changing cards, saved items or the player', async () => {
    freeze()
    const { getDate, whenTime } = await import('../utilities/helpers')
    const item = { cmsSource: 'publisher', displayDate: '1993-06-27', publicationDate: '2000-01-01T12:00:00Z', meta: { firstPublishedAt: '2000-01-01T12:00:00Z' } }
    expect(getStoryDetailDate(item, getDate, whenTime)).toBe('Jun 27, 1993')
    expect(getDate(item)).toBe(getDate({ ...item, displayDate: undefined }))
    expect(getDate({ cmsSource: 'publisher', meta: item.meta })).toBe(getDate(item))
  })
  it('falls back to the existing label for future airings, invalid or absent editorial dates', async () => {
    freeze()
    const { getDate, whenTime } = await import('../utilities/helpers')
    for (const displayDate of ['2026-10-02', 'invalid', '1900-01-01', undefined]) {
      const item = { cmsSource: 'publisher', displayDate, publicationDate: '2025-04-01T12:00:00Z' }
      expect(getStoryDetailDate(item, getDate, whenTime)).toBe('Apr 1, 2025')
    }
  })
  it('leaves other CMS sources unchanged, including local midnight behavior', async () => {
    freeze('2026-10-02T04:30:00Z')
    const { getDate, whenTime } = await import('../utilities/helpers')
    for (const cmsSource of ['wagtail', 'simplecast', 'npr']) {
      const item = { cmsSource, publicationDate: '2026-10-02T03:30:00Z' }
      expect(getStoryDetailDate(item, getDate, whenTime)).toBe(getDate(item, 'LLL d'))
    }
  })
  it('does not invent a date for an undated Publisher story', async () => {
    freeze()
    const { getDate, whenTime } = await import('../utilities/helpers')
    expect(getStoryDetailDate({ cmsSource: 'publisher' }, getDate)).toBeNull()
  })
})

describe('detail-only clock and calendar decisions', () => {
  const releaseLabel = () => 'legacy'
  it('uses Eastern wall time for an actual offsetless release', () => {
    freeze('2026-10-01T14:00:00Z')
    const relative = vi.fn(() => '1 hour ago')
    expect(getStoryDetailDate({ cmsSource: 'publisher', displayDate: '2026-10-01', releaseDateTime: '2026-10-01T09:00:00', publicationDate: '2000-01-01T00:00:00' }, releaseLabel, relative)).toBe('1 hour ago')
    expect(relative).toHaveBeenCalledWith(new Date('2026-10-01T13:00:00Z'))
  })
  it('does not replace a release label with a later-today airing', () => {
    freeze()
    expect(getStoryDetailDate({ cmsSource: 'publisher', displayDate: '2026-10-01', displayDateTime: '2026-10-01T18:00:00-04:00', releaseDateTime: '2025-04-01T09:00:00' }, releaseLabel)).toBe('Apr 1, 2025')
  })
  it('preserves future-release relative time over an old draft display date', () => {
    freeze()
    const relative = vi.fn(() => 'in 1 hour')
    expect(getStoryDetailDate({ cmsSource: 'publisher', displayDate: '2025-04-01', releaseDateTime: '2026-10-01T15:00:00Z' }, releaseLabel, relative)).toBe('in 1 hour')
    expect(relative).toHaveBeenCalledWith(new Date('2026-10-01T15:00:00Z'))
  })
  it('uses Eastern year boundaries consistently', () => {
    freeze('2026-01-01T00:30:00Z')
    expect(getStoryDetailDate({ cmsSource: 'publisher', displayDate: '2025-12-30' }, releaseLabel)).toBe('Dec 30')
    expect(getStoryDetailDate({ cmsSource: 'publisher', displayDate: '2024-12-30' }, releaseLabel)).toBe('Dec 30, 2024')
  })
  it.each(['1900-01-01T00:00:00', '1900-01-01T00:00:00Z', 'invalid'])('does not invent a release for %s', publicationDate => {
    freeze()
    expect(getStoryDetailDate({ cmsSource: 'publisher', publicationDate }, releaseLabel)).toBeNull()
  })
  it('keeps valid dates later in 1900', () => {
    freeze()
    expect(getStoryDetailDate({ cmsSource: 'publisher', displayDate: undefined, publicationDate: '1900-02-01T00:00:00' }, releaseLabel)).toBe('Feb 1, 1900')
  })
  it('pads early years and retains the calendar era', async () => {
    const { getPublisherCalendarDay } = await import('../utilities/publisherDate')
    expect(getPublisherCalendarDay(new Date('0001-06-01T12:00:00Z'))).toBe('0001-06-01')
    expect(getPublisherCalendarDay(new Date('0001-01-01T00:00:00Z'))).toBe('0000-12-31')
  })
})

describe('story detail date separator', () => {
  it('renders the actual EpisodeTemplate date markup without a pipe when undated', async () => {
    const { readFileSync } = await import('node:fs')
    const { compile, defineComponent, h } = await import('vue')
    const { renderToString } = await import('vue/server-renderer')
    // Compile the real template directly to avoid unrelated global SCSS setup.
    const pipeSource = readFileSync('components/PipeData.vue', 'utf8')
    const pipeTemplate = pipeSource.match(/<template>([\s\S]*?)<\/template>/)?.[1]
    expect(pipeTemplate).toBeDefined()
    const PipeData = defineComponent({
      props: ['hidePipe', 'fullWidth'],
      setup: props => ({ props }),
      render: compile(pipeTemplate ?? ''),
    })
    const source = readFileSync('components/EpisodeTemplate.vue', 'utf8')
    const markup = source.match(/<PipeData class="text-sm"[\s\S]*?<\/PipeData>/)?.[0]
    expect(markup).toBeDefined()
    const render = compile(markup ?? '')
    for (const displayDate of [undefined, '1993-06-27']) {
      const episodeData = { cmsSource: 'publisher', displayDate }
      const component = defineComponent({
        components: { PipeData }, render,
        setup: () => ({ props: { episodeData }, storySource: 'WNYC', storyDateLabel: getStoryDetailDate(episodeData, () => null) }),
      })
      const html = await renderToString(h(component))
      expect(html.includes('|')).toBe(Boolean(displayDate))
      if (displayDate) expect(html).toContain('Jun 27, 1993')
    }
  })
})
