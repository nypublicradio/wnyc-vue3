const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { getPodcastFromURL } from 'podcast-feed-parser'
import { cmsSources } from '~/composables/globals'
import { estimateMp3Duration } from '~/server/utils/duration'

// handleDuration is a helper function that checks if the estimated duration is available and if not, it estimates it using the audio URL in the estimateMp3Duration function.
const handleDuration = async (estimatedDuration: number, audioURL: string) => {
	if (!estimatedDuration || typeof estimatedDuration !== 'number' || estimatedDuration === 0) {
		return await estimateMp3Duration(audioURL);
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
		};
		const res = await axios(options);
		const resData = humps.camelizeKeys(res.data).data;
		resData.attributes.file = resData.attributes.audio;
		resData.attributes.image = resData.attributes.headers.brand.logoImage.template;
		resData.attributes.duration = await handleDuration(resData.attributes.estimatedDuration, resData.attributes.audio);
		resData.attributes.cardTitle = 'NYC Headlines';
		resData.attributes.showTitle = resData.attributes.channelTitle;
		resData.attributes.type = resData.type;
		resData.attributes.id = resData.id;
		resData.attributes.cmsSource = cmsSources.PUBLISHER;
		resData.attributes.hideFavorite = true;
		return resData.attributes;
	} catch (e) {
		console.error('getLocalNewscast = ', e);
	}
	return null
}
// Get National Newscast from the WNYC API
const getNationalNewscast = async () => {
	try {
		const options = {
			method: 'GET',
			url: `${config.public.PUBLISHER_BASE_API}v3/story/npr-newscast`,
		};
		const res = await axios(options);
		const resData = humps.camelizeKeys(res.data).data;
		const mp3Res = await axios(resData.attributes.audio);
		resData.attributes.newsdate = mp3Res.headers['last-modified'];
		resData.attributes.file = resData.attributes.audio;
		resData.attributes.image = 'https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/npr-news-now.jpeg';
		resData.attributes.duration = await handleDuration(resData.attributes.estimatedDuration, resData.attributes.audio);
		resData.attributes.cardTitle = 'NPR News Now';
		resData.attributes.showTitle = resData.attributes.channelTitle;
		resData.attributes.type = resData.type;
		resData.attributes.id = resData.id;
		resData.attributes.cmsSource = cmsSources.PUBLISHER;
		resData.attributes.hideFavorite = true;
		return resData.attributes;
	} catch (e) {
		console.error('getNationalNewscast = ', e);
	}
	return null
}

// Get NYC-NOW newscast from rss feed
const getNYCNowNewscast = async () => {
	try {
		const feedItems = await getPodcastFromURL(config.public.WNYC_NOW_FEED_URL);
		const item = feedItems.episodes[0];
		const episode = {
			id: 1234567890, // hardcoded ID needed
			file: item.enclosure.url,
			audio: item.enclosure.url,
			duration: item.duration,
			image: feedItems.meta.imageURL,
			cardTitle: feedItems.meta.title,
			showTitle: feedItems.meta.title,
			cmsSource: cmsSources.SIMPLECAST,
			hideFavorite: true,
			newsdate: item.pubDate,
			url: item.link,
		};
		return episode;
	} catch (e) {
		console.error('getNYCNowNewscast = ', e);
	}
	return null
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
	//console.log('getting home page LATEST NEWS data')
	const res = event?.node?.res;
	// WNYC NOW Newscast is only available on weekdays between 7am and 7pm
	// If it is not available, use the local newscast instead.
	const requestTime = new Date();
	const day = requestTime.getDay();
	const hour = requestTime.getHours();
	let local_newscast;
	if (day > 0 && day < 6 && hour > 6 && hour < 19) {
		local_newscast = await getNYCNowNewscast();
	} else {
		local_newscast = await getLocalNewscast();
	}
	const national_newscast = await getNationalNewscast();
	res.setHeader('Cache-Control', 'maxage=120, stale-while-revalidate');
	return {
		local_newscast,
		national_newscast,
	}
})
