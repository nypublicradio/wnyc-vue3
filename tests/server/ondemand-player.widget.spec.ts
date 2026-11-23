import { JSDOM } from 'jsdom'
import { describe, expect, it, vi } from 'vitest'
import widgetHtml from '~/server/assets/widgets/ondemand_player.html?raw'

const audio = 'https://pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/news/news20230214_cms1299425_pod.mp3?awCollectionId=882225&awEpisodeId=1307403'
const bffAnswers = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }))

// loads the real widget at url with a stubbed fetch; resolves to the audio src it plays, or null when it shows its error
const play = async (url: string, fetch = bffAnswers({ audio })) => {
  const { document } = new JSDOM(widgetHtml, { url, runScripts: 'dangerously', beforeParse: (window) => { window.fetch = fetch } }).window
  const audioEl = document.getElementById('audio-player')
  const errorEl = document.getElementById('error-msg')
  if (!audioEl || !errorEl) throw new Error('widget markup is missing #audio-player or #error-msg')
  await vi.waitFor(() => expect([audioEl.style.display, errorEl.style.display]).toContain('block'))
  return audioEl.style.display === 'block' ? audioEl.getAttribute('src') : null
}

describe('ondemand_player widget', () => {
  it('looks up legacy /audio/json/<id>/ embeds through our server', async () => {
    const fetch = bffAnswers({ audio })
    await expect(play('https://www.wnyc.org/widgets/ondemand_player/wnyc/#file=/audio/json/1299425/&share=1', fetch)).resolves.toBe(audio)
    expect(fetch).toHaveBeenCalledWith('/api/legacy-audio/1299425')
  })

  it('also resolves legacy embeds whose hash was encoded into the path', async () => {
    await expect(play('https://www.wnyc.org/widgets/ondemand_player/wnyc/%23file=/audio/json/1299425/')).resolves.toBe(audio)
  })

  it('shows its error when the story has no audio or the lookup fails', async () => {
    await expect(play('https://www.wnyc.org/widgets/ondemand_player/wnyc/#file=/audio/json/1/', bffAnswers({ audio: '' }))).resolves.toBeNull()
    await expect(play('https://www.wnyc.org/widgets/ondemand_player/wnyc/#file=/audio/json/1/', bffAnswers({}, false))).resolves.toBeNull()
  })

  it('plays a direct file URL exactly as given, escapes included', async () => {
    const escaped = 'https://cdn.test/a%2Bb.mp3?sig=ab%3D%3D'
    const fetch = bffAnswers({})
    await expect(play(`https://www.wnyc.org/widgets/ondemand_player/wnyc/#file=${encodeURIComponent(escaped)}`, fetch)).resolves.toBe(escaped)
    expect(fetch).not.toHaveBeenCalled()
  })
})
