import {
    askTrackingPermissions,
} from "~/utilities/helpers"
import OneSignal from "onesignal-cordova-plugin"

// function to handle trigger actions from OneSignal
export const doTrigger = async (id: string, val: string = 'true') => {
    if (typeof OneSignal !== 'undefined') {
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