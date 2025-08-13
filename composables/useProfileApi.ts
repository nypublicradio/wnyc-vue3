interface RecurringDonation {
    springboardId: string
    brand: string
    amount: number
    nextChargeDate: string
    membershipStartDate: string
}

interface ProfileResponse {
    name: string | null
    lastDonationDate: string | null
    lastDonationAmount: number | null
    isActiveSustainer: boolean
    activeRecurringDonations: RecurringDonation[]
}

import { ref, readonly } from 'vue';

export const useProfileApi = () => {
    const config = useRuntimeConfig();
    const { authenticatedFetch } = useAuth();
    const profile = ref(null);
    const loading = ref(false);
    const error = ref(null);

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

            console.log('🔍 Profile API - Making authenticated request with:', requestBody);

            const data = await authenticatedFetch(`${config.public.BFF_URL}/api/profile`, {
                method: 'POST',
                body: requestBody,
            });

            profile.value = data;
            console.log('✅ Profile API - Successfully fetched profile:', data);
            return data;
        } catch (err: any) {
            error.value = err;
            console.error('❌ Profile API error:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const formatCurrency = (amount: number | null): string => {
        if (amount === null) return 'N/A'
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

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
