import {
    useCurrentUser,
    useCurrentUserProfile
} from '~/composables/states'

export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('checking auth')
    const currentUser = useCurrentUser()
    const currentUserProfile = useCurrentUserProfile()
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
            currentUserProfile.value = data
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

        // if the user is not authorized, redirect them to the login page
        // if they are, get their profile data
        if (!currentUser.value) {
            //no need to redirect because user has access without an account
            //return navigateTo('/')
        } else if (!currentUserProfile.value) {
            getProfile()
        }
    }
})