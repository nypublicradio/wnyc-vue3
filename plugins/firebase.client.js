import { initializeApp } from 'firebase/app'
import { initializeAnalytics } from 'firebase/analytics'
import { Capacitor } from "@capacitor/core"

/**
 * Builds the Firebase config for the current platform from runtime config.
 */
export const buildFirebaseConfig = (platform, publicConfig) => {
    let appId = null
    let apiKey = null

    switch (platform) {
        case 'web':
            appId = publicConfig.FB_APP_ID_WEB
            apiKey = publicConfig.FB_API_KEY_WEB
            break
        case 'android':
            appId = publicConfig.FB_APP_ID_ANDROID
            apiKey = publicConfig.FB_API_KEY_ANDROID
            break
        case 'ios':
            appId = publicConfig.FB_APP_ID_IOS
            apiKey = publicConfig.FB_API_KEY_IOS
            break
        default:
    }

    return {
        apiKey,
        authDomain: publicConfig.FB_AUTH_DOMAIN,
        projectId: publicConfig.FB_PROJECT_ID,
        storageBucket: publicConfig.FB_STORAGE_BUCKET,
        messagingSenderId: publicConfig.FB_MESSAGING_SENDER_ID,
        appId,
        measurementId: publicConfig.FB_MEASUREMENT_ID,
    }
}

/**
 * Builds the Firebase Analytics settings for the web client.
 */
export const buildFirebaseAnalyticsSettings = () => ({
    config: {
        send_page_view: false,
    },
})

/**
 * Explicitly registers the GA4 measurement ID with gtag so that page_view and
 * other events have a valid destination to land in.
 *
 * Why this is necessary: the Firebase Web SDK's analytics module does not use
 * the measurementId we pass to initializeApp() directly. Instead it fetches
 * the public webConfig endpoint (firebase.googleapis.com/.../webConfig) and
 * prefers whatever measurementId that response returns. If the Firebase web
 * app's GA4 stream linkage has been recently changed, that endpoint can lag
 * behind the actual configuration for many hours. While it lags it returns
 * no measurementId at all, so the SDK calls gtag('config', null, ...), no
 * destination is registered, and every gtag('event', ...) is silently
 * dropped. This call ensures gtag has a valid destination registered using
 * the measurementId from our runtime config, regardless of what the Firebase
 * SDK's webConfig fetch ends up returning.
 */
export const registerGtagDestination = (measurementId) => {
    if (typeof window === 'undefined' || !measurementId) return
    window.dataLayer = window.dataLayer || []
    if (typeof window.gtag !== 'function') {
        window.gtag = function () { window.dataLayer.push(arguments) }
    }
    window.gtag('config', measurementId, { send_page_view: false })
}

export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig()
    const platform = await Capacitor.getPlatform()
    const firebaseConfig = buildFirebaseConfig(platform, config.public)
    const app = initializeApp(firebaseConfig)

    if (platform === 'web') {
        registerGtagDestination(firebaseConfig.measurementId)
    }

    initializeAnalytics(app, buildFirebaseAnalyticsSettings())
})
