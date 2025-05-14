import {
    askTrackingPermissions,
} from "~/utilities/helpers"

// repository switch case for custom actions that can be triggered by OneSignal notifications based on the actionId
export async function doActionId(actionId: string) {
    switch (actionId) {
        case "tracking-permission":
            await askTrackingPermissions()
            break
        case "donate":
            alert('this is the result of the action id = donate')
            break
        default:
            // do something
            break
    }
}