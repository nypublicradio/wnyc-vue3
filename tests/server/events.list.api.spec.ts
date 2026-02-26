import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.fn()
vi.mock('axios', () => ({ default: axiosMock }))

vi.mock('~/server/utils/events', () => ({
  normalizeWagtailEvent: (item: any) => item,
}))

let currentQuery: Record<string, any> = {}

vi.mock('#imports', () => ({
  defineEventHandler: (handler: unknown) => handler,
  useRuntimeConfig: () => ({
    cmsSite: 'demo.wnyc.org:443',
    public: { AVIARY_BASE_API: 'https://example.test/api/v2/' },
  }),
  getQuery: () => currentQuery,
}))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => ({
  cmsSite: 'demo.wnyc.org:443',
  public: { AVIARY_BASE_API: 'https://example.test/api/v2/' },
})
// @ts-expect-error test-only global
globalThis.getQuery = () => currentQuery

describe('server/api/events/list uses CMS events endpoint', () => {
  beforeEach(() => {
    currentQuery = {}
    axiosMock.mockReset()
    axiosMock.mockResolvedValue({
      data: {
        items: [{ id: 1, title: 'Example Event' }],
        meta: { total_count: 1 },
      },
    })
  })

  it('calls /events/ without legacy date filters by default', async () => {
    const handler = (await import('../../server/api/events/list')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    const result = await handler(event)
    const call = axiosMock.mock.calls[0][0]

    expect(call.url).toBe('https://example.test/api/v2/events/')
    expect(call.params.type).toBeUndefined()
    expect(call.params.event_date__gte).toBeUndefined()
    expect(call.params.event_date__lt).toBeUndefined()
    expect(result.meta.totalCount).toBe(1)
  })

  it('forwards upcoming/past flags to CMS endpoint', async () => {
    const handler = (await import('../../server/api/events/list')).default
    const event: any = { node: { res: { setHeader: vi.fn() } } }

    currentQuery = { upcoming: 'true' }
    await handler(event)
    let call = axiosMock.mock.calls[0][0]
    expect(call.params.upcoming).toBe(true)
    expect(call.params.past).toBeUndefined()

    currentQuery = { past: 'true' }
    await handler(event)
    call = axiosMock.mock.calls[1][0]
    expect(call.params.past).toBe(true)
    expect(call.params.upcoming).toBeUndefined()
  })
})
