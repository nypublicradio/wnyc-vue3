import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { useHtmlParser } from '~/composables/useHtmlParser'

vi.mock('~/components/VImage.vue', () => ({ default: {} }))
vi.mock('~/composables/useVImage', () => ({ useVImage: () => ({}) }))
vi.mock('~/composables/globals', () => ({ WAGTAILIMAGEDOMAINSOURCES: [] }))

const audio = 'https://pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/news/news20230214_cms1299425_pod.mp3'
const fetchMock = vi.fn(async (url: string) => {
  if (url === 'https://bff.test/api/legacy-audio/1299425') return { audio }
  throw new Error('404')
})
// @ts-expect-error test-only global
globalThis.$fetch = fetchMock
// @ts-expect-error test-only global
globalThis.useRuntimeConfig = () => ({ public: { BFF_URL: 'https://bff.test' } })

describe('useHtmlParser', () => {
  it('resolves legacy /audio/json/<id>/ player embeds to the story audio URL', async () => {
    const render = useHtmlParser(
      '<iframe src="https://www.wnyc.org/widgets/ondemand_player/wnyc/#file=/audio/json/1299425/&amp;share=1"></iframe>'
      + '<iframe src="https://www.wnyc.org/widgets/ondemand_player/wnyc/#file=/audio/json/404/&amp;share=1"></iframe>'
    )
    // mount like HtmlConvert's <component :is="parsedNodes"> so the re-render after the fetch is exercised
    const el = document.createElement('div')
    createApp({ render: () => h(render) }).mount(el)
    const srcs = () => [...el.querySelectorAll('iframe')].map((iframe) => iframe.getAttribute('src'))

    // no src until resolved, so the widget never requests /audio/json/<id>/
    expect(srcs()).toEqual([null, null])
    await vi.waitFor(() => expect(srcs()[0]).toBe(`/widgets/ondemand_player/wnyc/#file=${audio}&share=1`))
    // unresolvable ids keep no src, and each id is fetched once
    expect(srcs()[1]).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
