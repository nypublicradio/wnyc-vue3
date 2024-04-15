const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { normalizePublisherPage, normalizeNprPage } from '~/composables/data/articlePages'

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

const getNprStories = async () => {
	const componentType = "default";
	const options = {
		method: 'GET',
		url: `${config.public.NPR_CDS_API}/v1/documents`,
		params: {
			collectionIds: '1002',
			sort: 'publishDateTime:desc',
		},
		headers: {
			Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
		},
	};
	const response = await axios(options);
	const articles = await Promise.all(response.data.resources.map(async (article) => {
		return normalizeNprPage(article, componentType);
	}));
	return [{
		componentType,
		articles,
	}];
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
	//console.log('getting home page CURATION data')
	let res = event?.node?.res;
	const homeTemplate = await getHomeTemplate();
	const nprStories = await getNprStories();

	res.setHeader('Cache-Control', 'maxage=900, stale-while-revalidate');

	return {
		home_template: homeTemplate,
		npr_stories: nprStories,
	}
})
