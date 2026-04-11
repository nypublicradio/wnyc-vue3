import { onMounted } from 'vue'
import { useFetch } from '#app'

// Exportable SSR detection based on NUXT_SSR env var
export const isSSR = process.env.NUXT_SSR === 'true' || process.env.NUXT_SSR === true
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
        getCachedData,
        autoRefresh = true,
        logKey = false,
        ...rest
    } = options

    // Standardized getCachedData: always use Nuxt payload cache
    const wrappedGetCachedData = (key, nuxtApp) => {
        if (logKey) {
            // eslint-disable-next-line no-console
            console.log('[useFetchWrapper] getCachedData', key, nuxtApp.payload.data[key])
        }
        return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }

    // Call useFetch with standardized getCachedData
    const fetchResult = useFetch(request, {
        key,
        getCachedData: wrappedGetCachedData,
        ...rest,
    })

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
