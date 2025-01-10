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
            alert("you will see this when you return from the donate page. We can say thank you for donating or something")
            // do something
            break
        default:
            // do something
            break
    }
}