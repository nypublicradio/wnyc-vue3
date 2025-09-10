import { ref, readonly } from 'vue';
import { until } from '@vueuse/core';
import {
    useCurrentUser,
    useCurrentUserProfile,
} from "~/composables/states"

/**
 * Hook providing profile API methods and state.
 * @returns {object} Contains profile, loading, error state and helper functions.
 */
export const useProfileApi = () => {
    const config = useRuntimeConfig();
    const { authenticatedFetch } = useAuth();
    const profile = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const currentUser = useCurrentUser()
    const currentUserProfile = useCurrentUserProfile()

    /**
     * Fetches the user profile by Salesforce ID or email.
     * @param {string} salesforceIdOrEmail - Salesforce ID or email to fetch the profile.
     * @returns {Promise<any>} Resolves to profile data.
     */
    const fetchProfile = async (salesforceIdOrEmail: string) => {
        loading.value = true;
        error.value = null;
        profile.value = null;

        try {
            // Try with Salesforce ID first, then email
            const isEmail = salesforceIdOrEmail.includes('@');
            const requestBody = isEmail
                ? { email: salesforceIdOrEmail }
                : { salesforceID: salesforceIdOrEmail };

            const data = await authenticatedFetch(`${config.public.BFF_URL}/api/profile`, {
                method: 'POST',
                body: requestBody,
            });

            profile.value = data;
            return data;
        } catch (err: any) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };


    const getMembershipInfo = async () => {
        // Check if we have an auth token, if not try to initialize it
        const authComposable = useAuth()

        if (!authComposable.isAuthenticated.value) {
            // No JWT token found
            try {
                const supabase = useSupabaseClient()
                const { data: sessionData } = await supabase.auth.getSession()

                if (sessionData.session) {
                    // Convert Supabase session to JWT
                    const jwtResponse = await $fetch("/api/auth/session-to-jwt", {
                        method: "POST",
                        body: {
                            access_token: sessionData.session.access_token,
                            refresh_token: sessionData.session.refresh_token,
                        },
                    })

                    if (jwtResponse.success && jwtResponse.token) {
                        authComposable.setAuthState(
                            jwtResponse.token,
                            jwtResponse.user,
                            sessionData.session.refresh_token
                        )
                    }
                } else {
                    // no supabase session, route to login
                    navigateTo("/login")
                }
            } catch (error) {
                console.error("🐛 Dashboard Debug - Failed to initialize JWT from session:", error)
            }
        }
        // Wait for currentUser to be populated (with 10 second timeout)
        try {
            await until(currentUser).toMatch(v => v !== null, { timeout: 10000 })
        } catch (error) {
            console.warn("Timeout waiting for currentUser to be populated")
            return
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
            navigateTo("/login")
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
