import { describe, expect, it } from 'vitest'
import { getGtmHeadConfig } from '~/utilities/gtm'

describe('gtm head config', () => {
  const containerId = 'GTM-TEST123'

  it('loads GTM tags on web only', () => {
    expect(getGtmHeadConfig({ isWeb: true, gtmId: containerId }).script.length).toBe(1)
    expect(getGtmHeadConfig({ isWeb: false, gtmId: containerId }).script.length).toBe(0)
  })

  it('does not load GTM if there is no container id', () => {
    expect(getGtmHeadConfig({ isWeb: true }).script).toEqual([])
    expect(getGtmHeadConfig({ isWeb: true, gtmId: '' }).script).toEqual([])
    expect(getGtmHeadConfig({ isWeb: true, gtmId: null }).script).toEqual([])
  })

  it('does not load GTM if the container id is invalid', () => {
    expect(getGtmHeadConfig({ isWeb: true, gtmId: 'GTM-TEST123<script>' }).script).toEqual([])
  })

  it('uses GTM snippet generated during setup (not delayed by lifecycle hooks)', () => {
    const config = getGtmHeadConfig({ isWeb: true, gtmId: containerId })

    expect(config.script).toHaveLength(1)
    expect(config.script[0].innerHTML).toContain('(window,document,\'script\',\'dataLayer\',\'GTM-TEST123\')')
    expect(config.script[0].innerHTML).toContain('j.async=true')
    expect(config.script[0].innerHTML).not.toContain('setTimeout(')

    expect(config.noscript[0].innerHTML).toContain(`https://www.googletagmanager.com/ns.html?id=${containerId}`)
  })
})
