import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('NPR transcript disclaimer', () => {
  it('opts only the NPR story route into the transcript disclaimer', () => {
    const nprPageSource = readFileSync(
      join(process.cwd(), 'pages/npr/[slug].vue'),
      'utf8'
    )
    const wnycStorySource = readFileSync(
      join(process.cwd(), 'pages/story/[slug]/index.vue'),
      'utf8'
    )

    expect(nprPageSource).toContain('const hasNprAudio = computed(() => hasAudio(')
    expect(nprPageSource).toContain(':show-npr-transcript-disclaimer="hasNprAudio"')
    expect(wnycStorySource).not.toContain('show-npr-transcript-disclaimer')
  })

  it('renders the requested copy above the article sidebar profile block', () => {
    const episodeTemplateSource = readFileSync(
      join(process.cwd(), 'components/EpisodeTemplate.vue'),
      'utf8'
    )
    const articleFooterSource = readFileSync(
      join(process.cwd(), 'components/story/ArticleFooter.vue'),
      'utf8'
    )

    expect(episodeTemplateSource).toContain('showNprTranscriptDisclaimer')
    expect(episodeTemplateSource).toContain(
      ':show-npr-transcript-disclaimer="props.showNprTranscriptDisclaimer"'
    )
    expect(articleFooterSource).toContain(
      'Transcripts of NPR audio are available on NPR.org'
    )
    expect(articleFooterSource.indexOf('props.showNprTranscriptDisclaimer')).toBeLessThan(
      articleFooterSource.indexOf('<VPerson')
    )
  })
})
