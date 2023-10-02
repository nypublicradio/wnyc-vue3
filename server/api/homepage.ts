const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { formatTime, formatPublisherImageUrl } from '~/utilities/helpers'

const GOTHAMISTDOTCOM = 'https://gothamist.com/'

const linkMapper = (link: any) => {
	return { title: link.value.title, url: link.value.url }
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

const getTopStories = async () => {
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

const getLivestream = async (slug: String) => {
	const res = await axios(`${config.public['LIVESTREAM_URL']}?filter[slug]=${slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)
	return res.data
}

const getLivestreams = async () => {
	const stream_slugs = ['wnyc-fm939', 'wnyc-am820', 'q2', 'jonathan-channel', 'special-events-stream'];
	const fields = ['current-airing.image', 'current-show.show.image', 'current-episode.segments']
	const streams_url = `${config.public.LIVESTREAM_URL}/?filter[slug]=${stream_slugs.join(',')}&include=${fields.join(',')}`;
	console.log(streams_url);
	const res = await axios(streams_url);
	const streams = res.data.data.map( (stream: any) => {
		console.log(stream);
		return formatShowData(stream);
	})
	return streams;
}

const getMiddleBucket = async () => {
    const res = await axios(config.public.PUBLISHER_BASE_API + 'buckets/wnyc-home-middle');
    return humps.camelizeKeys(res.data).data?.attributes?.bucketItems;
}

const formatShowData = (apiResponse) => {
	const showData = apiResponse.included.find((obj) =>
		obj.type === 'show'
	)
	const scheduleData = apiResponse.included.find((obj) => {
		return obj.type === 'show-schedule'
	})
	const imageData = apiResponse.included.find((obj) => {
		return obj.type === 'image'
	})
	const episodeData = apiResponse.included.find((obj) => {
		return obj.type === 'episode'
	})
	const airingData = apiResponse.included.find((obj) => {
		return obj.type === 'airing'
	})
	const segmentData = apiResponse.included.filter(item => item.type === 'segment')
	const formattedSegments = []
	if (segmentData !== null) {
		segmentData.forEach(function (value) {
			formattedSegments.push(
				{
					title: value.attributes.title,
					url: 'https://www.wnyc.org/story/' + value.attributes.slug,
					newWindow: true
				}
			)
		})
	}
	let title = showData ? showData.attributes.title : null
	let details = showData ? showData.attributes.tease : null
	let titleLink = showData ? showData.attributes.url : null
	// handle special airings
	if (airingData) {
		title = airingData.attributes.title
		details = airingData.attributes.description
		titleLink = airingData.attributes.href
	}

	const formattedData = {
		details,
		detailsLink: showData ? showData.attributes.url : null,
		episodeTitle: episodeData ? episodeData.attributes.title : null,
		episodeLink: episodeData ? episodeData.attributes.url : null,
		file: apiResponse.data[0].attributes['mobile-mp3'],
		image: imageData ? 'https://media.wnyc.org/i/448/448/l/80/' + imageData.attributes.name : apiResponse.data[0].attributes['image-logo'],
		slug: apiResponse.data[0].attributes.slug,
		station: apiResponse.data[0].attributes.name,
		timeStart: scheduleData ? formatTime(scheduleData.attributes['iso-start-time']) : null,
		timeEnd: scheduleData ? formatTime(scheduleData.attributes['iso-end-time']) : null,
		title,
		titleLink,
		onTodaysShowHeadline: episodeData ? episodeData.attributes.title : null,
		onTodaysShowHeadlineLink: episodeData ? episodeData.attributes.url : null,
		onTodaysShowHosts: showData ? showData.attributes.about.roles.host : null,
		onTodaysShowImage: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main'].url : null,
		onTodaysShowImageMaxWidth: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main'].w : null,
		onTodaysShowImageMaxHeight: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main'].h : null,
		onTodaysShowImageTemplate: episodeData && episodeData.attributes['image-main'] ? formatPublisherImageUrl(episodeData.attributes['image-main'].template) : null,
		onTodaysShowImageAltText: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main']['alt-text'] : null,
		onTodaysShowImageCaption: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main'].caption : null,
		onTodaysShowImageCredits: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main']['credits-name'] : null,
		onTodaysShowImageCreditsUrl: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main']['credits-url'] : null,
		onTodaysShowSegments: segmentData.length > 0 ? formattedSegments : null,
		onTodaysShowSocial: showData ? showData.attributes.about.social : null
	}
	return formattedData
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
	//const streams = await getLivestreams();
	//console.log(streams);
	const articles = await getTopStories();
	const nav = await getNavigation();
	const bucket = await getMiddleBucket();
	return {
		navigation: nav,
		//streams: streams,
		top_stories: articles,
		middle_bucket: bucket
	}
})