const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'
import { formatTime, formatPublisherImageUrl } from '~/utilities/helpers'

const GOTHAMISTDOTCOM = 'https://gothamist.com/'

const linkMapper = (link: any) => {
	return { title: link.value.title, url: link.value.url }
}

const getNavigation = async () => {
	try {
		const options = {
			method: 'GET',
			url: config.public.PUBLISHER_BASE_API + 'link-roll/navigation-shows-wnyc-app/',
		};
		const res = await axios(options);
		const nav = humps.camelizeKeys(res.data).data.attributes.links.map(linkMapper);
		return nav;
	} catch (e) {
		console.log(e);
	}
}

const getWagtailImageId = (article: any) => {
	const listingImage =
		article.leadAsset?.[0]?.value?.image ??
		article.leadAsset?.[0]?.value?.defaultImage
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
		firstName: author.firstName,
		lastName: author.lastName,
		organization: author.contributingOrganization?.name,
		organizationUrl: author.contributingOrganization?.url,
		name: `${author.firstName} ${author.lastName}`,
		photoID: author.photo,
		jobTitle: author.jobTitle,
		biography: author.biography,
		website: author.website,
		email: author.email,
		slug: author.slug,
		url: author.slug && `${GOTHAMISTDOTCOM}staff/${author.slug}`,
	}
}

const getTopStories = async () => {
	try {
		const res = await axios(config.public.STORIES_API);
		return res.data.items.map((article: any) => {
			article.authors = article.related_authors.map((author: any) => {
				return normalizeAuthor(author)
			});
			article.link = getArticleLink(article);
			article.leadImage = getWagtailImageId(article);
			return article;
		})
	} catch (e) {
		console.log(e);
	}
}

const getGothamistTopStories = async () => {
	try {
		const options = {
			method: 'GET',
			url: config.public.AVIARY_BASE_API + 'pages/',
			params: {
				type: 'news.ArticlePage',
				fields: 'id,title,lead_asset,related_authors,publication_date,ancestry',
				order: '-publication_date',
				show_on_index_listing: true,
				limit: 3,
				sponsored_content: false
			}
		};
		const res = await axios(options);
		const resData = humps.camelizeKeys(res.data).items;
		console.log(resData);
		const articles = resData.map((article: any) => {
			article.authors = article.relatedAuthors.map((author: any) => {
				return normalizeAuthor(author);
			});
			article.link = getArticleLink(article);
			article.leadImage = getWagtailImageId(article);
			article.leadImageMaxWidth = article.leadAsset?.[0]?.value?.image?.width;
			article.leadImageMaxHeight = article.leadAsset?.[0]?.value?.image?.height;
			article.cmsSource = 'wagtail';
			article.SortDate = article.publicationDate;
			return article;
		});
		return articles;
	} catch (e) {
		console.log(e);
	}
}

//Gets the top stories from the WNYC API and 
const getWNYCTopStories = async () => {
	try {
		const options = {
			method: 'GET',
			url: config.public.PUBLISHER_BASE_API + 'buckets/wnyc-home-top',
		};
		const res = await axios(options);
		const resData = humps.camelizeKeys(res.data.data.attributes["bucket-items"]);
		if (resData) {
			const articles = resData.map((article: any) => {
				article.cmsSource = 'publisher';
				article.SortDate = article.attributes.publishAt;
				return article;
				
			});
			return articles;
		} else {
			return [];
		}
		//return humps.camelizeKeys(res.data).data?.attributes?.bucketItems;
	} catch (e) {
		console.log(e);
	}

}

// Write a function that takes in 2 json objects and returns a single array of articles sorted by publication date.
const mergeArticles = (articles1: any, articles2: any) => {
	const mergedArticles = [...articles1, ...articles2];
	return mergedArticles.sort((a: any, b: any) => {
		const aDate = new Date(a.SortDate);
		const bDate = new Date(b.SortDate);
		return bDate.getTime() - aDate.getTime();
	});
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
		return formatShowData(stream);
	})
	return streams;
}

const getMiddleBucket = async () => {
	try {
    	const res = await axios(config.public.PUBLISHER_BASE_API + 'buckets/wnyc-home-middle');
		return humps.camelizeKeys(res.data).data?.attributes?.bucketItems;
	} catch (e) {
		console.log(e);
	}
}

const formatShowData = (apiResponse: any) => {
	const showData = apiResponse.included.find((obj: any) =>
		obj.type === 'show'
	)
	console.log(showData);
	const scheduleData = apiResponse.included.find((obj: any) => {
		return obj.type === 'show-schedule'
	})
	const imageData = apiResponse.included.find((obj: any) => {
		return obj.type === 'image'
	})
	const episodeData = apiResponse.included.find((obj: any) => {
		return obj.type === 'episode'
	})
	const airingData = apiResponse.included.find((obj: any) => {
		return obj.type === 'airing'
	})
	const segmentData = apiResponse.included.filter((item: { type: string }) => item.type === 'segment')
	const formattedSegments: { title: any; url: string; newWindow: boolean }[] = []
	if (segmentData !== null) {
		segmentData.forEach(function (value: { attributes: { title: any; slug: string } }) {
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
	const articles = await getTopStories();
	const aviary = await getGothamistTopStories();
	const publisher = await getWNYCTopStories();
	//const nav = await getNavigation();
	const bucket = await getMiddleBucket();
	const topStories = mergeArticles(aviary, publisher);
	return {
		//navigation: nav,
		//streams: streams,
		top_stories: aviary,
		middle_bucket: bucket,
		combined: topStories,
		wnyc: publisher,
	}
})