import { ref, readonly } from 'vue';

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
        formatCurrency,
        formatDate
    }
}
