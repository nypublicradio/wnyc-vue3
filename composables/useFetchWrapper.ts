import { onMounted } from 'vue'
import { useFetch } from '#app'

/**
 * useFetchWrapper - a composable to standardize Nuxt useFetch usage with SSR cache, error handling, and optional auto-refresh.
 *
 * @param {string|Function} request - The URL or function returning the URL for the fetch.
 * @param {object} options - Options to pass to useFetch. Supports all useFetch options plus:
 *   - autoRefresh: boolean (default true) - if true, will auto-refresh on mount if data is missing or errored.
 *   - logKey: boolean (default false) - if true, logs the cache key and payload for debugging.
 *   - maxAge: number (default 0) - if > 0, cached data older than this (in ms) will be refetched.
 * @returns {object} - The same as useFetch, but with standardized caching and refresh logic.
 */
export function useFetchWrapper (request, options = {}) {
    const {
        key,
        autoRefresh = true,
        logKey = false,
        shallow = true,
        maxAge = 0,
        ...rest
    } = options

    const fetchOptions = {
        key,
        shallow,
        // Always provide getCachedData to leverage Nuxt's payload cache on client-side navigation.
        getCachedData: (cacheKey, nuxtApp) => {
            const cached = nuxtApp.isHydrating
                ? nuxtApp.payload.data[cacheKey]
                : nuxtApp.static.data?.[cacheKey]

            if (logKey) {
                // skipcq: JS
                console.log('[useFetchWrapper] getCachedData', cacheKey, cached)
            }

            if (!cached) return undefined

            // If maxAge is set, check if the cached data has expired
            if (maxAge > 0) {
                const fetchedAt = nuxtApp.payload._fetchedAt?.[cacheKey]
                if (fetchedAt && Date.now() - fetchedAt > maxAge) {
                    return undefined // Expired, refetch
                }
            }

            return cached
        },
        ...rest,
    }

    // Call useFetch with standardized getCachedData
    const fetchResult = useFetch(request, fetchOptions)

    // Auto-refresh on mount if data is missing or errored
    if (autoRefresh) {
        onMounted(() => {
            if (!fetchResult.data.value || fetchResult.status.value === 'error') {
                fetchResult.refresh()
            }
        })
    }

    // Workaround: When Nuxt loads payload data from cache during client-side navigation, 
    // it leaves status as 'idle' instead of 'success', causing skeletons to hang.
    if (fetchResult.status.value === 'idle' && fetchResult.data.value) {
        fetchResult.status.value = 'success'
    }

    return fetchResult
}
