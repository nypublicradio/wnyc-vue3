import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.fn()
vi.mock('axios', () => ({ default: axiosMock }))

vi.mock('~/composables/useVImage', () => ({
  useVImage: () => ({
    templatizeImageUrl: (url: string) => url,
  }),
}))

vi.mock('~/composables/globals', () => ({
  cmsSources: { PUBLISHER: 'publisher', WAGTAIL: 'wagtail', NPR: 'npr', SIMPLECAST: 'simplecast' },
  mediaTypes: {
    LIVE: 'live',
    SIMPLECAST: 'simplecast',
    SHOW: 'show',
    EVENT: 'event',
    EPISODE: 'episode',
    FULL: 'full',
    SEGMENT: 'segment',
    STORY: 'story',
    ARTICLE_PAGE: 'article_page',
    ARTICLE: 'article',
    NPR_EPISODE: 'npr_episode',
    NPR_ARTICLE: 'npr_article',
    CARD: 'card',
  },
  mediaTypeRoutes: {
    show: '/browse/shows/',
    simplecast: '/browse/shows/episode/simplecast/',
  },
  FALLBACKIMAGE: '/fallback/wnyc.webp',
  FALLBACKIMAGEEP: '/fallback/ep.webp',
  NPRIMAGEDOMAINSOURCES: [],
  WAGTAILIMAGEDOMAINSOURCES: [],
}))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.getQuery = (event: any) => event?.query || {}
// @ts-expect-error test-only global
globalThis.createError = (input: any) => Object.assign(new Error(input.statusMessage), input)
// @ts-expect-error test-only global
globalThis.__testRuntimeConfig = {
  public: {
    AVIARY_BASE_API: 'https://example.test/api/v2/',
    cmsSite: 'demo.wnyc.org:443',
  },
}
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => globalThis.__testRuntimeConfig

const showResponse = {
  data: {
    items: [
      {
        id: 10,
        title: 'Test Show',
        meta: { type: 'shows.ShowPage', slug: 'test-show' },
        description: 'A show about tests.',
        show_art: { file: 'https://example.test/show.jpg' },
        about_module: [{ type: 'rich_text', value: '<p>About Test Show.</p>' }],
        can_download_episodes: true,
        can_embed_episodes: true,
      },
    ],
  },
}

const seriesResponse = {
  data: {
    id: 20,
    title: 'Climate Series',
    meta: {
      type: 'shows.SeriesPage',
      slug: 'climate-series',
      seo_title: 'Climate Desk',
      search_description: 'CMS search description.',
      html_url: 'https://www.wnyc.org/browse/shows/test-show/climate-series/',
    },
    prevent_search_indexing: true,
    social_title: 'Climate Desk Social',
    social_text: 'CMS social description.',
    social_image: { file: 'https://example.test/social.jpg' },
    body: [
      {
        id: 'paragraph-1',
        type: 'paragraph',
        value: 'Series explainer body.',
      },
      {
        id: 'curated-block-1',
        type: 'curated_list',
        value: {
          label: 'Featured',
          layout: 'river',
          list: {
            id: 1,
            title: 'Featured Cards',
            list_items: [
              {
                id: 'card-1',
                content_type: 'card',
                title: 'First Card',
                subtitle: 'First tease',
                body: '<p>First body.</p>',
                url: 'https://example.test/first',
              },
              {
                id: 'card-2',
                content_type: 'card',
                title: 'Second Card',
                subtitle: 'Second tease',
                body: '<p>Second body.</p>',
                url: 'https://example.test/second',
              },
            ],
          },
        },
      },
    ],
  },
}

const defaultSeriesResponse = {
  data: {
    id: 21,
    title: 'Default Series',
    meta: {
      type: 'shows.SeriesPage',
      slug: 'default-series',
    },
    body: [],
  },
}

const setupAxios = (seriesData = seriesResponse) => {
  axiosMock.mockImplementation((options: any) => {
    if (options.url.endsWith('pages/')) {
      return Promise.resolve(showResponse)
    }

    if (options.url.endsWith('pages/find/')) {
      return Promise.resolve(seriesData)
    }

    throw new Error(`Unexpected URL: ${options.url}`)
  })
}

describe('server/api/v3/show/[showslug]/series/[seriesSlug]', () => {
  beforeEach(() => {
    axiosMock.mockReset()
  })

  it('fetches the Wagtail series path, related show, metadata, and transformed body', async () => {
    setupAxios()
    const handler = (await import('../../server/api/v3/show/[showslug]/series/[seriesSlug]')).default
    const setHeader = vi.fn()
    const event: any = {
      context: { params: { showslug: 'test-show', seriesSlug: 'climate-series' } },
      query: { offset: 0, limit: 1 },
      node: { res: { setHeader } },
    }

    const result = await handler(event) as any
    const seriesCall = axiosMock.mock.calls.find(([options]) => options.url.endsWith('pages/find/'))?.[0]
    const showCall = axiosMock.mock.calls.find(([options]) => options.url.endsWith('pages/'))?.[0]

    expect(showCall.params.slug).toBe('test-show')
    expect(seriesCall.params.html_path).toBe('/browse/shows/test-show/climate-series/')
    expect(showCall.headers['Accept-Encoding']).toBe('identity')
    expect(seriesCall.headers['X-CMS-Site']).toBe('demo.wnyc.org:443')
    expect(seriesCall.headers['Accept-Encoding']).toBe('identity')
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=3600, stale-while-revalidate')

    expect(result.show.title).toBe('Test Show')
    expect(result.series.title).toBe('Climate Series')
    expect(result.series.seoTitle).toBe('Climate Desk')
    expect(result.series.searchDescription).toBe('CMS search description.')
    expect(result.series.socialTitle).toBe('Climate Desk Social')
    expect(result.series.socialDescription).toBe('CMS social description.')
    expect(result.series.thumbnail).toContain('social.jpg')
    expect(result.series.preventSearchIndexing).toBe(true)

    expect(result.body).toHaveLength(2)
    expect(result.body[0]).toMatchObject({
      id: 'paragraph-1',
      type: 'paragraph',
      value: 'Series explainer body.',
    })
    expect(result.body[1].type).toBe('curated_list')
    expect(result.body[1].value.layout).toBe('river')
    expect(result.body[1].value.list.listItems).toHaveLength(2)
    expect(result.body[1].value.list.listItems[0].title).toBe('First Card')
    expect(result.cards).toBeUndefined()
  })

  it('uses default metadata and the WNYC fallback thumbnail when promote fields are absent', async () => {
    setupAxios(defaultSeriesResponse)
    const handler = (await import('../../server/api/v3/show/[showslug]/series/[seriesSlug]')).default
    const event: any = {
      context: { params: { showslug: 'test-show', seriesSlug: 'default-series' } },
      query: {},
      node: { res: { setHeader: vi.fn() } },
    }

    const result = await handler(event) as any

    expect(result.series.seoTitle).toBe('Default Series')
    expect(result.series.searchDescription).toBe('See articles and episodes related to Default Series from Test Show.')
    expect(result.series.socialTitle).toBe('Default Series')
    expect(result.series.socialDescription).toBe('See articles and episodes related to Default Series from Test Show.')
    expect(result.series.thumbnail).toBe('/fallback/wnyc.webp')
    expect(result.series.preventSearchIndexing).toBe(false)
    expect(result.body).toEqual([])
  })

  it('throws a 404 when Wagtail cannot find the series page', async () => {
    axiosMock.mockImplementation((options: any) => {
      if (options.url.endsWith('pages/')) {
        return Promise.resolve(showResponse)
      }

      return Promise.reject({ response: { status: 404 } })
    })

    const handler = (await import('../../server/api/v3/show/[showslug]/series/[seriesSlug]')).default
    const event: any = {
      context: { params: { showslug: 'test-show', seriesSlug: 'missing-series' } },
      query: {},
      node: { res: { setHeader: vi.fn() } },
    }

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Series not found: test-show/missing-series',
    })
  })
})
