import axios from 'axios'

// BFF for fetching the data only for the navigation
async function getNavigationData () {
    const config = useRuntimeConfig()

    try {
        // Fetch all data concurrently with individual error handling
        const [wagtail, donate, stations, shows] = await Promise.allSettled([
            axios.get(config.public.HEADER_NAVIGATION_API as string, {
                headers: {
                    'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443'
                }
            }),
            axios.get(config.public.SYSTEM_MESSAGES_API as string, {
                headers: {
                    'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443'
                }
            }),
            axios.get(`${config.public.BFF_URL}/api/streams`),
            axios.get(`${config.public.BFF_URL}/api/v2/showsmenu`),
        ])

        // Log any failures for debugging
        if (wagtail.status === 'rejected') {
            console.warn('HEADER_NAVIGATION_API failed:', config.public.HEADER_NAVIGATION_API, wagtail.reason?.message || wagtail.reason)
        }
        if (donate.status === 'rejected') {
            console.warn('SYSTEM_MESSAGES_API failed:', config.public.SYSTEM_MESSAGES_API, donate.reason?.message || donate.reason)
        }
        if (stations.status === 'rejected') {
            console.warn('BFF streams API failed:', `${config.public.BFF_URL}/api/streams`, stations.reason?.message || stations.reason)
        }
        if (shows.status === 'rejected') {
            console.warn('BFF showsmenu API failed:', `${config.public.BFF_URL}/api/v2/showsmenu`, shows.reason?.message || shows.reason)
        }

        return {
            wagtailResponse: wagtail.status === 'fulfilled' ? wagtail.value.data : null,
            donateResponse: donate.status === 'fulfilled' ? donate.value.data : null,
            stationsResponse: stations.status === 'fulfilled' ? stations.value.data : null,
            showsResponse: shows.status === 'fulfilled' ? shows.value.data : null,
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
    const data = await getNavigationData()

    return { data }
})
