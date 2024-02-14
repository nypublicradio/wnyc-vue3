
import {
    useAdvertisingId,
} from "~/composables/states"
import { AdvertisingId } from '@capacitor-community/advertising-id'
export const initAdvertisingId = async () => {
    const advertisingId = useAdvertisingId()
    try {
        await AdvertisingId.requestTracking()
        const id = await AdvertisingId.getAdvertisingId()
        advertisingId.value = id.id
        console.log("AdvertisingId = ", advertisingId.value)
        alert("AdvertisingId in app = " + JSON.stringify(advertisingId.value))
    } catch (error) {
        console.error("Error getting advertising ID:", error)
    }

}
