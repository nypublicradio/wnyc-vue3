import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock axios to return our fixture without making network calls
let mockResponse: any
const axiosMock = vi.fn(async (_arg: any) => ({ data: mockResponse }))
vi.mock('axios', () => ({ default: axiosMock }))

// Keep server import tree minimal by mocking globals composable to avoid UI imports
vi.mock('~/composables/globals', () => ({
  cmsSources: { PUBLISHER: 'publisher', WAGTAIL: 'wagtail', NPR: 'npr', SIMPLECAST: 'simplecast' },
}))

// Provide a test-only runtime config so the server file doesn't rely on Nuxt auto-imports
// @ts-ignore
globalThis.__testRuntimeConfig = {
  public: {
    AVIARY_BASE_API: 'https://example.test/api/v2/',
    PUBLISHER_BASE_API: 'https://publisher.test/api/',
  },
}

describe('server/api/pages [wagtail] passes through body.curated_list', () => {
  beforeEach(() => {
    axiosMock.mockClear()
    // Minimal fixture resembling the Aviary /pages response for a ShowPage
    mockResponse = {
      id: 47,
      meta: {
        type: 'shows.ShowPage',
        slug: 'new-sounds',
      },
      title: 'New Sounds',
      body: [
        {
          id: '85a873f4-6e30-4e81-8948-6a74276daa2d',
          type: 'curated_list',
          value: {
            label: 'Bloop',
            layout: 'default',
            list: {
              id: 1,
              title: 'Curated List',
              list_items: [
                {
                  content: {
                    description: '',
                    duration: 3436,
                    enclosure_url:
                      'https://pscrb.fm/rss/p/mgln.ai/e/14/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/035c957a-7f28-4f4f-b014-08c1e8d8cd81/episodes/eb14cb68-f272-4f27-ae33-b8ff8035ef24/audio/128/default.mp3?awCollectionId=035c957a-7f28-4f4f-b014-08c1e8d8cd81&awEpisodeId=eb14cb68-f272-4f27-ae33-b8ff8035ef24',
                    id: 'eb14cb68-f272-4f27-ae33-b8ff8035ef24',
                    number: 268,
                    published_at: '2025-09-02T16:43:13-04:00',
                    season: 1,
                    slug: '5044-western-strings-play-eastern-music',
                    status: 'published',
                    title: '#5044 Western Strings Play Eastern Music',
                    type: 'full',
                    show_id: '035c957a-7f28-4f4f-b014-08c1e8d8cd81',
                    show_image_url:
                      'https://image.simplecastcdn.com/images/b99b6401-4efd-485f-b744-84da8d6c14f6/384af6c9-0a9c-41a8-938d-342111cc2f3e/new-sounds-logo.jpg',
                    show_title: 'New Sounds ',
                  },
                  content_type: 'episode',
                  title: '#5044 Western Strings Play Eastern Music',
                  subtitle: 'New Sounds ',
                  body: '',
                },
              ],
            },
          },
        },
      ],
    }
  })

  it('returns body with curated_list and listItems intact (camelized)', async () => {
    const handler = (await import('../../server/api/pages/[cmsSource]/[pageSlug]')).default
    const event: any = {
      context: { params: { cmsSource: 'wagtail', pageSlug: 'new-sounds' } },
    }

    const result = await handler(event)

    // Ensure our axios mock was called to fetch from Aviary
    expect(axiosMock).toHaveBeenCalledTimes(1)

    // Body should be present and include the curated_list block
    expect(Array.isArray(result.body)).toBe(true)
    expect(result.body[0].type).toBe('curated_list')

    // Nested keys should be camelized and preserved
    const list = result.body[0].value.list
    expect(Array.isArray(list.listItems)).toBe(true)
    const first = list.listItems[0]
    expect(first.content.id).toBe('eb14cb68-f272-4f27-ae33-b8ff8035ef24')
    expect(first.content.enclosureUrl).toContain('default.mp3')
    expect(first.content.showImageUrl).toContain('new-sounds-logo.jpg')
    expect(first.content.showTitle).toBe('New Sounds ')
  })
})
