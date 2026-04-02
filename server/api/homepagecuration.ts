import humps from 'humps'
import { transformCuratedContent } from '~/utilities/curatedContent'

// get curated content from the WNYC Wagtail CMS API
const getNewHomeTemplate = async () => {
	let res = null
	const config = useRuntimeConfig()
	let pageId = null
	if (process.env.ENV === 'prod') {
		pageId = 159454
	} else {
		pageId = 151286
	}
	const options = {
		method: 'GET',
		url: `${config.public.AVIARY_BASE_API}pages/${pageId}`,
		headers: {
			'X-CMS-Site': config.public.cmsSite
		}
	}
	try {
		// Call the internal server API endpoint
		res = await $fetch(options.url, {
			method: options.method,
			headers: options.headers
		})

		const resData = humps.camelizeKeys(res)
		//console.log('resData = ', resData.curatedContent[0].value.list.listItems)
		const transformedCuratedContent = await transformCuratedContent(resData.curatedContent)

		return {
			...resData,
			curatedContent: transformedCuratedContent
		}

	} catch (e) {
		console.error('getHomeTemplate = ', e)
		return null
	}
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineCachedEventHandler(async () => {
	const newHomeTemplate = await getNewHomeTemplate()

	return {
		new_home_template: newHomeTemplate,
	}
}
	, {
		maxAge: 300,
		swr: true,
		name: 'homepage-curation'
	}
)
