import {
    useCurrentUser,
    useCurrentUserProfile,
    useLocalUserProfileDefault
} from '~/composables/states'
import { setDisplaySettings, detectSystemDarkMode } from '~/utilities/helpers'
import { Preferences } from '@capacitor/preferences'
export default defineNuxtRouteMiddleware(async () => {
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
            if (data.initial) {
                // update the current local profile data response
                data.initial = false
                // update supabase profile data
                await client
                    .from('profiles')
                    .update({
                        initial: false,
                    })
                    .match({ id: currentUser.value.id })
            }

            // set the current user profile state
            currentUserProfile.value = data
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
            const isLocalUserProfile = await Preferences.get({ key: 'localUserProfile' })
            if (!isLocalUserProfile.value) {
                // no, set defaults from localUserProfileDefault state
                const defaults = localUserProfileDefault.value

                //get the system's current theme and apply it to the initial defaults              
                defaults.dark_mode = detectSystemDarkMode()

                const defaultsSTRING = JSON.stringify(defaults)
                await Preferences.set({
                    key: 'localUserProfile',
                    value: defaultsSTRING
                })
                currentUserProfile.value = {}
                currentUserProfile.value = localUserProfileDefault.value
                //set display settings
                setDisplaySettings(localUserProfileDefault.value)
            } else {
                // local storage is set, so set currentUserProfile to the local storage settings                
                currentUserProfile.value = {}
                currentUserProfile.value = JSON.parse(isLocalUserProfile.value)

                //set display settings
                setDisplaySettings(currentUserProfile.value)
            }
            navigateTo('/home')

        } else {
            // if they are a user, get their profile data
            getProfile()

        }
    }
})