const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { normalizeArticlePage } from '~/composables/data/articlePages'

//Gets the top stories from the Wagtail API (gothamist)
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

	let res = null
	try {
		res = await axios(options);
	} catch (e) {
		console.error('getGothamistTopStories = ', e);
	}

	const resData = humps.camelizeKeys(res.data).items;
	const articles = Promise.all(resData.map((article: any) => {
		article.cmsSource = cmsSources.WAGTAIL;
		article.sortDate = article.publicationDate;
		return normalizeArticlePage(article);
	}));
	return articles;
}

//Gets the top stories from the WNYC API
const getWNYCTopStories = async () => {
	const options = {
		method: 'GET',
		url: `${config.public.PUBLISHER_BASE_API}v3/buckets/wnyc-home-top`,
	};
	let res = null
	try {
		res = await axios(options);
	} catch (e) {
		console.error('getWNYCTopStories = ', e);
	}
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
	//console.log('getting home page TOP STORIES data')
	const res = event?.node?.res;
	const aviary = await getGothamistTopStories();
	const publisher = await getWNYCTopStories();
	const topStories = mergeArticles(aviary, publisher);

	res.setHeader('Cache-Control', 'maxage=120, stale-while-revalidate');

	return {
		top_stories: topStories,
	}
})
