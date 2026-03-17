import {
    askTrackingPermissions,
} from "~/utilities/helpers"

// Dynamic import for OneSignal to avoid SSR errors
const loadOneSignal = async () => {
    if (typeof window === 'undefined') return null
    try {
        const module = await import('onesignal-cordova-plugin')
        return module.default
    } catch (error) {
        console.error('Failed to load OneSignal:', error)
        return null
    }
}

// function to handle trigger actions from OneSignal
export const doTrigger = async (id: string, val = 'true') => {
    const OneSignal = await loadOneSignal()
    if (OneSignal) {
        await OneSignal.InAppMessages.addTrigger(id, val);
    } else {
        console.error('OneSignal SDK not initialized.');
    }
}

// switch case for custom actions that can be triggered by OneSignal notifications based on the actionId
export async function doActionId(actionId: string) {
    switch (actionId) {
        case "tracking-permission":
            await askTrackingPermissions()
            break
        case "sample":
            console.error("Sample action triggered")
            break
        default:
            // do something
            break
    }
}
