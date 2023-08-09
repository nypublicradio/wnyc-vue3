import {
    useCurrentUser,
    useCurrentUserProfile,
    useLocalUserProfileDefault
} from '~/composables/states'
import { setDisplaySettings } from '~/utilities/helpers'
import { Preferences } from '@capacitor/preferences'
export default defineNuxtRouteMiddleware(async () => {
    //console.log('checking auth')
    const currentUser = useCurrentUser()
    const currentUserProfile = useCurrentUserProfile()
    const localUserProfileDefault = useLocalUserProfileDefault()
    const config = useRuntimeConfig()
    const client = useSupabaseClient()
    const user = await client.auth.getSession()

    // function that gets a user profile
    const getProfile = async () => {
        const {
            data,
            error
        } = await client
            .from('profiles')
            .select('*')
            .eq('id', currentUser.value.id)
            .single()
        if (error) {
            console.error(error)
        } else if (data) {
            //console.log('data = ', data)
            currentUserProfile.value = data
            //set display settings
            setDisplaySettings(data)
            navigateTo('/home')
        }
    }

    // check local storage for the auth token
    if (process.client) {
        const supabaseAuthToken = await Preferences.get({ key: config.public.supabaseAuthTokenName })

        if (supabaseAuthToken.value) {
            currentUser.value = JSON.stringify(supabaseAuthToken.user)
        }

        // check supabase session for logged in user
        if (user?.data?.session?.user) {
            currentUser.value = user?.data?.session?.user
        }


        if (!currentUser.value) {
            // initially set default user profile settings or use the local storage settings

            // does local storage settings exist?
            const isLocalUserProfile = await Preferences.get({ key: 'localUserProfile' }).value
            if (!isLocalUserProfile) {
                // no, set defaults from localUserProfileDefault state

                const localUserProfileDefaultSTRING = JSON.stringify(localUserProfileDefault.value)
                await Preferences.set({
                    key: 'localUserProfile',
                    value: localUserProfileDefaultSTRING
                })
                currentUserProfile.value = {}
                currentUserProfile.value = localUserProfileDefault.value
                //set display settings
                setDisplaySettings(localUserProfileDefault.value)
            } else {
                // local storage is set, so set currentUserProfile to the local storage settings

                currentUserProfile.value = {}
                currentUserProfile.value = await Preferences.get({ key: 'localUserProfile' })

                //set display settings
                setDisplaySettings(JSON.parse(currentUserProfile.value))
            }
            navigateTo('/home')

        } else {
            // if they are a user, get their profile data
            getProfile()

        }
    }
})