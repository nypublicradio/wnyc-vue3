import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.hoisted(() => vi.fn())
vi.mock('axios', () => ({ default: axiosMock }))

vi.mock('~/composables/data/articlePages', () => ({
    normalizeSimplecastListItem: (episode: any) => Promise.resolve({ id: episode.id, title: episode.title }),
}))

vi.mock('~/composables/globals', () => ({
    cmsSources: { SIMPLECAST: 'simplecast' },
}))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.getQuery = (event: any) => event?.query || {}

globalThis.__testRuntimeConfig = {
    simplecastApiKey: 'test-key', // pragma: allowlist secret
    simplecastUrl: 'https://api.simplecast.test',
}
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => globalThis.__testRuntimeConfig

const podcastId = 'b99b6401-4efd-485f-b744-84da8d6c14f6'
const errorPodcastId = 'c88c7501-5fde-596e-c855-95eb5d7d25a7'

const makeEvent = (showslug?: string, query: Record<string, unknown> = {}) => {
    const res: any = { setHeader: vi.fn(), statusCode: 200 }
    return {
        event: { context: { params: { showslug } }, query, node: { res } },
        res,
    }
}

describe('server/api/v3/show/[showslug]/episodes', () => {
    beforeEach(() => {
        axiosMock.mockReset()
    })

    it('returns a cacheable 200 response on success', async () => {
        axiosMock.mockResolvedValue({
            data: { collection: [{ id: 'ep-1', title: 'Episode 1', podcast: { id: podcastId } }] },
        })

        const handler = (await import('../../server/api/v3/show/[showslug]/episodes')).default
        const { event, res } = makeEvent(podcastId)

        const result = await handler(event as any) as any

        expect(result.meta.error).toBeUndefined()
        expect(res.statusCode).toBe(200)
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=300, stale-while-revalidate=600')
    })

    it('marks the response as uncacheable when Simplecast errors out', async () => {
        axiosMock.mockRejectedValue({ message: 'boom', response: { status: 503, statusText: 'Service Unavailable' } })

        const handler = (await import('../../server/api/v3/show/[showslug]/episodes')).default
        const { event, res } = makeEvent(errorPodcastId)

        const result = await handler(event as any) as any

        expect(result.meta.error.status).toBe(503)
        expect(res.statusCode).toBe(503)
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
    })

    it('marks the response as uncacheable for an invalid podcast id', async () => {
        const handler = (await import('../../server/api/v3/show/[showslug]/episodes')).default
        const { event, res } = makeEvent('not-a-uuid')

        const result = await handler(event as any) as any

        expect(result.meta.error.status).toBe(400)
        expect(res.statusCode).toBe(400)
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
        expect(axiosMock).not.toHaveBeenCalled()
    })

    it('marks the response as uncacheable when the showslug param is missing', async () => {
        const handler = (await import('../../server/api/v3/show/[showslug]/episodes')).default
        const { event, res } = makeEvent()

        const result = await handler(event as any) as any

        expect(result.meta.error.status).toBe(400)
        expect(res.statusCode).toBe(400)
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
    })
})
