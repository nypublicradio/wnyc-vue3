import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.fn()
const axiosHeadMock = vi.fn()
axiosMock.head = axiosHeadMock

vi.mock('axios', () => ({
  default: axiosMock,
}))

vi.mock('h3', () => ({
  createError: (options: any) => Object.assign(new Error(options.statusMessage), options),
}))

vi.mock('~/composables/globals', () => ({
  cmsSources: { PUBLISHER: 'publisher', WAGTAIL: 'wagtail', NPR: 'npr', SIMPLECAST: 'simplecast' },
  mediaTypeRoutes: {
    show: '/browse/shows/',
    story: '/story/',
  },
}))

vi.mock('~/composables/data/articlePages', () => ({
  normalizeArticlePage: vi.fn(async (page: any) => page),
  normalizePublisherPage: vi.fn((page: any) => page),
  normalizeWagtailPage: vi.fn((page: any) => page),
}))

vi.mock('~/utilities/curatedContent', () => ({
  transformCuratedContent: vi.fn(),
}))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.getQuery = (event: any) => event?.query || {}
// @ts-expect-error test-only global
globalThis.createError = (options: any) => Object.assign(new Error(options.statusMessage), options)
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => ({
  public: {
    AVIARY_BASE_API: 'https://cms.prod.nypr.digital/api/v2/',
    PUBLISHER_BASE_API: 'https://publisher.test/api/',
    cmsSite: 'wnyc.org:443',
  },
})

describe('CMS route redirects', () => {
  beforeEach(() => {
    vi.resetModules()
    axiosMock.mockReset()
    axiosHeadMock.mockReset()
  })

  it('returns Aviary redirect metadata for missing Publisher stories under /story', async () => {
    const redirectLocation = '/story/new-story/'

    axiosMock.mockRejectedValue({ response: { status: 404 } })
    axiosHeadMock.mockImplementation(async (url: string) => {
      if (url === 'https://cms.prod.nypr.digital/story/old-story') {
        return {
          status: 301,
          headers: {
            location: redirectLocation,
          },
        }
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const handler = (await import('../../server/api/story/[cmsSource]/[storyId]')).default
    const event: any = {
      context: { params: { cmsSource: 'publisher', storyId: 'old-story' } },
    }

    await expect(handler(event)).resolves.toEqual({
      redirect: true,
      location: redirectLocation,
      statusCode: 301,
    })

    expect(axiosHeadMock).toHaveBeenCalledWith(
      'https://cms.prod.nypr.digital/story/old-story',
      expect.objectContaining({
        maxRedirects: 0,
        headers: expect.objectContaining({
          'Accept-Encoding': 'identity',
          'X-CMS-Site': 'wnyc.org:443',
        }),
      }),
    )
  })

  it('returns Aviary redirect metadata for missing Wagtail show pages under /shows', async () => {
    const redirectLocation = '/shows/new-show/'

    axiosMock.mockRejectedValue({ response: { status: 404 } })
    axiosHeadMock.mockImplementation(async (url: string) => {
      if (url === 'https://cms.prod.nypr.digital/browse/shows/old-show') {
        return { status: 404 }
      }

      if (url === 'https://cms.prod.nypr.digital/shows/old-show') {
        return {
          status: 301,
          headers: {
            location: redirectLocation,
          },
        }
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const handler = (await import('../../server/api/pages/[cmsSource]/[pageSlug]')).default
    const event: any = {
      context: { params: { cmsSource: 'wagtail', pageSlug: 'old-show' } },
    }

    await expect(handler(event)).resolves.toEqual({
      redirect: true,
      location: redirectLocation,
      statusCode: 301,
    })

    expect(axiosHeadMock).toHaveBeenNthCalledWith(
      2,
      'https://cms.prod.nypr.digital/shows/old-show',
      expect.objectContaining({
        maxRedirects: 0,
        headers: expect.objectContaining({
          'Accept-Encoding': 'identity',
          'X-CMS-Site': 'wnyc.org:443',
        }),
      }),
    )
  })
})
