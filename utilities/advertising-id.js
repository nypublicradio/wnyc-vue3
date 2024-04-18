import {
    useAdvertisingId,
    useCurrentUser
} from "~/composables/states"
import {
    Device
} from '@capacitor/device';

// Get the advertising ID
export const initAdvertisingId = async () => {
    const advertisingId = useAdvertisingId()
    const currentUser = useCurrentUser()
    try {
        const id = await Device.getId()
        advertisingId.value = id
        if ( currentUser.value ) {
            // save the advertising ID to the deviceId table in supabase IF the user is logged in
            const client = useSupabaseClient()
            await client
                .from( 'device_ids' )
                .upsert( [ {
                    user_id: currentUser.value.id,
                    device_id: advertisingId.value
                }, ] )
        }
    } catch ( error ) {
        console.error( "Error getting advertising ID:", error )
    }
}