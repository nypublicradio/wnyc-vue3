import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.fn()

vi.mock('axios', () => ({
  default: axiosMock,
}))

let currentQuery: Record<string, any> = {}

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.getQuery = () => currentQuery

const publisherShowResponse = {
  data: {
    data: [
      {
        id: '882225',
        type: 'show',
        attributes: {
          slug: 'all-of-it',
          title: 'All Of It with Alison Stewart',
          description: '<p>All Of It description.</p>',
          url: 'https://www.wnyc.org/shows/all-of-it',
        },
        relationships: {
          image: {
            data: { type: 'image', id: '190372' },
          },
          'producing-organizations': {
            data: [],
          },
        },
      },
      {
        id: '398',
        type: 'show',
        attributes: {
          slug: 'otm',
          title: 'On the Media',
          description: '<p>On the Media description.</p>',
          url: 'https://www.wnyc.org/shows/otm',
        },
        relationships: {
          image: {
            data: { type: 'image', id: '103448' },
          },
          'producing-organizations': {
            data: [{ type: 'producing-organization', id: '332' }],
          },
        },
      },
    ],
    included: [
      {
        type: 'image',
        id: '190372',
        attributes: {
          url: 'https://media.wnyc.org/i/1400/1400/l/80/2020/06/AllOfIt.png',
          template: 'https://media.wnyc.org/i/%s/%s/%s/%s/2020/06/AllOfIt.png',
        },
      },
      {
        type: 'image',
        id: '103448',
        attributes: {
          url: 'https://media.wnyc.org/i/500/500/c/80/1/onthemedia.png',
          template: 'https://media.wnyc.org/i/%s/%s/%s/%s/1/onthemedia.png',
        },
      },
      {
        type: 'producing-organization',
        id: '332',
        attributes: {
          name: 'WNYC Studios',
          url: 'https://www.wnycstudios.org/',
        },
      },
    ],
  },
}

describe('legacy /api/v2/discover/shows compatibility', () => {
  beforeEach(() => {
    vi.resetModules()
    currentQuery = {}
    axiosMock.mockReset()
    axiosMock.mockResolvedValue(publisherShowResponse)
    ;(globalThis as any).__testRuntimeConfig = {
      public: {
        PUBLISHER_BASE_API: 'https://api.wnyc.org/api/',
      },
    }
  })

  it('returns the Publisher-backed legacy top-level array for spotlight app requests', async () => {
    currentQuery = {
      discover_station: 'wnyc-vue3-app-featured',
      api_key: 'spotlight',
    }

    const handler = (await import('../../server/api/v2/discover/shows')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)

    expect(result).toEqual([
      {
        id: 882225,
        pk: 882225,
        title: 'All Of It with Alison Stewart',
        description: '<p>All Of It description.</p>',
        slug: 'all-of-it',
        type: 'show',
        image: {
          url: 'https://media.wnyc.org/i/1400/1400/l/80/2020/06/AllOfIt.png',
          template: 'https://media.wnyc.org/i/%s/%s/%s/%s/2020/06/AllOfIt.png',
        },
        list_api_url: 'https://api.wnyc.org/api/v3/story/?show=all-of-it',
        producingOrganizations: [],
        producing_organizations: [],
        url: 'https://www.wnyc.org/shows/all-of-it',
      },
      expect.objectContaining({
        id: 398,
        slug: 'otm',
        title: 'On the Media',
        producingOrganizations: [{ name: 'WNYC Studios', url: 'https://www.wnycstudios.org/' }],
      }),
    ])
    expect(Array.isArray(result)).toBe(true)
    expect(axiosMock).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.wnyc.org/api/v3/shows/',
      params: {
        discover_station: 'wnyc-vue3-app-featured',
        api_key: 'spotlight',
      },
      timeout: 10000,
    })
    expect(event.node.res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'max-age=3600, stale-while-revalidate'
    )
  })

  it('forwards known topic requests to Publisher so the DiscoverStation whitelist controls membership and order', async () => {
    currentQuery = {
      discover_station: 'wnyc-vue3-app-techmedia',
      api_key: 'otm',
    }

    const handler = (await import('../../server/api/v2/discover/shows')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)

    expect(result.map((show: any) => show.slug)).toEqual(['all-of-it', 'otm'])
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          discover_station: 'wnyc-vue3-app-techmedia',
          api_key: 'otm',
        },
      })
    )
  })
})
