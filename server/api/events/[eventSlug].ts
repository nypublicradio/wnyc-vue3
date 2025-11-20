import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig()

/**
 * Fetches event data from the Wagtail CMS API.
 * @param eventSlug - The slug identifier for the event
 * @returns Promise that resolves to the camelized event data or null if not found
 */
const getWagtailEventData = async (eventSlug: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/${eventSlug}/`,
        }
        const res = await axios(option)
        console.log("Wagtail event data response:", res.data)
        return humps.camelizeKeys(res.data)
    } catch (e) {
        if (e.response && e.response.status === 404) {
            console.error('Event not found:', eventSlug)
        } else {
            console.error('Error fetching event:', e)
        }
    }
    return null
}

export default defineEventHandler(async (event) => {
    const eventSlug: string | undefined = event?.context?.params?.eventSlug
    console.log("Fetching event data for slug:", eventSlug)

    if (eventSlug) {
        const eventData = await getWagtailEventData(eventSlug)

        // Set cache headers - longer cache for past events
        const res = event?.node?.res
        if (eventData?.startDatetime) {
            const eventDate = new Date(eventData.startDatetime)
            const now = new Date()
            const cacheTime = eventDate < now ? 3600 : 1800 // 1 hour for past events, 30 min for future
            res.setHeader('Cache-Control', `maxage=${cacheTime}, stale-while-revalidate`)
        } else {
            res.setHeader('Cache-Control', 'maxage=1800, stale-while-revalidate')
        }

        return eventData
    }

    return null
})