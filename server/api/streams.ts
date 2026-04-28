/**
 * Streams API - Fetches live stream data using the Rapid Schedule API
 * 
 * This endpoint:
 * 1. Gets the list of streams with 'new-wnyc-app' tag from the Publisher v1 API
 * 2. Fetches schedule data for each stream from the Schedule API (S3/Rapid Schedule)
 * 3. Determines the currently playing episode based on the current time
 * 4. Returns formatted stream data with current show information
 * 
 * Note: This endpoint uses the Schedule API instead of the deprecated What's On API
 * 
 * Reachable at: /api/streams
 */

const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { useVImage } from '~/composables/useVImage'

interface LivestreamCacheEntry {
    data: any
    expiresAt: number
}

const LIVESTREAM_CACHE_TTL = 2 * 60 * 1000
const livestreamCache = new Map<string, LivestreamCacheEntry>()

// Station metadata mapping
const STATION_METADATA = {
    'wnyc-fm939': {
        name: 'WNYC 93.9 FM',
        audio: 'https://fm939.wnyc.org/wnycfm',
        hls: 'https://hls-live.wnyc.org/wnycfmapp-hls.aac/playlist.m3u8',
        imageLogo: 'https://media.wnyc.org/i/%s/%s/%s/%s/1/wnyc_2_1.png',
    },
    'wqxr': {
        name: 'WQXR 105.9 FM',
        audio: 'https://stream.wqxr.org/wqxr',
        hls: 'https://hls-live.wnyc.org/wqxr48-hls/playlist.m3u8',
        imageLogo: 'https://media.wnyc.org/i/%s/%s/%s/%s/1/wqxr_1_1.png',
    },
    'q2': {
        name: 'New Sounds',
        audio: 'https://q2stream.wqxr.org/q2',
        hls: 'https://hls-live.wnyc.org/q248-hls/playlist.m3u8',
        imageLogo: 'https://media.wnyc.org/i/%s/%s/%s/%s/1/ns_showcard-newsounds-radio-1.jpg',
    },
    'wqxr-holiday-channel-on-wnyc': {
        name: 'WQXR Holiday Channel',
        audio: 'https://stream.wqxr.org/qxr-special',
        hls: 'https://hls-live.wnyc.org/qxr-special-hls.aac/playlist.m3u8',
        imageLogo: 'https://media.wnyc.org/i/%s/%s/%s/%s/1/wqxr_1_1.png',
    },
}

// Helper function to get the current episode from schedule data
const getCurrentEpisodeFromSchedule = (scheduleData: any) => {
    if (!scheduleData || !Array.isArray(scheduleData)) {
        return null
    }

    const now = new Date()

    // Find the episode that is currently airing
    const currentEpisode = scheduleData.find((episode: any) => {
        const startTime = new Date(episode.attributes.start)
        const endTime = new Date(episode.attributes.end)
        return now >= startTime && now < endTime
    })

    return currentEpisode || scheduleData[0] // Fallback to first episode if no current match
}

// currently a combination between the whatson API and the schedule API to populate the live stream data
const getLivestreams = async (slug?: string | null) => {
    try {
        // calls v1 api to access source_tags
        const streams_v1_url = `${config.public.PUBLISHER_BASE_API}/v1/list/streams/`
        const res_v1 = await axios(streams_v1_url)
        // filters/selects the streams that include the new-wnyc-app source_tag
        const res_v1_filtered = res_v1.data.results.filter((item) => item.source_tags.includes('new-wnyc-app'))

        // If a slug was requested, narrow the list to just that stream
        const streamsToFetch = slug
            ? res_v1_filtered.filter((stream: any) => stream.slug === slug)
            : res_v1_filtered

        // Fetch schedule data for each stream
        const resData = await Promise.all(streamsToFetch.map(async (stream: any) => {

            const { templatizePublisherImageUrl } = useVImage()
            try {
                const slug = stream.slug
                const metadata = STATION_METADATA[slug]

                if (!metadata) {
                    return null
                }
                const stationImage = { cmsSource: 'publisher', template: metadata.imageLogo || templatizePublisherImageUrl(stream.image_logo), url: stream.image_logo }
                // Fetch schedule data from the schedule API
                const scheduleUrl = `${config.public.BFF_URL}/api/schedule/${slug}?filterMode=next24hours`
                const scheduleRes = await axios(scheduleUrl)

                // Get the current episode from the schedule
                const currentEpisode = getCurrentEpisodeFromSchedule(scheduleRes.data)

                if (!currentEpisode) {
                    return null
                }

                const attrs = currentEpisode.attributes
                const episodeImages = attrs.images || []
                // find first image that has a url in the array of episode images
                const primaryImage = episodeImages.find((img: any) => img.url)

                // Format the data to match the expected structure
                return {
                    cmsSource: 'publisher',
                    slug,
                    station: metadata.name,
                    audio: metadata.audio,
                    file: metadata.audio,
                    hls: metadata.hls,
                    stationImage,
                    image: primaryImage
                        ? primaryImage.url
                        : stationImage,
                    showTitle: attrs.parentTitle || attrs.scheduleEventTitle || 'Live Stream',
                    title: attrs.parentTitle || attrs.scheduleEventTitle || 'Live Stream',
                    episodeTitle: attrs.scheduleEventTitle || null,
                    showSlug: attrs.showId || null,
                    id: currentEpisode.id,
                    details: attrs.longDescription || '',
                    detailsLink: attrs.parentUrl || null,
                    titleLink: attrs.parentUrl || null,
                    episodeLink: attrs.scheduleEventUrl || null,
                    timeStart: attrs.start,
                    timeEnd: attrs.end,
                    type: 'live',
                    updated_date: null,
                    publishAt: null,
                    first_published_at: null,
                    onTodaysShowHeadline: attrs.scheduleEventTitle || null,
                    onTodaysShowHeadlineLink: attrs.scheduleEventUrl || null,
                    onTodaysShowImage: primaryImage?.url ?? null,
                    onTodaysShowImageMaxWidth: primaryImage?.width ?? null,
                    onTodaysShowImageMaxHeight: primaryImage?.height ?? null,
                    onTodaysShowImageTemplate: primaryImage ? templatizePublisherImageUrl(primaryImage.url) : null,
                    showSchedule: {
                        'iso-start-time': attrs.start,
                        'iso-end-time': attrs.end,
                    }
                }
            } catch (err: any) {
                console.error('Error in scheduleUrl fetch:', err)
                return null
            }
        }))

        // Filter out any null results from failed fetches
        const validResults = resData.filter(Boolean)
        const camelized = humps.camelizeKeys(validResults)
        // If a specific slug was requested, return the single object instead of an array
        return slug ? (camelized[0] ?? null) : camelized
    } catch (e) {
        console.error('Error in getLivestreams:', e)
    }
    return null
}

/**
 * Calculates a livestream cache TTL that expires at the next stream end time.
 */
const getLivestreamCacheTtl = (streams: any, nowMs = Date.now()) => {
    const streamArray = Array.isArray(streams) ? streams : [streams]
    const endTimes = streamArray
        .map((stream: any) => stream?.timeEnd)
        .map((dateString: string) => new Date(dateString).getTime())
        .filter((time: number) => Number.isFinite(time) && time > nowMs)

    if (endTimes.length === 0) {
        return 0
    }

    return Math.max(0, Math.min(LIVESTREAM_CACHE_TTL, Math.min(...endTimes) - nowMs))
}

/**
 * Applies response cache headers for livestream API responses.
 */
const setLivestreamCacheHeaders = (res: any, ttlMs: number) => {
    const maxAgeSeconds = Math.floor(ttlMs / 1000)

    if (maxAgeSeconds <= 0) {
        res.setHeader('Cache-Control', 'no-store')
        return
    }

    res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, must-revalidate`)
}

/**
 * Compress and simplify the global streams data.
 * Reachable /api/streams
 */
export default defineEventHandler(async (event) => {
    const res = event?.node?.res
    const slug = getQuery(event).slug as string | undefined
    const cacheKey = slug || 'all'
    const now = Date.now()
    const cachedEntry = livestreamCache.get(cacheKey)

    if (cachedEntry && now < cachedEntry.expiresAt) {
        setLivestreamCacheHeaders(res, cachedEntry.expiresAt - now)
        return cachedEntry.data
    }

    const streams = await getLivestreams(slug)
    const cacheTtl = getLivestreamCacheTtl(streams, now)

    if (cacheTtl > 0) {
        livestreamCache.set(cacheKey, {
            data: streams,
            expiresAt: now + cacheTtl,
        })
    }

    setLivestreamCacheHeaders(res, cacheTtl)

    return streams
})
