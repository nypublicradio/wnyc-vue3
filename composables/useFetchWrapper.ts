import { onMounted } from 'vue'
import { useFetch, useNuxtApp, useRuntimeConfig } from '#app'

/**
 * useFetchWrapper - thin wrapper around useFetch that adds client-side cache expiration.
 *
 * - In local dev: no client cache, always fetches fresh.
 * - In production: caches responses for `maxAge` ms on client-side navigations.
 * - For generated/app builds: refreshes on mount if payload data has no timestamp (stale from build time).
 *
 * @param {string|Function} request - The URL or getter function for the fetch.
 * @param {object} options - All useFetch options, plus:
 *   - maxAge: number (default 300000, 5 min) - how long client-cached data is considered fresh.
 */
export function useFetchWrapper (request, options = {}) {
    const { key, maxAge = 300000, ...rest } = options

    const nuxtApp = useNuxtApp()
    const config = useRuntimeConfig()
    const isLocal = config.public.ENV === 'local'

    const fetchResult = useFetch(request, {
        key,
        // In local dev, omit getCachedData entirely so useFetch always fetches fresh.
        // In production, cache on client navigations for maxAge duration.
        ...(!isLocal && {
            getCachedData: (cacheKey, nuxtApp) => {
                // Always honour payload during hydration to prevent mismatches
                if (nuxtApp.isHydrating) {
                    return nuxtApp.payload.data[cacheKey]
                }

                const cached = nuxtApp.static.data?.[cacheKey]
                if (!cached) return undefined

                const fetchedAt = nuxtApp.payload._fetchedAt?.[cacheKey]
                if (fetchedAt && Date.now() - fetchedAt > maxAge) {
                    return undefined // stale, let useFetch refetch
                }

                return cached
            },
        }),
        ...rest,
    })

    // For generated/app builds: payload data from build time has no _fetchedAt timestamp.
    // Refresh once on mount so users get fresh data after the initial render.
    if (!isLocal) {
        onMounted(() => {
            const cacheKey = fetchResult.key || key
            const fetchedAt = nuxtApp.payload._fetchedAt?.[cacheKey]

            if (!fetchedAt && fetchResult.data.value && fetchResult.status.value !== 'pending') {
                fetchResult.refresh()
            }
        })
    }

    return fetchResult
}
