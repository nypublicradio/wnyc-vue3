import { beforeAll, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

vi.mock('~/composables/states', () => ({
  useIsApp: () => ({ value: false }),
}))

vi.mock('~/composables/globals', () => ({
  cmsSources: {
    WAGTAIL: 'wagtail',
    PUBLISHER: 'publisher',
    NPR: 'npr',
    SIMPLECAST: 'simplecast',
  },
  mediaTypeRoutes: { npr_episode: '/npr/', npr_article: '/npr/' },
  localUserProfileKey: 'localUserProfile',
  liveStationPreferences: [],
}))

beforeAll(() => {
  vi.stubGlobal('defineNuxtPlugin', (plugin) => plugin)
  // auto-imported by Nuxt, not by Vitest
  vi.stubGlobal('mediaTypes', { NPR_EPISODE: 'npr_episode', NPR_ARTICLE: 'npr_article' })
})

describe('story navigation', () => {
  it('classifies outgoing Gothamist stories as web-only click-outs', async () => {
    const {
      shouldOpenStoryInNewTab,
      shouldTrackOutgoingGothamistClick,
    } = await import('~/utilities/helpers')

    expect(shouldOpenStoryInNewTab(
      'https://demo.gothamist.com/news/mayor-mamdani-in-albany',
      'wagtail'
    )).toBe(true)
    expect(shouldTrackOutgoingGothamistClick(
      'https://demo.gothamist.com/news/mayor-mamdani-in-albany'
    )).toBe(true)
  })

  it('tracks outgoing Gothamist stories through click_tracking before opening a new tab', () => {
    const source = readFileSync(join(process.cwd(), 'utilities/helpers.ts'), 'utf8')

    expect(source).toContain('Click Tracking - Outgoing Gothamist Story')
    expect(source).toContain('trackClickEvent(')
  })

  it('routes NPR stories to /npr/<id>/<title> when the npr.org link has a title', async () => {
    const { goToNprPage } = await import('~/utilities/helpers')
    const id = 'nx-s1-6029331'
    const title = 'democrats-have-a-long-to-do-list-when-they-take-over-congress-next-year'

    expect(goToNprPage({ id, link: `https://www.npr.org/2026/11/05/${id}/${title}` }, false, true))
      .toEqual({ path: `/npr/${id}/${title}` })
    expect(goToNprPage({ media_id: id, link: `https://www.npr.org/2026/11/05/${id}/${title}` }, false, true))
      .toEqual({ path: `/npr/${id}/${title}` })
  })

  it('falls back to /npr/<id> when there is no usable npr.org link', async () => {
    const { goToNprPage } = await import('~/utilities/helpers')
    const id = 'nx-s1-6029331'

    expect(goToNprPage({ id }, false, true)).toEqual({ path: `/npr/${id}` })
    expect(goToNprPage({ id, link: '/' }, false, true)).toEqual({ path: `/npr/${id}` })
  })
})
