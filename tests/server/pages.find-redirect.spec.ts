import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosGetMock = vi.fn()

vi.mock('axios', () => ({
  default: {
    get: axiosGetMock,
  },
}))

vi.mock('h3', () => ({
  getQuery: (event: any) => event?.query || {},
  createError: (options: any) => Object.assign(new Error(options.statusMessage), options),
}))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => ({
  public: {
    AVIARY_BASE_API: 'https://cms.prod.nypr.digital/api/v2/',
    cmsSite: 'wnyc.org:443',
  },
})

describe('server/api/pages/[cmsSource]/find Wagtail redirects', () => {
  beforeEach(() => {
    axiosGetMock.mockReset()
  })

  it('returns redirect metadata when a path is only present as a CMS redirect', async () => {
    const redirectLocation = 'https://pledge.wnyc.org/support/wnyc-lapsed?cid=7015f000000m2aWAAQ'

    axiosGetMock.mockImplementation(async (url: string) => {
      if (url === 'https://cms.prod.nypr.digital/api/v2/pages/find/') {
        return { status: 404 }
      }

      if (url === 'https://cms.prod.nypr.digital/rejoin') {
        return {
          status: 301,
          headers: {
            location: redirectLocation,
          },
        }
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const handler = (await import('../../server/api/pages/[cmsSource]/find')).default
    const event: any = {
      query: {
        html_path: '/rejoin',
      },
    }

    await expect(handler(event)).resolves.toEqual({
      redirect: true,
      location: redirectLocation,
      statusCode: 301,
    })

    expect(axiosGetMock).toHaveBeenNthCalledWith(
      2,
      'https://cms.prod.nypr.digital/rejoin',
      expect.objectContaining({
        maxRedirects: 0,
        headers: expect.objectContaining({
          'X-CMS-Site': 'wnyc.org:443',
        }),
      }),
    )
  })

  it('follows CMS slash normalization before returning the real redirect', async () => {
    const redirectLocation = 'https://pledge.wnyc.org/support/wnyc-lapsed?cid=7015f000000m2aWAAQ'

    axiosGetMock.mockImplementation(async (url: string) => {
      if (url === 'https://cms.prod.nypr.digital/api/v2/pages/find/') {
        return { status: 404 }
      }

      if (url === 'https://cms.prod.nypr.digital/rejoin') {
        return {
          status: 301,
          headers: {
            location: '/rejoin/',
          },
        }
      }

      if (url === 'https://cms.prod.nypr.digital/rejoin/') {
        return {
          status: 301,
          headers: {
            location: redirectLocation,
          },
        }
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const handler = (await import('../../server/api/pages/[cmsSource]/find')).default
    const event: any = {
      query: {
        html_path: '/rejoin',
      },
    }

    await expect(handler(event)).resolves.toEqual({
      redirect: true,
      location: redirectLocation,
      statusCode: 301,
    })

    expect(axiosGetMock).toHaveBeenNthCalledWith(
      3,
      'https://cms.prod.nypr.digital/rejoin/',
      expect.objectContaining({
        maxRedirects: 0,
        headers: expect.objectContaining({
          'X-CMS-Site': 'wnyc.org:443',
        }),
      }),
    )
  })

  it('returns a real relative CMS redirect instead of following it as normalization', async () => {
    axiosGetMock.mockImplementation(async (url: string) => {
      if (url === 'https://cms.prod.nypr.digital/api/v2/pages/find/') {
        return { status: 404 }
      }

      if (url === 'https://cms.prod.nypr.digital/old-page') {
        return {
          status: 301,
          headers: {
            location: '/new-page/',
          },
        }
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const handler = (await import('../../server/api/pages/[cmsSource]/find')).default
    const event: any = {
      query: {
        html_path: '/old-page',
      },
    }

    await expect(handler(event)).resolves.toEqual({
      redirect: true,
      location: '/new-page/',
      statusCode: 301,
    })

    expect(axiosGetMock).toHaveBeenCalledTimes(2)
  })
})
