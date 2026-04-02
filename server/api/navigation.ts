import axios from 'axios'

// Normalize wagtail shows array -> { featuredShowsInMenu: [...] }
function normalizeShowsResponseForMenu (shows: any[] | null) {
    if (!shows) return null
    const normalized = shows.map((show: any) => ({
        id: show.id,
        title: show.title,
        image: show.image?.id ?? show.image,
        type: show.content_type,
        slug: show.url.split('/').filter(Boolean).pop()
    }))
    return { featuredShowsInMenu: normalized }
}

// BFF for fetching the data only for the navigation
async function getNavigationData () {
    const config = useRuntimeConfig()

    try {
        // Fetch all data concurrently with individual error handling
        // Use aggressive timeouts to prevent health check failures during slow API responses
        const API_TIMEOUT = 5000 // 5 second timeout for external APIs
        let allShows = null
        if (process.env.ENV === 'prod') {
            allShows = 90
        } else {
            allShows = 20
        }
        
        const [wagtail, donate, stations, shows] = await Promise.allSettled([
            axios.get(config.public.HEADER_NAVIGATION_API as string, {
                headers: {
                    'X-CMS-Site': process.env.CMS_SITE,
                },
                timeout: API_TIMEOUT
            }),
            axios.get(config.public.SYSTEM_MESSAGES_API as string, {
                headers: {
                    'X-CMS-Site': process.env.CMS_SITE,
                },
                timeout: API_TIMEOUT
            }),
            // Use $fetch for internal API call instead of axios to avoid circular dependency
            Promise.race([
                $fetch('/api/streams').then(data => ({ data })),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), API_TIMEOUT))
            ]),
            axios.get(`${config.public.AVIARY_BASE_API}curated_lists/${allShows}/`, {
                headers: {
                    'X-CMS-Site': process.env.CMS_SITE,
                },
                timeout: API_TIMEOUT
            }),
        ])

        return {
            wagtailResponse: wagtail.status === 'fulfilled' ? wagtail.value.data : null,
            donateResponse: donate.status === 'fulfilled' ? donate.value.data : null,
            stationsResponse: stations.status === 'fulfilled' ? stations.value.data : null,
            showsResponse: shows.status === 'fulfilled' ? normalizeShowsResponseForMenu(shows.value.data.list_items) : null,
        }
    } catch (fetchError) {
        console.error("Failed to fetch or process navigation data:", fetchError)
        return {
            wagtailResponse: null,
            donateResponse: null,
            stationsResponse: null,
            showsResponse: null,
        }
    }
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res
    res.setHeader('Cache-Control', 'max-age=120, stale-while-revalidate')
    
    try {
        const data = await getNavigationData()
        return { data }
    } catch (error) {
        // Return a valid structure even on error
        return {
            data: {
                wagtailResponse: null,
                donateResponse: null,
                stationsResponse: null,
                showsResponse: null,
            }
        }
    }
})