const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'

const GOTHAMISTDOTCOM = 'https://gothamist.com/'

const linkMapper = (link: any) => {
	return { title: link.value.title, url: link.value.url }
}

const getLocalNewscast = async () => {
	try {
		const options = {
			method: 'GET',
			url: config.public.PUBLISHER_BASE_API + '/story/latest-newscast/',
		};
		const res = await axios(options);
		const resData = humps.camelizeKeys(res.data).data;
		resData.attributes.file = resData.attributes.audio;
		//resData.attributes.image = 'https://media.wnyc.org/i/%s/%s/%s/%s/1/WNYC_news.png';
		resData.attributes.image = resData.attributes.headers.brand.logoImage.template;
		//Fetch the mp3 Content-Length and calculate the duration in seconds
		const mp3Res = await axios(resData.attributes.audio);
		const mp3Size = mp3Res.headers['content-length'];
		// Calculate the duration in seconds not converting size into bits. 
		// The bitrate is 128kps according to vlc and the file size is in bytes.
		//Multiplying the file size by 8 and dividing by 128000 gives the same 
		//duration as dividing by 16000 and not multiplying the file size by 8.
		const duration = Math.round(mp3Size / 16000) * 1000;
		resData.attributes.duration = duration;
		resData.attributes.cardTitle = 'Latest Headlines';
		return resData.attributes;
	} catch (e) {
		//console.log(e);
	}
}

const getNationalNewscast = async () => {
	try {
		const options = {
			method: 'GET',
			url: config.public.PUBLISHER_BASE_API + '/story/npr-newscast',
		};
		const res = await axios(options);
		const resData = humps.camelizeKeys(res.data).data;
		resData.attributes.file = resData.attributes.audio;
		resData.attributes.image = 'https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/npr-news-now.jpeg';
		//Fetch the mp3 last modified date
		const mp3Res = await axios(resData.attributes.audio);
		resData.attributes.newsdate = mp3Res.headers['last-modified'];
		const mp3Size = mp3Res.headers['content-length'];
		// Calculate the duration in seconds not converting size into bits. 
		// The bitrate is 128kps according to vlc and the file size is in bytes.
		//Multiplying the file size by 8 and dividing by 128000 gives the same 
		//duration as dividing by 16000 and not multiplying the file size by 8.
		const duration = Math.round(mp3Size / 16000) * 1000;
		resData.attributes.duration = duration;
		resData.attributes.cardTitle = 'NPR Newscast';
		return resData.attributes;
	} catch (e) {
		//console.log(e);
	}
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

const getMiddleBucket = async () => {
	try {
		const res = await axios(config.public.PUBLISHER_BASE_API + 'buckets/wnyc-home-middle');
		return humps.camelizeKeys(res.data).data?.attributes?.bucketItems;
	} catch (e) {
		console.log(e);
	}
}

/**
 * Compress and simplify the global nav data.
 * Reachable /api/homepage
 */
export default defineEventHandler(async (event) => {
	const articles = await getTopStories();
	const aviary = await getGothamistTopStories();
	const publisher = await getWNYCTopStories();
	const bucket = await getMiddleBucket();
	//const topStories = mergeArticles(aviary, publisher);
	const local_newscast = await getLocalNewscast();
	const national_newscast = await getNationalNewscast();
	return {
		top_stories: aviary,
		middle_bucket: bucket,
		local_newscast: local_newscast,
		national_newscast: national_newscast,
	}
})