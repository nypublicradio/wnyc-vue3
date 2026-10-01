import { beforeAll, describe, expect, it, vi } from 'vitest'
import { getStoryDetailDate } from '../../utilities/storyDate'
import { normalizePublisherListItem, normalizePublisherPage } from '../../composables/data/articlePages'

vi.mock('~/utilities/helpers', () => ({ getWagtailRawBody: vi.fn() }))
vi.mock('~/server/utils/duration', () => ({ estimateMp3Duration: vi.fn() }))
vi.mock('~/composables/states', () => ({ useIsApp: () => ({ value: false }) }))

beforeAll(() => {
  vi.stubGlobal('defineNuxtPlugin', (plugin) => plugin)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { BFF_URL: 'http://localhost:3000' } }))
})

const story = (newsdate?: string | null) => ({
  id: '799882',
  type: 'story',
  attributes: {
    title: 'Robert Kiley',
    slug: 'robert-kiley',
    itemType: 'article',
    estimatedDuration: 60,
    appearances: { authors: [] },
    publishAt: '2000-01-01T05:00:00Z',
    newsdate,
  },
})

describe.each([
  ['detail', normalizePublisherPage],
  ['list item', normalizePublisherListItem],
] as const)('Publisher %s display date', (_, normalize) => {
  it('adds a detail-only editorial date and preserves release timestamps', async () => {
    const result = await normalize(story('1993-06-27T00:00:00-04:00'))
    expect(result.displayDate).toBe(normalize === normalizePublisherPage ? '1993-06-27' : undefined)
    expect(result.publicationDate).toEqual(new Date('2000-01-01T05:00:00Z'))
    // Preserve the legacy release timestamp for installed apps and analytics.
    expect(result.meta.firstPublishedAt).toEqual(result.publicationDate)
    expect(result.meta.slug).toBe('robert-kiley')
    if (normalize === normalizePublisherPage) expect(getStoryDetailDate(result, () => 'release')).toBe('Jun 27, 1993')
    if (normalize === normalizePublisherPage) expect(result.sortDate).toBe('2000-01-01T05:00:00Z')
  })

  it('formats a serialized response with the real frontend date helpers', async () => {
    const { getDate } = await vi.importActual<typeof import('../../utilities/helpers')>('~/utilities/helpers')
    const result = JSON.parse(JSON.stringify(await normalize(story('1993-06-27T00:00:00-04:00'))))
    const detailLabel = getStoryDetailDate(result, getDate)
    expect(detailLabel).toBe(normalize === normalizePublisherPage ? 'Jun 27, 1993' : getDate(result, 'LLL d'))
    // Legacy consumers ignore the additive field and get exactly their old label.
    expect(getDate(result)).toBe(getDate({ ...result, displayDate: undefined }))
  })

  it('preserves legacy parsing of offsetless release timestamps', async () => {
    const data = story('1993-06-27')
    data.attributes.publishAt = '2000-01-01T00:00:00'
    const result = await normalize(data)
    expect(result.publicationDate).toEqual(new Date(data.attributes.publishAt))
    expect(result.meta.firstPublishedAt).toEqual(result.publicationDate)
  })

  it.each([undefined, null, '', 'Episode 12', '1900-01-01T00:00:00Z', '2026-02-30'])('falls back to publishAt when newsdate is %s', async (newsdate) => {
    const result = await normalize(story(newsdate))
    expect(result.publicationDate).toEqual(new Date('2000-01-01T05:00:00Z'))
    expect(result.meta.firstPublishedAt).toEqual(result.publicationDate)
  })

  it('falls back when the editorial date is malformed', async () => {
    const result = await normalize(story('not-a-date'))
    expect(result.publicationDate).toEqual(new Date('2000-01-01T05:00:00Z'))
    expect(result.displayDate).toBeUndefined()
  })

  it('does not invent a date when both dates are absent', async () => {
    const data = story()
    Reflect.deleteProperty(data.attributes, 'publishAt')
    const result = await normalize(data)
    expect(result.publicationDate).toBeUndefined()
    expect(result.meta.firstPublishedAt).toBeUndefined()
    expect(getStoryDetailDate(result, () => 'release')).toBeNull()
  })
})

// Curated overrides remain scoped to their list item; story details use CMS editorial dates.
describe('curated date overrides', () => {
  it('preserves a curated override even when the content has a different publication date', async () => {
    const { transformCuratedContent } = await import('../../utilities/curatedContent')
    const [block] = await transformCuratedContent([{
      type: 'curated_list',
      value: { list: { listItems: [{
        contentType: 'card',
        title: 'Robert Kiley',
        publicationDate: '1993-06-27T12:00:00',
        content: { publicationDate: '2000-01-01T00:00:00' },
      }] } },
    }])
    expect(block.value.list.listItems[0].publicationDate).toEqual(new Date('1993-06-27T12:00:00'))
  })
})
