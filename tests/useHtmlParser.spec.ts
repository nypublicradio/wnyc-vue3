import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { useHtmlParser } from '~/composables/useHtmlParser'

vi.mock('~/components/VImage.vue', () => ({ default: {} }))
vi.mock('~/composables/useVImage', () => ({ useVImage: () => ({}) }))
vi.mock('~/composables/globals', () => ({ WAGTAILIMAGEDOMAINSOURCES: [] }))

const audio = 'https://pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/news/news20230214_cms1299425_pod.mp3?awCollectionId=882225&awEpisodeId=1307403'
// BFF responses by story id; anything else is a 404 (an HTTP error carries a response, like ofetch's FetchError)
const bffResponses: Record<string, unknown> = { 1299425: { audio }, 1299426: {}, 1299427: { audio } }
const fetchMock = vi.fn(async (url: string) => {
  const id = url.split('/').pop()
  if (id in bffResponses) return bffResponses[id]
  throw Object.assign(new Error('Not Found'), { response: { status: 404 } })
})
const fetchesFor = (id: string) => fetchMock.mock.calls.filter(([url]) => url.endsWith(`/${id}`)).length
// @ts-expect-error test-only global
globalThis.$fetch = fetchMock
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => ({ public: { BFF_URL: 'https://bff.test' } })

const embed = (id: string) => `<iframe src="https://www.wnyc.org/widgets/ondemand_player/wnyc/#file=/audio/json/${id}/&amp;share=1"></iframe>`
// mount like HtmlConvert's <component :is="parsedNodes"> so the re-render after the fetch is exercised
const mountSrcs = (html: string) => {
  const el = document.createElement('div')
  createApp({ render: () => h(useHtmlParser(html)) }).mount(el)
  return () => [...el.querySelectorAll('iframe')].map((iframe) => iframe.getAttribute('src'))
}
const resolvedSrc = `/widgets/ondemand_player/wnyc/#file=${encodeURIComponent(audio)}&share=1`
// an empty #file= makes the widget show its "Audio player unavailable" message
const unavailableSrc = '/widgets/ondemand_player/wnyc/#file=&share=1'

describe('useHtmlParser', () => {
  it('resolves legacy /audio/json/<id>/ player embeds to the story audio URL', async () => {
    const srcs = mountSrcs(embed('1299425') + embed('404') + embed('1299426'))

    // no src while loading, so the widget never requests /audio/json/<id>/
    expect(srcs()).toEqual([null, null, null])
    // a 404 or a story without audio shows the widget's own error instead of a blank box
    await vi.waitFor(() => expect(srcs()).toEqual([resolvedSrc, unavailableSrc, unavailableSrc]))
    // each id is fetched once; a 404 is final, not retried
    expect([fetchesFor('1299425'), fetchesFor('404'), fetchesFor('1299426')]).toEqual([1, 1, 1])
  })

  it('retries a lookup that failed without a response (e.g. offline)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const srcs = mountSrcs(embed('1299427'))

    await vi.waitFor(() => expect(srcs()).toEqual([resolvedSrc]))
    expect(fetchesFor('1299427')).toBe(2)
  })
})
