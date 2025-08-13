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

export const useProfileApi = () => {
    const config = useRuntimeConfig()
    const profileData = ref<ProfileResponse | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const fetchProfile = async (salesforceId?: string, email?: string) => {
        // Allow lookup by either Salesforce ID or email
        if (!salesforceId && !email) {
            error.value = 'Either Salesforce ID or email is required'
            return null
        }

        isLoading.value = true
        error.value = null

        try {
            const body: any = {}
            if (salesforceId) {
                body.salesforceId = salesforceId
            }
            if (email) {
                body.email = email
            }

            const response = await $fetch(`${config.public.BFF_URL}/api/profile`, {
                method: 'POST',
                body
            }) as ProfileResponse

            profileData.value = response
            return response
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch profile data'
            console.error('Profile API error:', err)
            return null
        } finally {
            isLoading.value = false
        }
    }

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
        profileData: readonly(profileData),
        isLoading: readonly(isLoading),
        error: readonly(error),
        fetchProfile,
        formatCurrency,
        formatDate
    }
}
