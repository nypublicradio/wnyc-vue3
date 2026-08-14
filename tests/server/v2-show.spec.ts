import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.hoisted(() => vi.fn())
vi.mock('axios', () => ({ default: axiosMock }))

vi.mock('~/composables/globals', () => ({
    cmsSources: { SIMPLECAST: 'simplecast', NPR: 'npr', PUBLISHER: 'publisher' },
    mediaTypes: { SHOW: 'show' },
    FALLBACKIMAGE: '/fallback/wnyc.webp',
}))

vi.mock('~/composables/data/articlePages', () => ({
    normalizeArticleListItem: async (item: any) => item,
}))

vi.mock('~/composables/useVImage', () => ({
    useVImage: () => ({ templatizeImageUrl: (url: string) => url }),
}))

vi.mock('~/server/utils/nyprdb', () => ({
    NyprDb: class {
        getNPRShowBySlug = vi.fn().mockResolvedValue([])
    },
}))

vi.mock('~/server/utils/supabaseClient', () => ({
    supabaseClient: () => ({}),
}))

vi.mock('~/server/utils/npr', () => ({
    NPR: class { },
}))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.getQuery = (event: any) => event?.query || {}
// @ts-expect-error test-only global
globalThis.__testRuntimeConfig = {
    simplecastApiKey: 'test-key', // pragma: allowlist secret
    simplecastUrl: 'https://api.simplecast.test',
    public: {},
}
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => globalThis.__testRuntimeConfig

const podcastId = 'b99b6401-4efd-485f-b744-84da8d6c14f6'

describe('server/api/v2/show/[showslug]', () => {
    beforeEach(() => {
        axiosMock.mockReset()
    })

    it('marks the response as uncacheable when the Simplecast show lookup fails', async () => {
        axiosMock.mockRejectedValue({ message: 'boom', response: { status: 503 } })

        const handler = (await import('../../server/api/v2/show/[showslug]')).default
        const setHeader = vi.fn()
        const res: any = { setHeader, statusCode: 200 }
        const event: any = { context: { params: { showslug: podcastId } }, query: {}, node: { res } }

        const result = await handler(event)

        expect(result).toBeNull()
        expect(res.statusCode).toBe(404)
        expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
    })

    it('returns the show with a cacheable header on success', async () => {
        axiosMock.mockResolvedValue({ data: { title: 'Test Show', site: { subdomain: 'test-show' } } })

        const handler = (await import('../../server/api/v2/show/[showslug]')).default
        const setHeader = vi.fn()
        const res: any = { setHeader, statusCode: 200 }
        const event: any = { context: { params: { showslug: podcastId } }, query: {}, node: { res } }

        const result = await handler(event) as any

        expect(result.show.title).toBe('Test Show')
        expect(res.statusCode).toBe(200)
        expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=3600, stale-while-revalidate')
    })
})
