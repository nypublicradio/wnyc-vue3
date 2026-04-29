/**
 * What's On API - Fetches current schedule data for a specific station
 * 
 * This endpoint:
 * 1. Accepts a station slug as a parameter (e.g., 'wnyc-fm939', 'wqxr')
 * 2. Fetches schedule data from the Schedule API (S3/Rapid Schedule)
 * 3. Determines the currently playing episode based on the current time
 * 4. Returns formatted data with current show information and stream URLs
 * 
 * Note: This endpoint uses the Schedule API instead of the deprecated What's On API
 * 
 * Reachable at: /api/whatson/[stationslug]
 */

import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'

const config = useRuntimeConfig()

interface WhatsOnCacheEntry {
	data: any
	expiresAt: number
}

const WHATSON_CACHE_TTL = 2 * 60 * 1000
const whatsOnCache = new Map<string, WhatsOnCacheEntry>()

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

// Helper function to convert image URLs to a templated format for responsive images
const templatizeImageUrl = (url: string) => {
    if (!url) return null
    const urlParts = url.split('/')
    const filename = urlParts[urlParts.length - 1]
    return `https://media.wnyc.org/i/%s/%s/%s/%s/${filename}`
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

// Fetch the livestream data from the Schedule API
const getLivestream = async (slug: string) => {
	try {
		const metadata = STATION_METADATA[slug]
		
		if (!metadata) {
			console.error(`No metadata found for stream ${slug}`)
			throw new Error(`Station ${slug} not supported`)
		}
		
		// Fetch schedule data from the schedule API
		const scheduleUrl = `${config.public.BFF_URL}/api/schedule/${slug}?filterMode=next24hours`
		const scheduleRes = await axios(scheduleUrl)
		
		// Get the current episode from the schedule
		const currentEpisode = getCurrentEpisodeFromSchedule(scheduleRes.data)
		
		if (!currentEpisode) {
			console.warn(`No current episode found for ${slug}`)
			throw new Error(`No current episode found for ${slug}`)
		}
		
		const attrs = currentEpisode.attributes
		const episodeImages = attrs.images || []
		const primaryImage = episodeImages[0]
		
		// Format the data to match the expected structure
		const formattedData = {
			cmsSource: cmsSources.PUBLISHER,
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
			episodeBody: null,
			episodeTranscript: null,
			timeStart: attrs.start,
			timeEnd: attrs.end,
			type: 'live',
			updated_date: null,
			publishAt: null,
			first_published_at: null,
			onTodaysShowHeadline: attrs.scheduleEventTitle || null,
			onTodaysShowHeadlineLink: attrs.scheduleEventUrl || null,
			onTodaysShowHosts: null,
			onTodaysShowImage: primaryImage?.url ?? null,
			onTodaysShowImageMaxWidth: primaryImage?.width ?? null,
			onTodaysShowImageMaxHeight: primaryImage?.height ?? null,
			onTodaysShowImageTemplate: primaryImage ? templatizeImageUrl(primaryImage.url) : null,
			onTodaysShowImageAltText: null,
			onTodaysShowImageCaption: null,
			onTodaysShowImageCredits: null,
			onTodaysShowImageCreditsUrl: null,
			onTodaysShowSegments: null,
			onTodaysShowSocial: null,
			showSchedule: {
				'iso-start-time': attrs.start,
				'iso-end-time': attrs.end,
			}
		}
		
		return humps.camelizeKeys(formattedData)
	} catch (error) {
		console.error(`Error fetching schedule data for ${slug}:`, error.message)
		throw error
	}
}

/**
 * Calculates a whats-on cache TTL that expires when the current item ends.
 */
const getWhatsOnCacheTtl = (livestream: any, nowMs = Date.now()) => {
	const endTime = new Date(livestream?.timeEnd).getTime()
	if (!Number.isFinite(endTime) || endTime <= nowMs) {
		return 0
	}

	return Math.max(0, Math.min(WHATSON_CACHE_TTL, endTime - nowMs))
}

/**
 * Applies response cache headers for whats-on API responses.
 */
const setWhatsOnCacheHeaders = (res: any, ttlMs: number) => {
	const maxAgeSeconds = Math.floor(ttlMs / 1000)

	if (maxAgeSeconds <= 0) {
		res.setHeader('Cache-Control', 'no-store')
		return
	}

	res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, must-revalidate`)
}
// Fetch the livestream data from the API
// const getLivestreamHlsMetadataTemp = async () => {

// 	const stream = "https://hls-live.wnyc.org/wnycfmapp-hls.aac/playlist.m3u8";

// 	const playlistResponse = await axios.get(stream);
// 	console.log('Playlist Response:', playlistResponse);
// 	const playlist = parse(playlistResponse.data);

// 	if (playlist.isMasterPlaylist) {
// 		console.log('Master Playlist detected');

// 		// Get the first variant (or you can select a specific one based on bandwidth/resolution)
// 		const variant = playlist.variants[0];

// 		// Make sure the URI is absolute (some playlists use relative URLs)
// 		const variantUri = new URL(variant.uri, stream).toString();

// 		// Fetch the media playlist
// 		const mediaPlaylistResponse = await axios.get(variantUri);
// 		const mediaPlaylist = parse(mediaPlaylistResponse.data);

// 		//console.log('Media Playlist =', mediaPlaylist);
// 	} else {
// 		// Already a media playlist
// 		//console.log('Media Playlist =', playlist);
// 	}
// 	//console.log('Playlist Metadata:', playlistMetaData);

// 	// if (playlistMetaData.isMasterPlaylist && playlistMetaData.variants.length > 0) {
// 	// 	const variantUri = playlistMetaData.variants[0].uri;
// 	// 	const mediaPlaylistResponse = await axios.get(variantUri);
// 	// 	const mediaPlaylistMetaData = HLS.parse(mediaPlaylistResponse.data);
// 	// 	//console.log('Media Playlist Metadata:', mediaPlaylistMetaData);
// 	// }
// }

export default defineEventHandler(async (event) => {

	//getLivestreamHlsMetadataTemp()

	const res = event?.node?.res

	const slug: string | undefined = event?.context?.params?.stationslug;
	if (slug) {
		try {
			const now = Date.now()
			const cachedEntry = whatsOnCache.get(slug)

			if (cachedEntry && now < cachedEntry.expiresAt) {
				setWhatsOnCacheHeaders(res, cachedEntry.expiresAt - now)
				return cachedEntry.data
			}

			const livestream = await getLivestream(slug);
			const cacheTtl = getWhatsOnCacheTtl(livestream, now)

			if (cacheTtl > 0) {
				whatsOnCache.set(slug, {
					data: livestream,
					expiresAt: now + cacheTtl,
				})
			}

			setWhatsOnCacheHeaders(res, cacheTtl)
			return livestream;
		} catch (error) {
			console.error(`Failed to get livestream for slug "${slug}":`, error)
			throw createError({
				statusCode: 500,
				statusMessage: `Failed to fetch livestream data for ${slug}`,
			})
		}
	}
	console.error('No slug provided to whatson endpoint')
	throw createError({
		statusCode: 400,
		statusMessage: 'Station slug is required',
	})
});
