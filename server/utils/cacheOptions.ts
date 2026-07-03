/**
 * Shared cache utility for defineCachedEventHandler options.
 * Centralizes the shouldBypassCache logic so it doesn't need to be duplicated in every route.
 */

/**
 * Returns true when the server-side cache should be bypassed (local dev environment).
 * Use this in defineCachedEventHandler options:
 *   { shouldBypassCache: shouldBypassServerCache }
 */
export const shouldBypassServerCache = (): boolean => {
    const config = useRuntimeConfig()
    return config.public.ENV === 'local' || config.public.ENV === 'demo'
}
