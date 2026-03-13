import { describe, expect, it } from 'vitest'
import { getGtmHeadConfig } from '~/utilities/gtm'

describe('gtm head config', () => {
  const containerId = 'GTM-TEST123'

  it('loads GTM tags on web only', () => {
    expect(getGtmHeadConfig({ platform: 'web', gtmId: containerId }).script.length).toBe(1)
    expect(getGtmHeadConfig({ platform: 'android', gtmId: containerId }).script.length).toBe(0)
    expect(getGtmHeadConfig({ platform: 'ios', gtmId: containerId }).script.length).toBe(0)
  })

  it('does not load GTM if there is no container id', () => {
    expect(getGtmHeadConfig({ platform: 'web' }).script).toEqual([])
    expect(getGtmHeadConfig({ platform: 'web', gtmId: '' }).script).toEqual([])
  })

  it('uses GTM snippet generated during setup (not delayed by lifecycle hooks)', () => {
    const config = getGtmHeadConfig({ platform: 'web', gtmId: containerId })

    expect(config.script).toHaveLength(1)
    expect(config.script[0].children).toContain('(window,document,\'script\',\'dataLayer\',\'GTM-TEST123\')')
    expect(config.script[0].children).toContain('j.async=true')
    expect(config.script[0].children).not.toContain('setTimeout(')

    expect(config.noscript[0].innerHTML).toContain(`https://www.googletagmanager.com/ns.html?id=${containerId}`)
  })
})
