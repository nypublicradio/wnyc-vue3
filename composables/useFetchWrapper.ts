import { onMounted } from 'vue'
import { useFetch, useNuxtApp, useRuntimeConfig } from '#app'

/**
 * useFetchWrapper - a composable to standardize Nuxt useFetch usage with SWR-style refresh.
 *
 * @param {string|Function} request - The URL or function returning the URL for the fetch.
 * @param {object} options - Options to pass to useFetch. Supports all useFetch options plus:
 *   - autoRefresh: boolean (default true) - if true, will refresh on mount when data is stale or missing.
 *   - logKey: boolean (default false) - if true, logs the cache key and payload for debugging.
 *   - maxAge: number (default 300000, 5 min) - cached data older than this (in ms) triggers a background refresh on mount.
 * @returns {object} - The same as useFetch, but with standardized caching and refresh logic.
 */
export function useFetchWrapper (request, options = {}) {
    const {
        key,
        autoRefresh = true,
        logKey = false,
        shallow = true,
        maxAge = 300000, // 5 minutes in ms
        ...rest
    } = options

    const nuxtApp = useNuxtApp()
    const config = useRuntimeConfig()
    const isLocal = config.public.ENV === 'local'

    const fetchOptions = {
        key,
        shallow,
        getCachedData: (cacheKey, nuxtApp) => {
            // Always use cached data during hydration to prevent mismatches
            if (nuxtApp.isHydrating) {
                return nuxtApp.payload.data[cacheKey]
            }

            const cached = nuxtApp.static.data?.[cacheKey]

            if (logKey) {
                console.log('[useFetchWrapper] getCachedData', cacheKey, cached)
            }

            if (!cached) return undefined

            // In local dev, skip client cache so navigations always fetch fresh
            if (isLocal) return undefined

            // Check staleness
            const fetchedAt = nuxtApp.payload._fetchedAt?.[cacheKey]
            if (fetchedAt && Date.now() - fetchedAt > maxAge) {
                return undefined
            }

            return cached
        },
        ...rest,
    }

    const fetchResult = useFetch(request, fetchOptions)

    // After hydration, refresh stale data in the background
    if (autoRefresh) {
        onMounted(() => {
            if (!fetchResult.data.value || fetchResult.status.value === 'error') {
                fetchResult.refresh()
                return
            }

            // In local dev, always refresh on mount for fresh data
            if (isLocal) {
                fetchResult.refresh()
                return
            }

            // In production, refresh if data is stale
            const cacheKey = fetchResult.key || key
            const fetchedAt = nuxtApp.payload._fetchedAt?.[cacheKey]
            const isStale = !fetchedAt || Date.now() - fetchedAt > maxAge
            if (isStale && fetchResult.status.value !== 'pending') {
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
