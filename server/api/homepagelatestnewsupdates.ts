const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { estimateMp3Duration } from '~/server/utils/duration'

// handleDuration is a helper function that checks if the estimated duration is available and if not, it estimates it using the audio URL in the estimateMp3Duration function.
const handleDuration = async (estimatedDuration: number, audioURL: string) => {
	if (!estimatedDuration || typeof estimatedDuration !== 'number' || estimatedDuration === 0) {
		return await estimateMp3Duration(audioURL)
	} else {
		return estimatedDuration
	}
}
// Get Local Newscast from the WNYC API
const getLocalNewscast = async () => {
	try {
		const options = {
			method: 'GET',
			url: `${config.public.PUBLISHER_BASE_API}v3/story/latest-newscast/`,
			timeout: 8000,
		}
		const res = await axios(options)
		const resData = humps.camelizeKeys(res.data).data
		resData.attributes.file = resData.attributes.audio
		resData.attributes.image = resData.attributes.headers.brand.logoImage
		resData.attributes.publicationDate = new Date(resData.attributes.newsdate).toUTCString()
		resData.attributes.duration = await handleDuration(resData.attributes.estimatedDuration, resData.attributes.audio)
		resData.attributes.cardTitle = 'NYC Headlines'
		resData.attributes.showTitle = resData.attributes.channelTitle
		resData.attributes.type = resData.type
		resData.attributes.id = resData.id
		resData.attributes.cmsSource = cmsSources.PUBLISHER
		resData.attributes.hideFavorite = true
		return resData.attributes
	} catch (e) {
		console.error('getLocalNewscast = ', e)
	}
	return null
}
// Get National Newscast from the WNYC API
const getNationalNewscast = async () => {
	const hardcodedNprImage = {
		altText: "NPR News Now",
		name: "",
		source: null,
		url: "https://media.wnyc.org/i/500/500/c/80/2023/09/npr-news-now.jpeg",
		h: 500,
		isDisplay: false,
		crop: null,
		caption: "",
		creditsUrl: "",
		w: 500,
		id: 345689,
		creditsName: "",
		template: 'https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/npr-news-now.jpeg'
	}
	try {
		const options = {
			method: 'GET',
			url: `${config.public.PUBLISHER_BASE_API}v3/story/npr-newscast`,
			timeout: 8000,
		}
		const res = await axios(options)
		const resData = humps.camelizeKeys(res.data).data
		// Use HEAD request to get last-modified without downloading the full audio file
		const mp3Res = await axios.head(resData.attributes.audio)
		resData.attributes.newsdate = mp3Res.headers['last-modified']
		resData.attributes.publicationDate = mp3Res.headers['last-modified']
		resData.attributes.file = resData.attributes.audio
		resData.attributes.image = hardcodedNprImage
		resData.attributes.headers.brand.logoImage = hardcodedNprImage
		resData.attributes.duration = await handleDuration(resData.attributes.estimatedDuration, resData.attributes.audio)
		resData.attributes.cardTitle = 'NPR News Now'
		resData.attributes.showTitle = 'NPR'
		resData.attributes.type = resData.type
		resData.attributes.id = resData.id
		resData.attributes.cmsSource = cmsSources.PUBLISHER
		resData.attributes.hideFavorite = true
		return resData.attributes
	} catch (e) {
		console.error('getNationalNewscast = ', e)
	}
	return null
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'max-age=60, stale-while-revalidate=120')
	const [local_newscast, national_newscast] = await Promise.all([
		getLocalNewscast(),
		getNationalNewscast(),
	])
	return {
		local_newscast,
		national_newscast,
	}
})
