import { beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  vi.stubGlobal('defineNuxtPlugin', (plugin) => plugin)
})

describe('firebase config', () => {
  it('uses the configured measurement id for web', async () => {
    const { buildFirebaseConfig } = await import('~/plugins/firebase.client')
    const config = buildFirebaseConfig('web', {
      FB_MEASUREMENT_ID: 'G-PCL0RZR9NG',
      FB_API_KEY_WEB: 'web-key',
      FB_API_KEY_IOS: 'ios-key',
      FB_API_KEY_ANDROID: 'android-key',
      FB_AUTH_DOMAIN: 'wnyc-prod.firebaseapp.com',
      FB_PROJECT_ID: 'wnyc-prod',
      FB_STORAGE_BUCKET: 'wnyc-prod.appspot.com',
      FB_MESSAGING_SENDER_ID: '123456789',
      FB_APP_ID_WEB: 'web-app-id',
      FB_APP_ID_IOS: 'ios-app-id',
      FB_APP_ID_ANDROID: 'android-app-id',
    })

    expect(config).toEqual({
      apiKey: 'web-key',
      authDomain: 'wnyc-prod.firebaseapp.com',
      projectId: 'wnyc-prod',
      storageBucket: 'wnyc-prod.appspot.com',
      messagingSenderId: '123456789',
      appId: 'web-app-id',
      measurementId: 'G-PCL0RZR9NG',
    })
  })

  it('registerGtagDestination pushes a config call into the dataLayer', async () => {
    delete (window as any).gtag
    ;(window as any).dataLayer = []

    const { registerGtagDestination } = await import('~/plugins/firebase.client')
    registerGtagDestination('G-PCL0RZR9NG')

    const dataLayer = (window as any).dataLayer
    expect(dataLayer).toHaveLength(1)
    // gtag pushes its arguments object to dataLayer; compare positional args.
    expect(Array.from(dataLayer[0])).toEqual(['config', 'G-PCL0RZR9NG', { send_page_view: false }])
  })

  it('registerGtagDestination is a no-op when no measurement id is provided', async () => {
    delete (window as any).gtag
    ;(window as any).dataLayer = []

    const { registerGtagDestination } = await import('~/plugins/firebase.client')
    registerGtagDestination(undefined as any)
    registerGtagDestination('')
    registerGtagDestination(null as any)

    expect((window as any).dataLayer).toHaveLength(0)
  })

  it('selects platform specific app ids and api keys', async () => {
    const { buildFirebaseAnalyticsSettings, buildFirebaseConfig } = await import('~/plugins/firebase.client')
    const config = buildFirebaseConfig('android', {
      FB_MEASUREMENT_ID: 'G-HR1Q2F6S29',
      FB_API_KEY_WEB: 'web-key',
      FB_API_KEY_IOS: 'ios-key',
      FB_API_KEY_ANDROID: 'android-key',
      FB_AUTH_DOMAIN: 'wnyc-demo.firebaseapp.com',
      FB_PROJECT_ID: 'wnyc-demo',
      FB_STORAGE_BUCKET: 'wnyc-demo.appspot.com',
      FB_MESSAGING_SENDER_ID: '162090348678',
      FB_APP_ID_WEB: 'web-app-id',
      FB_APP_ID_IOS: 'ios-app-id',
      FB_APP_ID_ANDROID: 'android-app-id',
    })

    expect(config.apiKey).toBe('android-key')
    expect(config.appId).toBe('android-app-id')
    expect(config.measurementId).toBe('G-HR1Q2F6S29')
    expect(buildFirebaseAnalyticsSettings()).toEqual({
      config: {
        send_page_view: false,
      },
    })
  })
})
