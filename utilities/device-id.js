import {
    useDeviceId,
    useCurrentUser
} from "~/composables/states"
import {
    Device
} from '@capacitor/device';

// Get the device ID
export const initDeviceId = async () => {
    const deviceId = useDeviceId()
    const currentUser = useCurrentUser()
    try {
        const id = await Device.getId()
        deviceId.value = id
        if ( currentUser.value ) {
            // save the device ID to the deviceId table in supabase IF the user is logged in
            const client = useSupabaseClient()
            await client
                .from( 'device_ids' )
                .upsert( [ {
                    user_id: currentUser.value.id,
                    device_id: deviceId.value
                }, ] )
        }
    } catch ( error ) {
        console.error( "Error getting device ID:", error )
    }
}