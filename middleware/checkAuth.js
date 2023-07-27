import {
    useCurrentUser,
    useCurrentUserProfile,
    useLocalUserProfileDefault
} from '~/composables/states'
import { setFontSize, setDarkMode, getTextSizePixel } from '~/utilities/helpers'
export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('checking auth')
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
            console.log('data = ', data)
            currentUserProfile.value = data
            //set display settings
            setFontSize(getTextSizePixel(data.text_size))
            setDarkMode(data.dark_mode)
        }
    }

    // check local storage for the auth token
    if (process.client) {
        const supabaseAuthToken = JSON.parse(
            localStorage.getItem(config.supabaseAuthTokenName)
        )
        if (supabaseAuthToken) {
            currentUser.value = supabaseAuthToken.user
        }

        // check supabase session for logged in user
        if (user?.data?.session?.user) {
            currentUser.value = user?.data?.session?.user
        }


        if (!currentUser.value) {
            // initially set default user profile settings or use the local storage settings

            // does local storage settings exist?
            if (!localStorage.getItem('localUserProfile')) {
                // no, set defaults from localUserProfileDefault state
                localStorage.setItem(
                    'localUserProfile',
                    JSON.stringify(localUserProfileDefault.value)
                )
                currentUserProfile.value = {}
                currentUserProfile.value = localUserProfileDefault.value
                //set display settings
                setFontSize(getTextSizePixel(localUserProfileDefault.value.text_size))
                setDarkMode(localUserProfileDefault.value.dark_mode)
            } else {
                // local storage is set, so set currentUserProfile to the local storage settings

                currentUserProfile.value = {}
                currentUserProfile.value = JSON.parse(
                    localStorage.getItem('localUserProfile')
                )
                //set display settings
                setFontSize(getTextSizePixel(currentUserProfile.value.text_size))
                setDarkMode(currentUserProfile.value.dark_mode)
            }


        } else {
            // if they are a user, get their profile data
            getProfile()

        }
    }
})