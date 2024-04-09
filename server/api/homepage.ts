const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { normalizeArticlePage, normalizePublisherPage } from '~/composables/data/articlePages'
import { estimateMp3Duration } from '~/server/utils/duration'

// handleDuration is a helper function that checks if the estimated duration is available and if not, it estimates it using the audio URL in the estimateMp3Duration function.
const handleDuration = async (estimatedDuration: number, audioURL: string) => {
	if (!estimatedDuration || typeof estimatedDuration !== 'number' || estimatedDuration === 0) {
		return await estimateMp3Duration(audioURL);
	} else {
		return estimatedDuration
	}
}

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
		////console.log(e);
	}
	return null
}

const getNationalNewscast = async () => {
	try {
		const options = {
			method: 'GET',
			url: `${config.public.PUBLISHER_BASE_API}v3/story/npr-newscast`,
		};
		const res = await axios(options);
		const resData = humps.camelizeKeys(res.data).data;
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
		////console.log(e);
	}
	return null
}

// Get NYC-NOW newscast from the WNYC API
const getNYCNowNewscast = async () => {
	try {
		const options = {
			method: 'GET',
			url: `${config.public.PUBLISHER_BASE_API}v3/story/`,
			params: {
				'channel': 'nyc-now-podcast',
				'ordering': '-newsdate',
				'page_size': '1',
			},
		};
		const res = await axios(options);
		const resData = humps.camelizeKeys(res.data).data[0];
		resData.attributes.file = resData.attributes.audio;
		resData.attributes.image = 'https://media.wnyc.org/i/%s/%s/%s/%s/2023/04/NYNOW_WNYC_LOGO_HEX_1400PX.png';
		resData.attributes.duration = await handleDuration(resData.attributes.estimatedDuration, resData.attributes.audio);
		resData.attributes.cardTitle = 'NYC Now';
		resData.attributes.showTitle = resData.attributes.channelTitle;
		resData.attributes.type = resData.type;
		resData.attributes.id = resData.id;
		resData.attributes.cmsSource = cmsSources.PUBLISHER;
		resData.attributes.hideFavorite = true;
		return resData.attributes;
	} catch (e) {
		//console.log(e);
	}
	return null
}

const getSectionData = async (slug: string) => {
	const option = {
		method: 'GET',
		url: `${config.public.PUBLISHER_BASE_API}v3/channel/shows/wnyc-app/${slug}`,
	};
	const res = await axios(option);
	const resData = await Promise.all(res.data.included.map((item: any) => {
		return normalizePublisherPage(humps.camelizeKeys(item));
	}));
	return resData;
};

const getHomeTemplate = async () => {
	const options = {
		method: 'GET',
		url: `${config.public.PUBLISHER_BASE_API}v3/link-roll/navigation-shows-wnyc-app/`,
	};
	const res = await axios(options);
	const resData = humps.camelizeKeys(res.data).data;
	const homeLayout = await Promise.all(resData.attributes?.linkroll?.map(async (layout: any) => {
		// Regex navSlug to extract if it's horizontal or vertical.
		// This is used to determine the layout of the home page.
		const componentType = layout.navSlug.match(/(horizontal)/g);
		const data = await getSectionData(layout.navSlug);
		return {
			title: layout.title,
			layout: layout.navSlug,
			componentType: componentType ? componentType[0] : 'default',
			data: data
		}
	}));
	return homeLayout;
}

const getGothamistTopStories = async () => {
	const options = {
		method: 'GET',
		url: `${config.public.AVIARY_BASE_API}pages/`,
		params: {
			type: 'news.ArticlePage',
			fields: 'id,title,lead_asset,related_authors,publication_date,ancestry,body,url',
			order: '-publication_date',
			show_on_index_listing: true,
			limit: 3,
			sponsored_content: false
		}
	};
	const res = await axios(options);
	const resData = humps.camelizeKeys(res.data).items;
	const articles = Promise.all(resData.map((article: any) => {
		article.cmsSource = cmsSources.WAGTAIL;
		article.sortDate = article.publicationDate;
		return normalizeArticlePage(article);
	}));
	return articles;
}

//Gets the top stories from the WNYC API and 
const getWNYCTopStories = async () => {
	const options = {
		method: 'GET',
		url: `${config.public.PUBLISHER_BASE_API}v3/buckets/wnyc-home-top`,
	};
	const res = await axios(options);
	const resData = humps.camelizeKeys(res.data.data.attributes["bucket-items"]);
	if (resData) {
		const articles = Promise.all(resData.map((article: any) => {
			article.cmsSource = cmsSources.PUBLISHER;
			article.sortDate = article.attributes.publishAt;
			return normalizeArticlePage(article);
		}));
		return articles;
	} else {
		return [];
	}
}

// Write a function that takes in 2 json objects and returns a single array of articles sorted by publication date and then removes any duplicates by title.
const mergeArticles = (articles1: any, articles2: any) => {
	const mergedArticles = [...articles1, ...articles2];
	const sortedArticles = mergedArticles.sort((a: any, b: any) => {
		const aDate = new Date(a.sortDate);
		const bDate = new Date(b.sortDate);
		return bDate.getTime() - aDate.getTime();
	});
	// remove duplicates
	return sortedArticles.filter((obj, index) => {
		return index === sortedArticles.findIndex((o) => obj.title === o.title)
	})
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
	let res = event?.node?.res;
	const aviary = await getGothamistTopStories();
	const publisher = await getWNYCTopStories();
	const topStories = mergeArticles(aviary, publisher);
	const homeTemplate = await getHomeTemplate();
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
	res.setHeader('Cache-Control', 'maxage=900, stale-while-revalidate');

	return {
		home_template: homeTemplate,
		top_stories: topStories,
		local_newscast: local_newscast,
		national_newscast: national_newscast,
	}
})


