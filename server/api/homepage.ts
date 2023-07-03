const config = useRuntimeConfig()
import axios from 'axios'

const linkMapper = (link: any) => {
	return {title: link.value.title, url: link.value.url}
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
	const res = await axios(config.public.NAVIGATION_API)
	// console.log(res.data)

	const headerLinks = res.data.primary_navigation.map(linkMapper)
	const footer1 = res.data.primary_footer_links.map(linkMapper)
	const footer2 = res.data.secondary_footer_links.map(linkMapper)
	const legalLinks = res.data.legal_links.map(linkMapper)

	return {
		// nav: res.data,
		copyright: res.data.copyright_year,
		description: res.data.property_description,
		sponser: {
			title: "WNYC is supported by the JLGreene Foundation",
            url: "https://jlgreene.org/"
		},
		headerNav: headerLinks,
		legalLinks: legalLinks,
		footer1: footer1,
		footer2: footer2
	}
  })
  