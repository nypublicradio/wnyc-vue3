import type Author from '../types/Author'
import type Person from '../types/Person'
import type ISocial from '../types/Social'
import type { ArticlePage } from '../types/Page'
import { cmsSources, mediaTypes } from '~/composables/globals'
import { normalizePage } from './basePages'
import { getWagtailRawBody } from "~/utilities/helpers"
import { estimateMp3Duration } from '~/server/utils/duration'
import axios from 'axios'
import memoize from 'memoize';
// Get a list of article pages using the Aviary /pages api
export function findArticlePages(queryParams: any) {
  const defaultParams = {
    type: 'news.ArticlePage',
    fields: ['ancestry', 'description', 'lead_asset', 'legacy_id', 'listing_image', 'publication_date', 'show_as_feature', 'sponsored_content', 'tags', 'updated_date', 'url', 'uuid', 'listing_title', 'listing_summary', 'related_authors'].join(','),
    order: '-publication_date',
    show_on_index_listing: true,
  }
  const params = Object.assign({}, defaultParams, queryParams)
  return useAviary('/pages/', { params })
}

// Get a list of article pages using the Aviary /search api
export function searchArticlePages(queryParams: any) {
  const params = Object.assign({}, queryParams)
  return useAviary('/search/', { params })
}

// Get a relative link to an article
function getWagtailArticleLink(articleData): string {
  if (articleData.ancestry)
    return `/story/${articleData.meta.slug}`

  else if (articleData.path)
    return articleData.path.replace('/home/', '/story/')

  return '/'
}

//Get a relative link to an article in publisher
function getPublisherArticleLink(articleData): string {
  return `/story/${articleData.attributes.slug}`
}

// Transform author data from the API into a simpler and typed format
export function normalizeAuthor(author: Record<string, any>): Author {
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
    url: author.slug && `/staff/${author.slug}`,
    socialMediaProfile: author.socialMediaProfile,
  }
}


/**
 * Normalize an article page object from Publisher or Wagtail into a generic ArticlePage object.
 * @param article 
 * @returns 
 */
export async function normalizeArticlePage(article: Record<string, any | undefined>): Promise<ArticlePage> {

  if (article.cmsSource === cmsSources.WAGTAIL)
    return await normalizeWagtailPage(article)
  else if (article.cmsSource === cmsSources.PUBLISHER)
    return await normalizePublisherPage(article)
  else
    return null
}

// normalize person social media data
function normalizePersonSocial(social: Record<string, any>): ISocial {
  return {
    id: social.contactString,
    service: social.service,
    profileUrl: social?.contactString?.replace("@", "") || null,
  }
}

// Transform person data from the API into a simpler and typed format
export function normalizePerson(person: Record<string, any>): Person {
  const pa = person.attributes
  return {
    id: person.id,
    name: pa.name,
    photoID: pa.image?.template ?? null,
    jobTitle: pa.jobTitle,
    biography: pa.bio,
    website: pa.website,
    email: pa.email,
    slug: pa.slug,
    url: `/people/${pa.slug}`,
    socialMediaProfile: pa.social.length > 0 ? pa.social.map(normalizePersonSocial) : null, // Fix: Wrap the normalizePersonSocial result in an array
    shows: pa.shows,
  }
}


// Wagtail: Transform page data from the API into a simpler and typed format
export async function normalizeWagtailPage(article: Record<string, any | undefined>): ArticlePage {
  if (typeof article === 'undefined')
    return null

  return Object.assign({}, await normalizePage(article), {
    description: article.description,
    image: article.leadAsset?.[0]?.value?.image ?? article.leadAsset?.[0]?.value?.defaultImage,
    leadImageCaption: article.leadAsset?.[0]?.value?.caption || article.leadAsset?.[0]?.value?.image?.caption,
    imageLink: article.leadAsset?.[0]?.value?.imageLink,
    link: getWagtailArticleLink(article),
    cmsSource: cmsSources.WAGTAIL,
    leadAsset: article.leadAsset?.[0],
    leadImage: article.leadAsset?.[0]?.type === 'lead_image' ? article.leadAsset?.[0]?.value.image : undefined,
    leadGallery: article.leadAsset?.[0]?.type === 'lead_gallery' ? article.leadAsset?.[0]?.value : undefined,

    gallerySlides: article.leadAsset?.[0]?.type === 'lead_gallery' ? article.leadAsset?.[0]?.slides : undefined,
    legacyId: article.legacyId,
    authors: article.relatedAuthors?.map(normalizeAuthor),
    contributingOrganizations: article.relatedContributingOrganizations,
    sponsors: article.relatedSponsors,
    publicationDate: (article.publicationDate && new Date(article.publicationDate))
      || (article.meta?.firstPublishedAt && new Date(article.meta?.firstPublishedAt)),
    updatedDate: article.updatedDate ? new Date(article.updatedDate) : undefined,
    showAsFeature: article.showAsFeature,
    sensitiveContent: article.sensitiveContent,
    provocativeContent: article.provocativeContent,
    sponsoredContent: article.sponsoredContent,
    relatedLinks: article.relatedLinks,
    tags: article.tags,
    url: article.url,
    section: { name: article.ancestry?.[0].title, slug: article.ancestry?.[0].slug },
    body: article.body,
    rawBody: getWagtailRawBody(article.body),
    audio: article.audio,

    // curated images
    listingImage: article.listingImage ?? article.leadAsset?.[0]?.value?.image ?? article.leadAsset?.[0]?.value?.defaultImage,
    socialImage: article.socialImage ?? article.leadAsset?.[0]?.value?.image ?? article.leadAsset?.[0]?.value?.defaultImage,

    // for comments
    disableComments: article.disableComments,
    commentId: String(article.legacyId ?? article.uuid),
    estimatedDuration: undefined,
    sortDate: article.sortDate,
    meta: article.meta,
    showTitle: article.showTitle,
    embedCode: article.embedCode,
  })
}

/**
 * Normalize an article page object from Publisher into a generic ArticlePage object.
 * @param article 
 * @returns 
 */
export async function normalizePublisherPage(article: Record<string, any | undefined>): Promise<ArticlePage> {
  if (typeof article === 'undefined')
    return null
  let duration = article.attributes.estimatedDuration;
  if (!duration || typeof duration !== 'number' || duration === 0) {
    duration = await estimateMp3Duration(article.attributes.audio);
  }

  //segment audio duration
  const segments = article.attributes.segments;
  if (segments && segments.length > 0) {
    segments.forEach(async (segment, index) => {
      if (!segment.audioDurationReadable) {
        article.attributes.segments[index].audioDurationReadable = await estimateMp3Duration(article.attributes.audio[index]);
      }
    });
  }

  return Promise.resolve(Object.assign({}, await normalizePage(article), {
    description: article?.attributes?.tease,
    image: article.type === 'show' || article.type === 'tout' ? article.attributes.image : article.attributes.imageMain,
    leadImageCaption: article.attributes.imageCaption,
    imageLink: undefined,
    type: article.type === 'show' || article.type === 'tout' ? article.type : article.attributes.itemType,
    link: getPublisherArticleLink(article),
    cmsSource: cmsSources.PUBLISHER,
    sortDate: article.attributes.publishAt,
    leadAsset: article.attributes.slideshow?.[0],
    leadImage: article.attributes.slideshow?.[0],
    leadGallery: article.attributes.slideshow?.[0],
    meta: {
      firstPublishedAt: article.attributes.publishAt && new Date(article.attributes.publishAt),
      slug: article.attributes.slug,
    },
    title: article.attributes.title,
    tease: article.attributes.tease,
    gallerySlides: article.attributes?.slideshow,
    legacyId: article.attributes.id,
    authors: article.attributes.appearances?.authors.map(normalizeAuthor),
    contributingOrganizations: article.attributes?.producingOrganizations,
    sponsors: undefined,

    publicationDate: article.attributes.publishAt && new Date(article.attributes.publishAt),
    updatedDate: undefined, //Does this exist in publisher?
    showAsFeature: undefined, //Does this exist in publisher?
    sensitiveContent: undefined, //Does this exist in publisher?
    provocativeContent: undefined, //Does this exist in publisher?
    sponsoredContent: undefined, //Does this exist in publisher?
    relatedLinks: undefined, //Does this exist in publisher?
    tags: article.attributes?.tags, // This may need tweaking
    url: article.attributes.url,
    section: undefined, //Does this exist in publisher?
    body: article.attributes.body,
    rawBody: article.attributes.body,
    audio: article.attributes.audio,

    // curated images
    listingImage: article.attributes.imageMain, // This may need tweaking
    socialImage: article.attributes.imageMain, // This may need tweaking

    // for comments
    disableComments: undefined,
    commentId: undefined,
    estimatedDuration: duration,
    show: article.attributes.show,
    showTitle: article.attributes.showTitle,
    headers: article.attributes.headers,
    segments: article.attributes.segments,
    transcript: article.attributes.transcript,

    embedCode: article.attributes.embedCode,
  }))
}

// fetch tweet/X content from tweetId
const fetchTweetEmbed = async (tweetId) => {
  const response = await fetch(`https://publish.twitter.com/oembed?url=https://twitter.com/web/status/${tweetId}`);
  const data = await response.json();
  return data.html;
};

// get authors
const getAuthorsFromBylineUrl = memoize(async (url: string): Promise<Author> => {
  const config = useRuntimeConfig()
  const options = {
    method: 'GET',
    url: `${config.public.NPR_CDS_API}${url}`,
    headers: {
      Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
    },
  };
  let response = null
  try {
    response = await axios(options);
  } catch (e) {
    if (e.response && e.response.status === 404) {
      console.error('404 = ', e)
    } else {
      console.error(e);
    }
  }
  let image;
  let biography = '';
  const res = response.data?.resources[0];
  if (res.assets !== undefined && res.assets !== null) {
    for (const asset of Object.values(res.assets)) {
      if (asset.profiles[0]?.href === '/v1/profiles/image') {
        image = asset.enclosures.filter((enclosure) => {
          return enclosure.rels.includes('primary');
        })[0]?.hrefTemplate;
      }
    }
  }
  if (res.layout !== undefined && res.layout !== null) {
    for (const layoutItem of Object.values(res.layout)) {
      const layoutId = layoutItem?.href?.substring(layoutItem.href.lastIndexOf("/") + 1);
      if (res?.profiles[0]?.href === '/v1/profiles/text') {
        biography += response.data?.resources[layoutId]?.text ? `<p>${response.data?.resources[layoutId]?.text}</p>` : '';
      }
    }
  }
  const author = {
    id: res?.id,
    firstName: res?.title?.split(' ')[0],
    lastName: res?.title?.split(' ')[1],
    organization: 'NPR',
    organizationUrl: null,
    name: res?.title,
    photoID: image || null,
    jobTitle: res?.subtitle,
    biography: biography || null,
    website: '',
    email: '',
    slug: res?.nprWebsitePath,
    url: '',
    socialMediaProfile: null,
  };
  return author;
})

// Normalize an article page object from NPR into a generic ArticlePage object.
export async function normalizeNprPage(article: Record<string, any | undefined>, componentType = "defualt"): Promise<ArticlePage> {
  const id = article.id
  const firstImageId = article.images?.[0]?.href?.substring(article.images[0].href.lastIndexOf("/") + 1);
  const firstImage = article.assets?.[firstImageId];
  const firstImageCaption = article.assets?.[firstImageId]?.caption;

  const squareHref = firstImage?.enclosures?.filter((enclosure) => {
    return enclosure.rels?.includes('image-square');
  });
  const wideHref = firstImage?.enclosures?.filter((enclosure) => {
    return enclosure.rels?.includes('image-wide');
  });

  let textBody = '';
  let audioURL;
  let audioDuration;
  let index = 0;
  for (const layoutItem of Object.values(article.layout)) {
    const layoutId = layoutItem?.href?.substring(layoutItem.href.lastIndexOf("/") + 1);
    //console.log('article.assets[layoutId].profiles[0]?.href= ', article.assets[layoutId].profiles[0]?.href)
    if (article.assets[layoutId].profiles[0]?.href === '/v1/profiles/text') {
      textBody += article.assets[layoutId].text ? `<p>${article.assets[layoutId].text}</p>` : '';
    }
    //html blocks
    if (article.assets[layoutId].profiles[0]?.href === '/v1/profiles/html-block') {
      textBody += article.assets[layoutId]?.html;
    }
    //youtube
    if (article.assets[layoutId].profiles[0]?.href === '/v1/profiles/youtube-video') {
      const videoID = article.assets?.[layoutId].videoId;
      textBody += `<div class="user-embedded-video"><div><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>
`
    }
    //twitter X
    if (article.assets[layoutId].profiles[0]?.href === '/v1/profiles/tweet') {
      const tweetInfo = article.assets?.[layoutId];
      const tweetHTML = await fetchTweetEmbed(tweetInfo.tweetId);
      textBody += tweetHTML ? tweetHTML : '';
    }
    //images
    //we ar checking for the FIRST image in index 0 because its the same as the header image and we dont want to repeat it
    if (article.assets[layoutId].profiles[0]?.href === '/v1/profiles/image' && index > 0) {
      const imageInfo = article.assets?.[layoutId];
      // Get image credits
      const imageCredits = () => {
        if (imageInfo.producer && imageInfo.provider) {
          return `${imageInfo.producer}/${imageInfo.provider}`;
        } else if (imageInfo.producer && !imageInfo.provider) {
          return imageInfo.producer;
        } else if (!imageInfo.producer && imageInfo.provider) {
          return imageInfo.provider;
        }
        return 'NPR'
      }

      const imageHTML = imageInfo.enclosures[0].hrefTemplate ? `<div class="mt-4 html-img"><img src="${imageInfo.enclosures[0].hrefTemplate}" alt="${imageInfo.caption}"/></div>` : "";
      textBody += imageHTML ? imageHTML : '';

      const imageHTMLCaption = imageInfo.caption
        ? `<div class="mt-1 mb-6"><p class=" my-0 text-xs opacity-70">${imageInfo.caption}</p><p class="mt-0 text-xs opacity-70 font-italic">${imageCredits()}</p></div>` : "";
      textBody += imageHTMLCaption ? imageHTMLCaption : '';
    }
    index++;
  }
  //audio
  for (const asset of Object.values(article.assets)) {
    if (asset.profiles[0]?.href === '/v1/profiles/audio') {
      audioDuration = asset?.duration;
      const audioID = asset?.id;
      const audioInfo = article.assets?.[audioID];
      audioURL = audioInfo.enclosures.filter((enclosure) => {
        return enclosure.type.includes('audio/mpeg');
      })[0]?.href;
    }
  }
  // Get Byline 
  const bylineUrl = article.collections.filter((collection) => {
    return collection.rels.includes('byline');
  })[0]?.href ?? null;

  const authors = bylineUrl ? [await getAuthorsFromBylineUrl(bylineUrl)] : null;

  return {
    id,
    uuid: article.id,
    title: article.title,
    publicationDate: article.publishDateTime,
    publishAt: article.publishDateTime,
    updatedDate: article.editorialLastModifiedDateTime,
    tease: article.teaser,
    description: article.teaser,
    image: componentType === 'default' ? squareHref?.[0]?.hrefTemplate ?? wideHref?.[0]?.hrefTemplate : wideHref?.[0]?.hrefTemplate ?? squareHref?.[0]?.hrefTemplate,
    leadImageCaption: firstImageCaption,
    cmsSource: cmsSources.NPR,
    audio: audioURL ? audioURL : null,
    type: audioURL ? mediaTypes.NPR_EPISODE : mediaTypes.NPR_ARTICLE,
    estimatedDuration: audioDuration ? audioDuration : null,
    meta: {
      firstPublishedAt: article.publishDateTime,
      slug: id,
    },
    showTitle: article.showTitle ?? 'NPR',
    body: textBody,
    rawBody: textBody,
    link: article.webPages[0].href,
    authors,
  };
}





// Transform page data from the API into a simpler and typed format
export function normalizeSearchResults(results: Record<string, any | undefined>): ArticlePage {
  return {
    id: results.result.id,
    type: results.result.type,
    title: results.result.listingTitle || results.result.title,
    description: results.result.description,
    image: results.result.image ?? results.result.leadAsset?.[0]?.value?.image ?? results.result.leadAsset?.[0]?.value?.defaultImage,
    leadImageCaption: results.result.leadAsset?.[0]?.value?.caption ?? results.result.leadAsset?.[0]?.value?.image?.caption,
    imageLink: results.result.leadAsset?.[0]?.value?.imageLink,
    link: getArticleLink(results.result),

    leadAsset: results.result.leadAsset?.[0],
    leadImage: results.result.leadAsset?.[0]?.type === 'lead_image' && results.result.leadAsset?.[0]?.value.image,
    leadGallery: results.result.leadAsset?.[0]?.type === 'lead_gallery' && results.result.leadAsset?.[0]?.value,

    gallerySlides: results.result.leadAsset?.[0]?.type === 'lead_gallery' && results.result.leadAsset?.[0]?.slides,
    legacyId: results.result.legacyId,
    authors: results.result.relatedAuthors?.map(normalizeAuthor),
    contributingOrganizations: results.result.relatedContributingOrganizations,
    sponsors: results.result.relatedSponsors,
    publicationDate: (results.result.publicationDate && new Date(results.result.publicationDate))
      || (results.result.meta?.firstPublishedAt && new Date(results.result.meta?.firstPublishedAt)),
    updatedDate: results.result.updatedDate ? new Date(results.result.updatedDate) : undefined,
    showAsFeature: results.result.showAsFeature,
    sensitiveContent: results.result.sensitiveContent,
    provocativeContent: results.result.provocativeContent,
    sponsoredContent: results.result.sponsoredContent,
    relatedLinks: results.result.relatedLinks,
    tags: results.result.tags,
    url: results.result.url,
    uuid: results.result.uuid,
    section: { name: results.result.ancestry?.[0].title, slug: results.result.ancestry?.[0].slug },
    body: results.result.body,
    embedCode: results.result.embedCode,

    // for listing pages
    listingImage: results.result.listingImage || results.result.leadAsset?.[0]?.value?.image || results.result.leadAsset?.[0]?.value?.defaultImage,
    listingTitle: results.result.listingTitle || results.result.title,
    listingDescription: results.result.listingSummary || results.result.description,

    // for social/OG metadata
    socialImage: results.result.socialImage || results.result.leadAsset?.[0]?.value?.image || results.result.leadAsset?.[0]?.value?.defaultImage,
    socialTitle: results.result.socialTitle || results.result.title,
    socialDescription: results.result.socialText || results.result.description,

    preventSearchIndexing: results.result.preventSearchIndexing,
    seoTitle: results.result.meta?.seoTitle || results.result.title,
    searchDescription: results.result.meta?.searchDescription || results.result.description,

    // for comments
    disableComments: results.result.disableComments,
    commentId: String(results.result.legacyId || results.result.uuid),
  }
}

// Transform a list of article page data from the /pages API into a simpler and typed format
export function normalizeFindArticlePagesResponse(articlesResponse: any): ArticlePage[] {
  return articlesResponse.value?.items?.map(normalizeArticlePage)
}

// Transform a list of article page data from the /search API into a simpler and typed format
export function normalizeSearchArticlePagesResponse(articlesResponse: any): ArticlePage[] {
  return articlesResponse.value?.items?.map(normalizeSearchResults)
}
