import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.hoisted(() => vi.fn())
vi.mock('axios', () => ({ default: axiosMock }))

vi.mock('~/composables/globals', () => ({
    cmsSources: { SIMPLECAST: 'simplecast', NPR: 'npr', PUBLISHER: 'publisher' },
    FALLBACKIMAGE: '/fallback/wnyc.webp',
}))

vi.mock('~/composables/data/articlePages', () => ({
    normalizeArticlePage: async (item: any) => item,
}))

vi.mock('~/server/utils/nyprdb', () => ({
    NyprDb: class { },
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

const episodeId = 'b99b6401-4efd-485f-b744-84da8d6c14f6'

describe('server/api/v2/show/episode/[cmsSource]/[episodeslug]', () => {
    beforeEach(() => {
        axiosMock.mockReset()
    })

    it('marks the response as uncacheable when the Simplecast episode lookup fails', async () => {
        axiosMock.mockRejectedValue({ message: 'boom', response: { status: 503 } })

        const handler = (await import('../../server/api/v2/show/episode/[cmsSource]/[episodeslug]')).default
        const setHeader = vi.fn()
        const res: any = { setHeader, statusCode: 200 }
        const event: any = { context: { params: { episodeslug: episodeId, cmsSource: 'simplecast' } }, query: {}, node: { res } }

        const result = await handler(event)

        expect(result).toBeNull()
        expect(res.statusCode).toBe(502)
        expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
    })

    it('returns the episode data on success without altering the status code', async () => {
        axiosMock.mockResolvedValue({ data: { title: 'Test Episode', podcast: { id: episodeId } } })

        const handler = (await import('../../server/api/v2/show/episode/[cmsSource]/[episodeslug]')).default
        const setHeader = vi.fn()
        const res: any = { setHeader, statusCode: 200 }
        const event: any = { context: { params: { episodeslug: episodeId, cmsSource: 'simplecast' } }, query: {}, node: { res } }

        const result = await handler(event) as any

        expect(result.title).toBe('Test Episode')
        expect(res.statusCode).toBe(200)
    })
})
