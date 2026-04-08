export default defineEventHandler(async (event) => {
    const path = event.path.split('?')[0]

    // Skip API routes, static assets, and Nuxt internals
    // (no need to skip app routes — the redirect table lookup is cheap and local)
    if (
        path.startsWith('/api/') ||
        path.startsWith('/_nuxt/') ||
        path.startsWith('/_ipx/') ||
        path.startsWith('/__') ||
        path.includes('.') ||
        path === '/'
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


