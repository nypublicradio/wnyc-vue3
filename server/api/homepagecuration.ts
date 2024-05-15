const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { normalizePublisherPage, normalizeNprPage } from '~/composables/data/articlePages'
import { hasAudio } from '~/utilities/helpers'


// Get curated SHOW content from the WNYC Puplisher API
const getSectionData = async (slug: string) => {
	const options = {
		method: 'GET',
		url: `${config.public.PUBLISHER_BASE_API}v3/channel/shows/wnyc-app/${slug}`,
	};

	let res = null
	try {
		res = await axios(options);

		const resData = await Promise.all(res.data.included.map((item: any) => {
			return normalizePublisherPage(humps.camelizeKeys(item));
		}));
		return resData;
	} catch (e) {
		console.error('getSectionData = ', e);
		return null;
	}
};

// get curated content from the WNYC Puplisher API from the navigation-shows-wnyc-app link-roll
const getHomeTemplate = async () => {
	const options = {
		method: 'GET',
		url: `${config.public.PUBLISHER_BASE_API}v3/link-roll/navigation-shows-wnyc-app/`,
	};

	let res = null
	try {
		res = await axios(options);
		const resData = humps.camelizeKeys(res.data).data;
		const homeLayout = await Promise.all(resData.attributes?.linkroll?.map(async (layout: any) => {
			// Regex navSlug to extract if it's horizontal or vertical.
			// This is used to determine the layout of the home page.
			const componentType = layout.navSlug.match(/(horizontal)/g);
			const rawData = await getSectionData(layout.navSlug);

			// filter out episodes with no audio (we want to keep the null results because that seems to allow news stories with no audio to skipthe filter, so we specifically look for FALSE)
			const data = rawData.filter((item) => hasAudio(item.audio) !== false);

			return {
				title: layout.title,
				layout: layout.navSlug,
				componentType: componentType ? componentType[0] : 'default',
				data,
			}
		}));
		return homeLayout;
	} catch (e) {
		console.error('getHomeTemplate = ', e);
		return null;
	}
}

// Get NPR stories from the NPR API in the 1002 collection
const getNprStories = async () => {
	const componentType = "default";
	const options = {
		method: 'GET',
		url: `${config.public.NPR_CDS_API}/v1/documents`,
		params: {
			collectionIds: '1002',
			sort: 'publishDateTime:desc',
			limit: 15,
		},
		headers: {
			Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
		},
	};
	let response = null
	try {
		response = await axios(options);
		const normalizeArticles = await Promise.all(response.data.resources.map((article) => {
			for (const asset of Object.values(article.assets)) {
				if (asset?.isRestrictedToAuthorizedOrgServiceIds === true) {
					article.isRestrictedToAuthorizedOrgServiceIds = true;
					break;
				}
			}
			//remove article if it contains restricted content
			if (article?.isRestrictedToAuthorizedOrgServiceIds) {
				return null;
			} else {
				return normalizeNprPage(article, componentType);
			}
		}));

		// Remove null and undefined articles
		const cleanedArticles = normalizeArticles.filter((article) => article !== undefined && article !== null);
		// remove articles with no body content or empty body content
		const filteredArticles = cleanedArticles.filter((article) => article.body !== null && article.body !== '');

		// Sort articles by "updatedDate" if it exists, otherwise by "publicationDate" in reverse cronological order
		const articles = filteredArticles
			.sort((a, b) => {
				const dateA = new Date(a.updatedDate ?? a.publicationDate);
				const dateB = new Date(b.updatedDate ?? b.publicationDate);
				return dateB - dateA; // Descending order
			})
			.slice(0, 5); // Return only 5 articles

		return [{
			componentType,
			articles,
		}];
	} catch (e) {
		console.error('getNprStories = ', e);
	} return null;
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
	//console.log('getting home page CURATION data')
	const res = event?.node?.res;
	const homeTemplate = await getHomeTemplate();
	const nprStories = await getNprStories();

	res.setHeader('Cache-Control', 'maxage=300, stale-while-revalidate');

	return {
		home_template: homeTemplate,
		npr_stories: nprStories,
	}
})
