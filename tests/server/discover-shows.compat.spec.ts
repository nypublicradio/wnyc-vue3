import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.fn()

vi.mock('axios', () => ({
  default: axiosMock,
}))

vi.mock('~/server/utils/supabaseClient', () => ({
  supabaseClient: vi.fn(() => ({})),
}))

vi.mock('~/server/utils/nyprdb', () => ({
  NyprDb: vi.fn(() => ({
    getNPRShows: vi.fn(() => []),
  })),
}))

vi.mock('~/server/utils/npr', () => ({
  NPR: vi.fn(() => ({
    findImageUrl: vi.fn(() => ''),
  })),
}))

let currentQuery: Record<string, any> = {}

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.getQuery = () => currentQuery
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => (globalThis as any).__testRuntimeConfig

const legacyPublisherShows = [
  {
    producingOrganizations: [],
    title: 'All Of It with Alison Stewart',
    image: {
      altText: 'All of It with Alison Stewart',
      name: '2020/06/AllOfIt.png',
      source: null,
      url: 'https://media.wnyc.org/i/1400/1400/l/80/2020/06/AllOfIt.png',
      h: 1400,
      isDisplay: true,
      crop: 'l',
      caption: 'All of It with Alison Stewart',
      creditsUrl: '',
      template: 'https://media.wnyc.org/i/%s/%s/%s/%s/2020/06/AllOfIt.png',
      w: 1400,
      id: 190372,
      creditsName: 'WNYC',
    },
    list_api_url: '/api/list/stories/all-of-it/',
    pk: 882225,
    type: 'show',
    slug: 'all-of-it',
  },
  {
    producingOrganizations: [{ name: 'WNYC Studios' }],
    title: 'On the Media',
    image: {
      url: 'https://media.wnyc.org/i/500/500/c/80/1/onthemedia.png',
    },
    list_api_url: '/api/list/stories/otm/',
    pk: 398,
    type: 'show',
    slug: 'otm',
  },
]

describe('legacy /api/v2/discover/shows compatibility', () => {
  beforeEach(() => {
    vi.resetModules()
    currentQuery = {}
    axiosMock.mockReset()
    axiosMock.mockResolvedValue({ data: legacyPublisherShows })
    ;(globalThis as any).__testRuntimeConfig = {
      public: {
        PUBLISHER_BASE_API: 'https://api.wnyc.org/api/',
      },
    }
  })

  it('passes through the surviving Publisher legacy discover shows response', async () => {
    currentQuery = {
      discover_station: 'wnyc-vue3-app-featured',
      api_key: 'spotlight',
      browser_id: 'test-browser',
    }

    const handler = (await import('../../server/api/v2/discover/shows')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)

    expect(result).toBe(legacyPublisherShows)
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).not.toHaveProperty('description')
    expect(result[0]).not.toHaveProperty('id')
    expect(result[0].image).toHaveProperty('altText')
    expect(result[0].image).toHaveProperty('isDisplay')
    expect(axiosMock).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.wnyc.org/api/v1/discover/shows/',
      params: currentQuery,
      timeout: 10000,
    })
    expect(event.node.res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'max-age=3600, stale-while-revalidate'
    )
  })

  it('forwards topic query params without local filtering or reshaping', async () => {
    currentQuery = {
      discover_station: 'wnyc-vue3-app-techmedia',
      api_key: 'otm',
    }

    const handler = (await import('../../server/api/v2/discover/shows')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)

    expect(result).toBe(legacyPublisherShows)
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          discover_station: 'wnyc-vue3-app-techmedia',
          api_key: 'otm',
        },
      })
    )
  })

  it('uses the Publisher discover passthrough for the app featured shows endpoint', async () => {
    axiosMock.mockImplementation(async (options) => {
      if (options.url === 'https://api.wnyc.org/api/v1/list/shows-for-app/') {
        return {
          data: {
            results: [
              {
                id: 123,
                title: 'All Of It with Alison Stewart',
                slug: 'all-of-it',
                description: 'removed by the route',
                image: {
                  url: 'https://media.wnyc.org/i/raw/2020/06/AllOfIt.png',
                },
              },
            ],
          },
        }
      }

      return { data: legacyPublisherShows }
    })

    const handler = (await import('../../server/api/v2/shows')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)

    expect(result.featuredShows[0].title).toBe('All Of It with Alison Stewart')
    expect(result.featuredShows[0].listApiUrl).toBe('/api/list/stories/all-of-it/')
    expect(axiosMock).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.wnyc.org/api/v1/discover/shows/',
      params: {
        discover_station: 'wnyc-vue3-app-featured',
        api_key: 'spotlight',
      },
      timeout: 10000,
    })
  })

  it('uses the Publisher discover passthrough for browse topic data', async () => {
    currentQuery = {
      topic: 'tech-and-media',
    }

    const handler = (await import('../../server/api/browse/browse-topic/getTopicData')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)

    expect(result[0].listApiUrl).toBe('/api/list/stories/all-of-it/')
    expect(axiosMock).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.wnyc.org/api/v1/discover/shows/',
      params: {
        discover_station: 'wnyc-vue3-app-techmedia',
        api_key: 'otm',
      },
      timeout: 10000,
    })
  })
})
