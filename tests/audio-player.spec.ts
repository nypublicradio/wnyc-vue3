import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('audio player episode context label', () => {
  it('does not require episode data to include headers', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/AudioPlayer.vue'),
      'utf8'
    )

    expect(source).toContain('const getEpisodeContextLabel = computed(() => {')
    expect(source).toContain('currentEpisode.value?.headers?.brand?.title')
    expect(source).not.toContain('currentEpisode.headers.brand.title')
  })
})
