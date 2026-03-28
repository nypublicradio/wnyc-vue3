export default defineEventHandler(async (event) => {
    // Prevent circular request: this middleware intercepts all routes including the API route below
    if (event.path.startsWith('/api/show-slug-redirects')) return

    const url = event.path.split('?')[0]
    let urlParams = null
    if (event.path.includes('?')) {
        urlParams = `?${event.path.split('?')[1]}`
    }

    // Fetch redirect table from server API so updates are picked up without a new app build
    const redirects = await $fetch('/api/show-slug-redirects') as { from: string; to: string }[]

    const redirect = redirects?.find(r => r.from === url)
    if (redirect) {
        const newLocation = urlParams ? redirect.to + urlParams : redirect.to
        await sendRedirect(event, newLocation, 301)
    }
})


