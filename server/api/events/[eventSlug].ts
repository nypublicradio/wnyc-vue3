import axios from 'axios'
import humps from 'humps'
import { normalizeWagtailEvent } from '~/server/utils/events'

const config = useRuntimeConfig()

const eventFields = [
    'id',
    'title',
    'listing_title',
    'listing_summary',
    'start_datetime',
    'end_datetime',
    'duration',
    'event_image',
    'description',
    'ticket_url',
    'price',
    'event_location',
    'venue_name',
    'event_url',
    'body',
    'tags',
].join(',')

/**
 * Fetches event data from the Wagtail CMS API by ID.
 */
const getWagtailEventById = async (eventId: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/${eventId}/`,
            headers: {
                'X-CMS-Site': config.public.cmsSite
            }
        }
        const res = await axios(option)
        return humps.camelizeKeys(res.data)
    } catch (e) {
        if (e.response && e.response.status === 404) {
            console.error('Event not found:', eventId)
        } else {
            console.error('Error fetching event:', e)
        }
    }
    return null
}

/**
 * Fetches event data from the Wagtail CMS API by slug.
 */
const getWagtailEventBySlug = async (slug: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/`,
            params: {
                type: 'events.EventPage',
                slug,
                fields: eventFields,
                limit: 1,
            },
            headers: {
                'X-CMS-Site': config.public.cmsSite || 'demo.wnyc.org:443'
            }
        }
        const res = await axios(option)
        const data = humps.camelizeKeys(res.data)
        return data?.items?.[0] ?? null
    } catch (e) {
        console.error('Error fetching event by slug:', e)
    }
    return null
}

export default defineEventHandler(async (event) => {
    const eventSlug: string | undefined = event?.context?.params?.eventSlug

    if (eventSlug) {
        const isNumericId = /^\d+$/.test(eventSlug)
        const eventData = isNumericId
            ? await getWagtailEventById(eventSlug)
            : await getWagtailEventBySlug(eventSlug)
        const normalizedEvent = eventData ? normalizeWagtailEvent(eventData) : null

        // Set cache headers - longer cache for past events
        const res = event?.node?.res
        if (normalizedEvent?.startDatetime) {
            const eventDate = new Date(normalizedEvent.startDatetime)
            const now = new Date()
            const cacheTime = eventDate < now ? 3600 : 1800 // 1 hour for past events, 30 min for future
            res.setHeader('Cache-Control', `max-age=${cacheTime}, stale-while-revalidate`)
        } else {
            res.setHeader('Cache-Control', 'max-age=1800, stale-while-revalidate')
        }

        return normalizedEvent
    }

    return null
})
