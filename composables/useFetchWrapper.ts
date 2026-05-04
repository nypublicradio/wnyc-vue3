import { onMounted } from 'vue'
import { useFetch } from '#app'

/**
 * useFetchWrapper - a composable to standardize Nuxt useFetch usage with SSR cache, error handling, and optional auto-refresh.
 *
 * @param {string|Function} request - The URL or function returning the URL for the fetch.
 * @param {object} options - Options to pass to useFetch. Supports all useFetch options plus:
 *   - autoRefresh: boolean (default true) - if true, will auto-refresh on mount if data is missing or errored.
 *   - logKey: boolean (default false) - if true, logs the cache key and payload for debugging.
 * @returns {object} - The same as useFetch, but with standardized caching and refresh logic.
 */
export function useFetchWrapper (request, options = {}) {
    const {
        key,
        autoRefresh = true,
        logKey = false,
        ...rest
    } = options

    const fetchOptions = {
        key,
        ...rest,
    }

    if (logKey) {
        fetchOptions.getCachedData = (key, nuxtApp) => {
            const data = nuxtApp.isHydrating ? nuxtApp.payload.data[key] : nuxtApp.static.data?.[key]
            // eslint-disable-next-line no-console
            console.log('[useFetchWrapper] getCachedData', key, data)
            return data
        }
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

    return fetchResult
}
