
import {
    useAdvertisingId, useCurrentUser
} from "~/composables/states"
import { AdvertisingId } from '@capacitor-community/advertising-id'

// Get the advertising ID
export const initAdvertisingId = async () => {
    const advertisingId = useAdvertisingId()
    const currentUser = useCurrentUser()
    try {
        await AdvertisingId.requestTracking()
        const id = await AdvertisingId.getAdvertisingId()
        advertisingId.value = id.id

        if (currentUser) {
            // Save the advertising ID to the deviceId table in supabase here IF the user is logged in
        }
    } catch (error) {
        console.error("Error getting advertising ID:", error)
    }

}
