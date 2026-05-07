import { beforeAll, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

beforeAll(() => {
  vi.stubGlobal('defineNuxtPlugin', (plugin) => plugin)
})

describe('story navigation', () => {
  it('classifies outgoing Gothamist stories as web-only click-outs', async () => {
    const {
      shouldOpenStoryInNewTab,
      shouldTrackOutgoingGothamistClick,
    } = await import('~/utilities/helpers')

    expect(shouldOpenStoryInNewTab(
      'web',
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
})
