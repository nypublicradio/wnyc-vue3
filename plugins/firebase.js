import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { Capacitor } from "@capacitor/core"

export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig()

    const platform = await Capacitor.getPlatform()
    let thisAppId = null
    let thisApiKey = null
    switch (platform) {
        case 'web':
            thisAppId = config.public.FB_APP_ID_WEB
            thisApiKey = config.public.FB_API_KEY_WEB
            break
        case 'android':
            thisAppId = config.public.FB_APP_ID_ANDROID
            thisApiKey = config.public.FB_API_KEY_ANDROID
            break
        case 'ios':
            thisAppId = config.public.FB_APP_ID_IOS
            thisApiKey = config.public.FB_API_KEY_IOS
            break
        default:
    }

    const firebaseConfig = {
        apiKey: thisApiKey,
        authDomain: config.public.FB_AUTH_DOMAIN,
        projectId: config.public.FB_PROJECT_ID,
        storageBucket: config.public.FB_STORAGE_BUCKET,
        messagingSenderId: config.public.FB_MESSAGING_SENDER_ID,
        appId: thisAppId,
        measurementId: config.public.FB_MEASUREMENT_ID,
    }
    const app = initializeApp(firebaseConfig)
    getAnalytics(app)
})