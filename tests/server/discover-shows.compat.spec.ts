import { beforeEach, describe, expect, it, vi } from 'vitest'

const getShowsMock = vi.fn()
const getFeaturedShowsMock = vi.fn()

vi.mock('~/server/api/v3/shows', () => ({
  getShows: getShowsMock,
  getFeaturedShows: getFeaturedShowsMock,
}))

let currentQuery: Record<string, any> = {}

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.getQuery = () => currentQuery

const allShows = [
  { title: 'All Of It', slug: 'all-of-it' },
  { title: 'On the Media', slug: 'on-the-media' },
  { title: 'Radiolab', slug: 'radiolab' },
  { title: 'Science Friday', slug: 'science-friday' },
  { title: 'WNYC News', slug: 'wnyc-news' },
]

const featuredShows = [
  { title: 'All Of It', slug: 'all-of-it' },
  { title: 'WNYC News', slug: 'wnyc-news' },
]

describe('legacy /api/v2/discover/shows compatibility', () => {
  beforeEach(() => {
    vi.resetModules()
    currentQuery = {}
    getShowsMock.mockReset()
    getFeaturedShowsMock.mockReset()
    getShowsMock.mockResolvedValue(allShows)
    getFeaturedShowsMock.mockResolvedValue(featuredShows)
  })

  it('returns the old top-level featured array for spotlight app requests', async () => {
    currentQuery = {
      discover_station: 'wnyc-vue3-app-featured',
      api_key: 'spotlight',
    }

    const handler = (await import('../../server/api/v2/discover/shows')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)

    expect(result).toEqual(featuredShows)
    expect(Array.isArray(result)).toBe(true)
    expect(event.node.res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'max-age=3600, stale-while-revalidate'
    )
  })

  it('filters known topic requests by legacy app api_key', async () => {
    currentQuery = {
      discover_station: 'wnyc-vue3-app-techmedia',
      api_key: 'otm',
    }

    const handler = (await import('../../server/api/v2/discover/shows')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)

    expect(result).toEqual([{ title: 'On the Media', slug: 'on-the-media' }])
  })
})
