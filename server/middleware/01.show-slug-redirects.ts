export default defineEventHandler(async (event) => {
    const path = event.path.split('?')[0]

    // Skip API routes, static assets, and Nuxt internals — same as check-page-exists
    if (
        path.startsWith('/api/') ||
        path.startsWith('/_nuxt/') ||
        path.startsWith('/__') ||
        path.endsWith('_payload.json') ||
        path === '/' ||
        path === '/home' ||
        // Skip known Nuxt page routes that don't exist in Wagtail
        path.startsWith('/browse') ||
        path.startsWith('/events') ||
        path.startsWith('/story') ||
        path.startsWith('/npr') ||
        path.startsWith('/people') ||
        path.startsWith('/staff') ||
        path.startsWith('/archives') ||
        path === '/dashboard' ||
        path === '/saved' ||
        path === '/login' ||
        path === '/signup' ||
        path === '/confirm' ||
        path === '/forgot-password' ||
        path === '/live' ||
        path === '/mobile' ||
        path === '/preview'
    ) {
        return
    }

    const urlParams = event.path.includes('?') ? `?${event.path.split('?')[1]}` : null

    // Fetch redirect table from server API so updates are picked up without a new app build
    const redirects = await $fetch('/api/show-slug-redirects') as { from: string; to: string }[]

    const redirect = redirects?.find(r => r.from === path)
    if (redirect) {
        const newLocation = urlParams ? redirect.to + urlParams : redirect.to
        await sendRedirect(event, newLocation, 301)
    }
})


