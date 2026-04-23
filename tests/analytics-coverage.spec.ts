import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const pagesDir = join(process.cwd(), 'pages')

const expectedPageViewFiles = [
  'pages/browse/browse-topic.vue',
  'pages/browse/index.vue',
  'pages/browse/shows/[slug]/episodes.vue',
  'pages/browse/shows/[slug]/index.vue',
  'pages/browse/shows/episode/[cmsSource]/[slug]/index.vue',
  'pages/browse/shows/episode/[cmsSource]/[slug]/transcript.vue',
  'pages/events/[slug].vue',
  'pages/events/index.vue',
  'pages/forgot-password.vue',
  'pages/home.vue',
  'pages/live.vue',
  'pages/login.vue',
  'pages/npr/[slug].vue',
  'pages/people/[slug].vue',
  'pages/saved.vue',
  'pages/signup.vue',
  'pages/staff/[slug].vue',
  'pages/story/[slug]/index.vue',
  'pages/story/[slug]/photos/[gallerySlug].vue',
  'pages/story/[slug]/transcript.vue',
]

const walkFiles = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      return walkFiles(fullPath)
    }

    return [fullPath]
  })

describe('analytics coverage', () => {
  it('tracks page views in the expected route files', () => {
    const actualFiles = walkFiles(pagesDir)
      .map((file) => relative(process.cwd(), file))
      .filter((file) => readFileSync(file, 'utf8').includes('$analytics.sendPageView('))
      .sort()

    expect(actualFiles).toEqual(expectedPageViewFiles)
  })

  it('keeps page view payload metadata on tracked routes', () => {
    expectedPageViewFiles.forEach((file) => {
      const source = readFileSync(file, 'utf8')
      expect(source).toContain('$analytics.sendPageView({')
      expect(source).toContain('page_title:')
      expect(source).toContain('page_type:')
      expect(source).toContain('content_group:')
    })
  })

  it('routes audio and click helper payloads through the shared builders', () => {
    const source = readFileSync(join(process.cwd(), 'utilities/helpers.ts'), 'utf8')

    expect(source).toContain('buildAudioEventParams({')
    expect(source).toContain('buildClickEventParams({')
  })
})
