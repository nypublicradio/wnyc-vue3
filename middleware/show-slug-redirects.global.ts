let cachedRedirects: { from: string; to: string }[] | null = null

export default defineNuxtRouteMiddleware(async (to) => {
    const config = useRuntimeConfig()
    const url = to.path

    try {
        if (!cachedRedirects) {
            const response = await $fetch("/api/show-slug-redirects")
            // Ensure response is an array
            cachedRedirects = Array.isArray(response) ? response : []
        }

        // Only attempt find if cachedRedirects is a valid array
        const redirect = Array.isArray(cachedRedirects) ? cachedRedirects.find((r) => r.from === url) : undefined
        if (redirect) {
            const urlParams = Object.keys(to.query).length ? `?${new URLSearchParams(to.query as Record<string, string>).toString()}` : ''
            const newLocation = `${redirect.to}${urlParams}`

            if (newLocation.startsWith('http')) {
                if (import.meta.client) {
                    window.open(newLocation, '_blank', 'noopener,noreferrer')
                    return abortNavigation()
                } else {
                    return navigateTo(newLocation, { external: true })
                }
            }

            return navigateTo(newLocation)
        }
    } catch (e) {
        console.error('Failed to process show slug redirect in middleware:', e)
    }

    return undefined
})
