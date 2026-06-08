import { ref, readonly } from 'vue'
import { until } from '@vueuse/core'
import { Preferences } from '@capacitor/preferences'
import { localUserProfileKey } from '~/composables/globals'
import {
    useCurrentUser,
    useCurrentUserProfile,
} from "~/composables/states"

let inFlightProfileRequest: Promise<any> | null = null

/**
 * Hook providing profile API methods and state.
 * @returns {object} Contains profile, loading, error state and helper functions.
 */
export const useProfileApi = () => {
    const { authenticatedFetch } = useAuth()
    const profile = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const currentUser = useCurrentUser()
    const currentUserProfile = useCurrentUserProfile()

    /**
     * Fetches the user profile by Salesforce ID or email.
     * @param {string} salesforceIdOrEmail - Salesforce ID or email to fetch the profile.
     * @returns {Promise<any>} Resolves to profile data.
     */
    const fetchProfile = async (salesforceIdOrEmail: string) => {
        if (inFlightProfileRequest) {
            return await inFlightProfileRequest
        }

        loading.value = true
        error.value = null
        profile.value = null

        const request = (async () => {
            // Try with Salesforce ID first, then email
            const isEmail = salesforceIdOrEmail.includes('@')
            const requestBody = isEmail
                ? { email: salesforceIdOrEmail }
                : { salesforceID: salesforceIdOrEmail }
            const config = useRuntimeConfig()
            const data = await authenticatedFetch(`${config.public.BFF_URL}/api/profile`, {
                method: 'POST',
                body: requestBody,
            })
            profile.value = data

            // Save isActiveSustainer to localUserProfile in CapacitorStorage
            if (import.meta.client && data?.isActiveSustainer !== undefined) {
                const localProfileString = await Preferences.get({ key: localUserProfileKey })
                if (localProfileString.value) {
                    const localProfile = JSON.parse(localProfileString.value)
                    localProfile.isActiveSustainer = data.isActiveSustainer
                    await Preferences.set({
                        key: localUserProfileKey,
                        value: JSON.stringify(localProfile)
                    })
                }
            }

            return data
        })()

        inFlightProfileRequest = request

        try {
            return await request
        } catch (err: any) {
            error.value = err
            // 503 from the BFF typically means the user has no membership/Salesforce profile — not a real error
            if (err?.statusCode === 503 || err?.status === 503) {
                console.warn('No membership profile found for this user (503 from BFF)')
            } else {
                console.error('Failed to fetch profile:', err)
            }
            loading.value = false
            profile.value = {}
            return {}
        } finally {
            inFlightProfileRequest = null
            loading.value = false
        }
    }


    const getMembershipInfo = async () => {
        const authComposable = useAuth()
        await nextTick()

        if (!authComposable.isAuthenticated.value) {
            // Try to initialize JWT from existing Supabase session
            const initialized = await authComposable.initializeFromSupabaseSession()
            if (!initialized) {
                console.warn("getMembershipInfo: No valid auth session available")
                return
            }
        }

        // Wait for currentUserProfile to be populated with salesforce_id
        // This ensures getAndSetUserProfile() has completed its initialization
        try {
            await until(currentUserProfile).toMatch(
                v => v !== null && (v as any)?.salesforce_id,
                { timeout: 10000 }
            )
        } catch (error) {
            console.warn("Timeout waiting for currentUserProfile.salesforce_id to be populated")
            // Continue anyway - will fall back to email if available
        }

        // Now try to fetch profile data if we have auth
        if (authComposable.isAuthenticated.value) {
            // Fetch profile data from /api/profile if user has a Salesforce ID
            if (currentUserProfile.value?.salesforce_id) {
                await fetchProfile(currentUserProfile.value.salesforce_id)
            } else if (currentUser.value?.email) {
                await fetchProfile(currentUser.value.email)
            } else {
                // No Salesforce ID or email found
            }
        } else {
            // No authentication available. Do something like redirect to login.
            console.error("No authentication available", JSON.stringify(authComposable.isAuthenticated.value))
            //navigateTo("/login")
        }
    }

    /**
     * Formats a number as USD currency string.
     * @param {number|null} amount - Amount to format.
     * @returns {string} Formatted currency string or 'N/A' if null.
     */
    const formatCurrency = (amount: number | null): string => {
        if (amount === null) return 'N/A'
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    /**
     * Formats a date string into a human-readable date.
     * @param {string|null} dateString - Date string to format.
     * @returns {string} Formatted date string or 'N/A' if null or empty.
     */
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return {
        profile: readonly(profile),
        loading: readonly(loading),
        error: readonly(error),
        fetchProfile,
        getMembershipInfo,
        formatCurrency,
        formatDate
    }
}
