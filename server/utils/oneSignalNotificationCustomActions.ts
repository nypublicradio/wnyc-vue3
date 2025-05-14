import {
    askTrackingPermissions,
} from "~/utilities/helpers"
import OneSignal from "onesignal-cordova-plugin"

const triggerInAppNotification = (id: string) => {
    if (typeof OneSignal !== 'undefined') {
        OneSignal.InAppMessages.addTrigger(id, 'true');
    } else {
        console.error('OneSignal SDK not initialized.');
    }
}

// repository switch case for custom actions that can be triggered by OneSignal notifications based on the actionId
export async function doActionId(actionId: string) {
    switch (actionId) {
        case "tracking-permission":
            await askTrackingPermissions()
            break
        case "donate":
            triggerInAppNotification(actionId)
            break
        default:
            // do something
            break
    }
}