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

// Station metadata mapping
const STATION_METADATA = {
    'wnyc-fm939': {
        name: 'WNYC 93.9 FM',
        audio: 'https://fm939.wnyc.org/wnycfm',
        hls: 'https://hls-live.wnyc.org/wnycfmapp-hls.aac/playlist.m3u8',
        imageLogo: 'https://media.wnyc.org/static/img/app-icons/WNYC_iOS_AppIcon_29@3x.png',
    },
    'wqxr': {
        name: 'WQXR 105.9 FM',
        audio: 'https://fm1059.wqxr.org/wqxr',
        hls: 'https://hls-live.wnyc.org/wqxrapp-hls.aac/playlist.m3u8',
        imageLogo: 'https://media.wnyc.org/static/img/app-icons/WQXR_iOS_AppIcon_29@3x.png',
    },
    'q2': {
        name: 'New Sounds',
        audio: 'https://q2stream.wqxr.org/q2',
        hls: 'https://hls-live.wnyc.org/q2app-hls.aac/playlist.m3u8',
        imageLogo: 'https://media.wnyc.org/static/img/app-icons/Q2_iOS_AppIcon_29@3x.png',
    },
    'wqxr-holiday-channel-on-wnyc': {
        name: 'WQXR Holiday Channel',
        audio: 'https://holidaystream.wqxr.org/holiday',
        hls: 'https://hls-live.wnyc.org/holidayapp-hls.aac/playlist.m3u8',
        imageLogo: 'https://media.wnyc.org/static/img/app-icons/WQXR_iOS_AppIcon_29@3x.png',
    },
}

const templatizeImageUrl = (url: string) => {
    if (!url) return null
    // Extract the path after the domain
    const urlParts = url.split('/')
    const filename = urlParts[urlParts.length - 1]
    return `https://media.wnyc.org/i/%s/%s/%s/%s/${filename}`
}

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

const getLivestreams = async () => {
    try {
        // calls v1 api to access source_tags
        const streams_v1_url = `${config.public.PUBLISHER_BASE_API}/v1/list/streams/`
        const res_v1 = await axios(streams_v1_url)
        // filters/selects the streams that include the new-wnyc-app source_tag
        const res_v1_filtered = res_v1.data.results.filter((item) => item.source_tags.includes('new-wnyc-app'))

        // Fetch schedule data for each stream
        const resData = await Promise.all(res_v1_filtered.map(async (stream: any) => {
            try {
                const slug = stream.slug
                const metadata = STATION_METADATA[slug]
                
                if (!metadata) {
                    return null
                }
                
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
                const primaryImage = episodeImages[0]
                
                // Format the data to match the expected structure
                return {
                    cmsSource: 'publisher',
                    slug,
                    station: metadata.name,
                    audio: metadata.audio,
                    file: metadata.audio,
                    hls: metadata.hls,
                    stationImage: { template: templatizeImageUrl(metadata.imageLogo) },
                    image: primaryImage 
                        ? { template: templatizeImageUrl(primaryImage.url) }
                        : { template: templatizeImageUrl(metadata.imageLogo) },
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
                    onTodaysShowImageTemplate: primaryImage ? templatizeImageUrl(primaryImage.url) : null,
                    showSchedule: {
                        'iso-start-time': attrs.start,
                        'iso-end-time': attrs.end,
                    }
                }
            } catch (err: any) {
                return null
            }
        }))
        
        // Filter out any null results from failed fetches
        const validResults = resData.filter(Boolean)
        return humps.camelizeKeys(validResults)
    } catch (e) {
        console.error('Error in getLivestreams:', e)
    }
    return null
}

/**
 * Compress and simplify the global streams data.
 * Reachable /api/streams
 */
export default defineEventHandler(async (event) => {
    const res = event?.node?.res
    res.setHeader('Cache-Control', 'max-age=120, stale-while-revalidate')
    const streams = await getLivestreams()
    return streams
})