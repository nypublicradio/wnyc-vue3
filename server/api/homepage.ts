const config = useRuntimeConfig()
import axios from 'axios'

const GOTHAMISTDOTCOM = 'https://gothamist.com/'

const linkMapper = (link: any) => {
	return {title: link.value.title, url: link.value.url}
}

const getNavigation = async () => {
	const res = await axios(config.public.NAVIGATION_API)

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
}

const getImageUrl = (article: any) => {
	const listingImage =
	  article.lead_asset?.[0]?.value?.image ??
	  article.lead_asset?.[0]?.value?.default_image
	if (!listingImage) return ''
	return String(listingImage.id)
  }
  
  // returns the article link
  const getArticleLink = (article: any) => {
	if (article.ancestry) {
	  return `${GOTHAMISTDOTCOM}${article.ancestry[0].slug}/${article.meta.slug}`
	} else if (article.path) {
	  return article.path.replace('/home/', GOTHAMISTDOTCOM)
	}
	return GOTHAMISTDOTCOM
  }
  
  const normalizeAuthor = (author: any) => {
	return {
	  id: author.id,
	  firstName: author.first_name,
	  lastName: author.last_name,
	  organization: author.contributing_organization?.name,
	  organizationUrl: author.contributing_organization?.url,
	  name: `${author.first_name} ${author.last_name}`,
	  photoID: author.photo,
	  jobTitle: author.job_title,
	  biography: author.biography,
	  website: author.website,
	  email: author.email,
	  slug: author.slug,
	  url: author.slug && `${GOTHAMISTDOTCOM}staff/${author.slug}`,
	}
  }  

const getTopStories = async() => {
	const res = await axios(config.public.STORIES_API)
	return res.data.items.map((article: any) => {
		article.authors = article.related_authors.map((author: any) => {
			return normalizeAuthor(author)
		});
		article.link = getArticleLink(article);
		article.leadImage = getImageUrl(article);
		return article;
	})
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
	const articles = await getTopStories();
	const nav = await getNavigation();
	return {
		navigation: nav,
		top_stories: articles
	}
})