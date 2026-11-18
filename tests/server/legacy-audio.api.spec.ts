import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.hoisted(() => vi.fn())
vi.mock('axios', () => ({ default: axiosMock }))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.setResponseHeader = () => {}
// @ts-expect-error test-only global
globalThis.createError = (options: any) => Object.assign(new Error(options.statusMessage), options)
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => ({ public: { PUBLISHER_BASE_API: 'https://publisher.test/api/' } })

const callRoute = async (storyId: string) => {
  const handler = (await import('../../server/api/legacy-audio/[storyId]')).default
  return handler({ context: { params: { storyId } } } as any)
}

describe('GET /api/legacy-audio/[storyId]', () => {
  beforeEach(() => axiosMock.mockReset())

  it('returns only the story audio URL, requesting just that field from Publisher', async () => {
    const audio = 'https://pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/news/news20230214_cms1299425_pod.mp3'
    axiosMock.mockResolvedValue({ data: { data: { type: 'story', id: '1299425', attributes: { audio, url: 'http://www.wnyc.org/story/x/' } } } })

    await expect(callRoute('1299425')).resolves.toEqual({ audio })
    expect(axiosMock).toHaveBeenCalledWith('https://publisher.test/api/v3/story-pk/1299425/?fields[story]=audio')
  })

  it('rejects non-numeric ids without calling Publisher', async () => {
    await expect(callRoute('../v3/buckets')).rejects.toMatchObject({ statusCode: 400 })
    expect(axiosMock).not.toHaveBeenCalled()
  })
})
