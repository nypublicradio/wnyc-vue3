import { beforeEach, describe, expect, it, vi } from 'vitest'

const getFromNPR = vi.hoisted(() => vi.fn())

vi.mock('~/server/utils/npr', () => ({ NPR: class { getFromNPR = getFromNPR } }))
vi.mock('~/utilities/curatedContent', () => ({
    handleNprCdsItem: ({ content }: any) =>
        Promise.resolve(
            Object.values(content.assets ?? {}).some((a: any) => a.isRestrictedToAuthorizedOrgServiceIds) ? null : { id: content.id }
        ),
}))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.createError = (o: any) => Object.assign(new Error(o.statusMessage), o)
// @ts-expect-error test-only global
globalThis.getQuery = (event: any) => event?.query || {}

const makeEvent = (showid?: string, query: Record<string, unknown> = {}) => {
    const res: any = { setHeader: vi.fn(), statusCode: 200 }
    return { event: { context: { params: { showid } }, query, node: { res } }, res }
}

const docs = (n: number, start = 0) => Array.from({ length: n }, (_, i) => ({ id: `doc-${start + i}` }))

// Each test uses its own show id so the route's page cache can't leak between tests.
describe('server/api/v3/show/npr/[showid]/episodes', () => {
    beforeEach(() => {
        getFromNPR.mockReset()
    })

    it('queries the show\'s audio stories with limit and offset and reports hasMore on a full page', async () => {
        getFromNPR.mockResolvedValue({ data: { resources: docs(10) } })
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default
        const { event, res } = makeEvent('2', { offset: '10', limit: '10' })

        const result = await handler(event as any) as any

        expect(getFromNPR.mock.calls[0][1].params).toEqual({
            profileIds: 'story,has-audio',
            collectionIds: '2',
            sort: 'publishDateTime:desc',
            limit: 10,
            offset: 10,
        })
        expect(result.data).toHaveLength(10)
        expect(result.meta.hasMore).toBe(true)
        expect(result.meta.pagination.nextOffset).toBe(20)
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=300, stale-while-revalidate=600')
    })

    it('reports no more on a short page and skips restricted documents', async () => {
        const restricted = { id: 'r', assets: { a: { isRestrictedToAuthorizedOrgServiceIds: true } } }
        getFromNPR.mockResolvedValue({ data: { resources: [...docs(2), restricted] } })
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default
        const { event } = makeEvent('3')

        const result = await handler(event as any) as any

        expect(result.data.map((d: any) => d.id)).toEqual(['doc-0', 'doc-1'])
        expect(result.meta.hasMore).toBe(false)
    })

    it('still advances nextOffset when every document on a full page is restricted', async () => {
        const restricted = (i: number) => ({ id: `r-${i}`, assets: { a: { isRestrictedToAuthorizedOrgServiceIds: true } } })
        getFromNPR.mockResolvedValue({ data: { resources: Array.from({ length: 10 }, (_, i) => restricted(i)) } })
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default
        const { event } = makeEvent('4', { offset: '30' })

        const result = await handler(event as any) as any

        expect(result.data).toEqual([])
        expect(result.meta.hasMore).toBe(true)
        expect(result.meta.pagination.nextOffset).toBe(40)
    })

    it('trims the limit so offset + limit stays within the CDS cap of 2000', async () => {
        getFromNPR.mockResolvedValue({ data: { resources: docs(5) } })
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default
        const { event } = makeEvent('5', { offset: '1995', limit: '10' })

        const result = await handler(event as any) as any

        expect(getFromNPR.mock.calls[0][1].params).toMatchObject({ offset: 1995, limit: 5 })
        expect(result.meta.hasMore).toBe(false)
    })

    it('caps limit at 20 per page', async () => {
        getFromNPR.mockResolvedValue({ data: { resources: docs(20) } })
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default
        const { event } = makeEvent('6', { limit: '100' })

        await handler(event as any)

        expect(getFromNPR.mock.calls[0][1].params.limit).toBe(20)
    })

    it('does not call CDS once the offset is past the cap', async () => {
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default
        const { event } = makeEvent('7', { offset: '2000' })

        const result = await handler(event as any) as any

        expect(result.data).toEqual([])
        expect(getFromNPR).not.toHaveBeenCalled()
    })

    it('throws a 502 when CDS fails (getFromNPR returns undefined)', async () => {
        // mockReset() in beforeEach leaves getFromNPR returning undefined
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default
        const { event } = makeEvent('8')

        await expect(handler(event as any)).rejects.toMatchObject({ statusCode: 502 })
    })

    it('returns 400 for a show id that is not a numeric collection id', async () => {
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default

        for (const id of [undefined, 'all-things-considered', '2,3', '2;x']) {
            const { event } = makeEvent(id)
            await expect(handler(event as any)).rejects.toMatchObject({ statusCode: 400 })
        }

        expect(getFromNPR).not.toHaveBeenCalled()
    })

    it('returns 400 for a bad offset or limit without calling CDS', async () => {
        const handler = (await import('../../server/api/v3/show/npr/[showid]/episodes')).default

        for (const query of [{ offset: '-1' }, { offset: 'abc' }, { limit: '0' }, { limit: 'x' }]) {
            const { event } = makeEvent('9', query)
            await expect(handler(event as any)).rejects.toMatchObject({ statusCode: 400 })
        }

        expect(getFromNPR).not.toHaveBeenCalled()
    })
})
