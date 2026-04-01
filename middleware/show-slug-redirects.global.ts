let cachedRedirects: { from: string; to: string }[] | null = null
// references the /api/show-slug-redirects redirects list client side. 
export default defineNuxtRouteMiddleware(async (to) => {
    const url = to.path

    try {
        if (!cachedRedirects) {
            cachedRedirects = await $fetch('/api/show-slug-redirects')
        }

        const redirect = cachedRedirects?.find((r) => r.from === url)

        if (redirect) {
            const urlParams = Object.keys(to.query).length ? '?' + new URLSearchParams(to.query as Record<string, string>).toString() : ''
            const newLocation = redirect.to + urlParams

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
})
