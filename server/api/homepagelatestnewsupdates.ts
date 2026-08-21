const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { estimateMp3Duration } from '~/server/utils/duration'
import { NPR } from '~/server/utils/npr'

const npr = new NPR()
// NPR CDS collection id for the NPR News Now podcast-channel document
const NPR_NEWS_NOW_COLLECTION_ID = '500005'

// handleDuration is a helper function that checks if the estimated duration is available and if not, it estimates it using the audio URL in the estimateMp3Duration function.
const handleDuration = async (estimatedDuration: number, audioURL: string) => {
	if (!estimatedDuration || typeof estimatedDuration !== 'number' || estimatedDuration === 0) {
		return await estimateMp3Duration(audioURL) ?? estimatedDuration
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
		}
		const res = await axios(options)
		const resData = humps.camelizeKeys(res.data).data
		resData.attributes.file = resData.attributes.audio
		resData.attributes.image = resData.attributes.headers.brand.logoImage.template
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
// Get National Newscast (NPR News Now) from the NPR CDS API
const getNationalNewscast = async () => {
	try {
		const nprHeaders = { Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}` }
		const [episodeRes, channelRes] = await Promise.all([
			axios({
				method: 'GET',
				url: `${config.public.NPR_CDS_API}/v1/documents`,
				params: {
					collectionIds: NPR_NEWS_NOW_COLLECTION_ID,
					profileIds: 'podcast-episode,newscast',
					sort: 'publishDateTime:desc',
					limit: 1,
				},
				headers: nprHeaders,
			}),
			axios({
				method: 'GET',
				url: `${config.public.NPR_CDS_API}/v1/documents/${NPR_NEWS_NOW_COLLECTION_ID}`,
				headers: nprHeaders,
			}),
		])
		const episode = episodeRes.data.resources[0]
		// the audio asset lives in the episode's assets map, keyed by an arbitrary asset id
		const audioAsset: any = Object.values(episode.assets ?? {}).find((asset: any) =>
			asset.profiles?.some((profile: any) => profile.href === '/v1/profiles/audio')
		)
		const audioHref = audioAsset?.enclosures?.[0]?.href
		// show artwork lives on the podcast-channel document, not the episode
		const channelImage = npr.findImageUrl(channelRes.data)
		return {
			file: audioHref,
			audio: audioHref,
			image: channelImage?.template ?? channelImage?.href ?? 'https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/npr-news-now.jpeg',
			duration: await handleDuration(audioAsset?.duration, audioHref),
			cardTitle: 'NPR News Now',
			showTitle: episode.title ?? 'NPR News Now',
			newsdate: episode.publishDateTime,
			type: 'podcast-episode',
			id: episode.id,
			cmsSource: cmsSources.NPR,
			hideFavorite: true,
		}
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
	//console.log('getting home page LATEST NEWS data')
	const res = event?.node?.res
	const local_newscast = await getLocalNewscast()
	const national_newscast = await getNationalNewscast()
	res.setHeader('Cache-Control', 'max-age=120, stale-while-revalidate')
	return {
		local_newscast,
		national_newscast,
	}
})
