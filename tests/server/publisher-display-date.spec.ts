import { beforeAll, describe, expect, it, vi } from 'vitest'
import { getStoryDate } from '../../utilities/storyDate'
import { normalizePublisherListItem, normalizePublisherPage } from '../../composables/data/articlePages'

vi.mock('~/utilities/helpers', () => ({ getWagtailRawBody: vi.fn() }))
vi.mock('~/server/utils/duration', () => ({ estimateMp3Duration: vi.fn() }))
vi.mock('~/composables/states', () => ({ useIsApp: () => ({ value: false }) }))

beforeAll(() => {
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
    publishAt: '2000-01-01T00:00:00',
    newsdate,
  },
})

describe.each([
  ['detail', normalizePublisherPage],
  ['list item', normalizePublisherListItem],
] as const)('Publisher %s display date', (_, normalize) => {
  it('uses the editorial archive date instead of the release timestamp', async () => {
    const result = await normalize(story('1993-06-27T00:00:00-04:00'))
    expect(result.publicationDate).toEqual(new Date('1993-06-27T04:00:00Z'))
    // The header and saved/history records read this metadata field first.
    expect(result.meta.firstPublishedAt).toEqual(result.publicationDate)
    expect(result.meta.slug).toBe('robert-kiley')
    expect(getStoryDate(result, 'LLL d', () => 'today')).toBe('Jun 27, 1993')
    if (normalize === normalizePublisherPage) expect(result.sortDate).toBe('2000-01-01T00:00:00')
  })

  it.each([undefined, null, ''])('falls back to publishAt when newsdate is %s', async (newsdate) => {
    const result = await normalize(story(newsdate))
    expect(result.publicationDate).toEqual(new Date('2000-01-01T05:00:00Z'))
    expect(result.meta.firstPublishedAt).toEqual(result.publicationDate)
  })

  it('falls back when the editorial date is malformed', async () => {
    const result = await normalize(story('not-a-date'))
    expect(result.publicationDate).toEqual(new Date('2000-01-01T05:00:00Z'))
    expect(getStoryDate(result, 'LLL d', () => 'today')).toBe('Jan 1, 2000')
  })

  it('does not invent a date when both dates are absent', async () => {
    const data = story()
    Reflect.deleteProperty(data.attributes, 'publishAt')
    const result = await normalize(data)
    expect(result.publicationDate).toBeUndefined()
    expect(result.meta.firstPublishedAt).toBeUndefined()
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
