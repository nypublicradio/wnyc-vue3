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

export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig()
    const platform = await Capacitor.getPlatform()
    const firebaseConfig = buildFirebaseConfig(platform, config.public)
    const app = initializeApp(firebaseConfig)
    initializeAnalytics(app, buildFirebaseAnalyticsSettings())
})
