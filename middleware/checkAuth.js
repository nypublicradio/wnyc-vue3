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
                // if first time logging in with new profile
                const lsSTRING = await Preferences.get({ key: 'localUserProfile' })
                const ls = JSON.parse(lsSTRING.value)
                data.initial = false
                data.autodownload = ls.autodownload
                data.default_live_stream = ls.default_live_stream.label
                data.receive_general_notifications = ls.receive_general_notifications
                data.dark_mode = ls.dark_mode
                data.text_size = ls.text_size.label

                // update supabase profile data
                // set the supabase prferences with what is currently set in the local storage
                await client
                    .from('profiles')
                    .update({
                        initial: false,
                        autodownload: ls.autodownload,
                        default_live_stream: ls.default_live_stream.label,
                        receive_general_notifications: ls.receive_general_notifications,
                        dark_mode: ls.dark_mode,
                        text_size: ls.text_size.label,
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