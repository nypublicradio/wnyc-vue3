import type Author from '../types/Author'
import type Person from '../types/Person'
import type ISocial from '../types/Social'
import type { ArticlePage } from '../types/Page'
import { cmsSources, mediaTypes, mediaTypeRoutes } from '~/composables/globals'
import { normalizePage } from './basePages'
import { getWagtailRawBody } from "~/utilities/helpers"
import { estimateMp3Duration } from '~/server/utils/duration'
import axios from 'axios'
import memoize from 'memoize'

// Simplecast article data interface
interface SimplecastArticle {
  id?: string
  episodeId?: string
  uuid?: string
  title?: string
  description?: string
  longDescription?: string
  slug?: string
  type?: string
  publishedAt?: string
  updatedAt?: string
  duration?: number
  audioFileUrl?: string
  enclosureUrl?: string
  episodeUrl?: string
  imageUrl?: string
  transcription?: string
  number?: number
  guid?: string
  isPublished?: boolean
  showId?: string
  show_id?: string
  showTitle?: string
  show_title?: string
  showImageUrl?: string
  show_image_url?: string
  keywords?: {
    collection?: Array<{ value?: string }>
  }
  podcast?: {
    title?: string
    href?: string
    imageUrl?: string
  }
  season?: {
    number?: number
  }
  [key: string]: unknown
}

// Get a list of article pages using the Aviary /pages api
export function findArticlePages (queryParams: any) {
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
export function searchArticlePages (queryParams: any) {
  const params = Object.assign({}, queryParams)
  return useAviary('/search/', { params })
}

// Get a relative link to an article
function getWagtailArticleLink (articleData): string {
  if (articleData.ancestry)
    return `/story/${articleData.meta.slug}`

  else if (articleData.path)
    return articleData.path.replace('/home/', '/story/')

  return '/'
}

//Get a relative link to an article in publisher
function getPublisherArticleLink (articleData): string {
  return `/story/${articleData.attributes.slug}`
}

// Get a relative link to an article (generic for search results)
function getArticleLink (articleData): string {
  // If link is already provided in the data, use it
  if (articleData.link) {
    return articleData.link
  }

  // Fallback to CMS-specific logic
  if (articleData.ancestry || articleData.meta?.slug) {
    return getWagtailArticleLink(articleData)
  } else if (articleData.attributes?.slug) {
    return getPublisherArticleLink(articleData)
  }

  // Last fallback
  return '/'
}

// Transform author data from the API into a simpler and typed format
export function normalizeAuthor (author: Record<string, any>): Author {
  const config = useRuntimeConfig()
  return {
    id: author.id,
    firstName: author.firstName,
    lastName: author.lastName,
    organization: author.contributingOrganization?.name,
    organizationUrl: author.contributingOrganization?.url,
    name: author.firstName ? `${author.firstName} ${author.lastName}` : author.name,
    photoID: author.photo,
    jobTitle: author.jobTitle,
    biography: author.biography,
    website: author.website,
    email: author.email,
    slug: author.slug,
    url: author.slug && `/staff/${author.slug}`,
    shareUrl: `${config.public.BFF_URL}${mediaTypeRoutes[mediaTypes.STAFF]}${author.slug}`,
    socialMediaProfile: author.socialMediaProfile,
  }
}


/**
 * Normalize an article page object from Publisher or Wagtail into a generic ArticlePage object.
 * @param article 
 * @returns 
 */
export async function normalizeArticlePage (article: Record<string, any | undefined>): Promise<ArticlePage> {

  if (article.cmsSource === cmsSources.WAGTAIL)
    return await normalizeWagtailPage(article)
  else if (article.cmsSource === cmsSources.PUBLISHER)
    return await normalizePublisherPage(article)
  else if (article.cmsSource === cmsSources.SIMPLECAST)
    return await normalizeSimplecastPage(article)
  else
    return null
}

/**
 * Normalize an article page object from Publisher or Wagtail into a generic ArticlePage object.
 * @param article 
 * @returns 
 */
export async function normalizeArticleListItem (article: Record<string, any | undefined>): Promise<ArticlePage> {

  if (article.cmsSource === cmsSources.WAGTAIL)
    return await normalizeWagtailListItem(article)
  else if (article.cmsSource === cmsSources.PUBLISHER)
    return await normalizePublisherListItem(article)
  else if (article.cmsSource === cmsSources.SIMPLECAST)
    return await normalizeSimplecastListItem(article)
  else
    return null
}

// normalize person social media data
function normalizePersonSocial (social: Record<string, any>): ISocial {
  return {
    id: social.contactString,
    service: social.service,
    profileUrl: social?.contactString?.replace("@", "") || null,
  }
}

// Transform person data from the API into a simpler and typed format
export function normalizePerson (person: Record<string, any>): Person {
  const config = useRuntimeConfig()
  const pa = person.attributes
  return {
    id: person.id,
    name: pa.name,
    photoID: pa.image?.template ?? null,
    image: pa.image ?? null,
    jobTitle: pa.jobTitle,
    biography: pa.bio,
    website: pa.website,
    email: pa.email,
    slug: pa.slug,
    url: `/people/${pa.slug}`,
    shareUrl: `${config.public.BFF_URL}${mediaTypeRoutes[mediaTypes.PEOPLE]}${pa.slug}`,
    socialMediaProfile: pa.social.length > 0 ? pa.social.map(normalizePersonSocial) : null, // Fix: Wrap the normalizePersonSocial result in an array
    shows: pa.shows,
  }
}


// Wagtail: Transform page data from the API into a simpler and typed format
export async function normalizeWagtailPage (article: Record<string, any | undefined>): ArticlePage {
  if (typeof article === 'undefined')
    return null
  const config = useRuntimeConfig()
  return Object.assign({}, await normalizePage(article), {
    description: article.description,
    image: article.leadAsset?.[0]?.value?.image ?? article.leadAsset?.[0]?.value?.defaultImage ?? article.showArt,
    imageFullWidth: article.leadAsset?.[0]?.value?.image?.width ?? article.leadAsset?.[0]?.value?.defaultImage?.width,
    imageFullHeight: article.leadAsset?.[0]?.value?.image?.height ?? article.leadAsset?.[0]?.value?.defaultImage?.height,
    leadImageCaption: article.leadAsset?.[0]?.value?.caption || article.leadAsset?.[0]?.value?.image?.caption,
    imageLink: article.leadAsset?.[0]?.value?.imageLink,
    link: getWagtailArticleLink(article),
    cmsSource: cmsSources.WAGTAIL,
    leadAsset: article.leadAsset?.[0],
    leadImage: article.leadAsset?.[0]?.type === 'lead_image' ? article.leadAsset?.[0]?.value.image : undefined,
    leadGallery: article.leadAsset?.[0]?.type === 'lead_gallery' ? article.leadAsset?.[0]?.value : undefined, gallerySlides: article.leadAsset?.[0]?.type === 'lead_gallery' ? article.leadAsset?.[0]?.slides : undefined,
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
    //url: article.url,
    url: null,
    shareUrl: `${config.public.BFF_URL}${getWagtailArticleLink(article)}`,
    section: { name: article.ancestry?.[0].title, slug: article.ancestry?.[0].slug },
    body: article.body,
    rawBody: getWagtailRawBody(article.body),
    audio: article.audio,
    hasAudio: article.audio ? true : false,
    aboutModule: article?.aboutModule,
    inPageNavigation: article?.inPageNavigation,
    linkedDataSource: article?.linkedDataSource,
    topper: {
      topperTitle: article?.topperTitle,
      topperDescription: article?.description,
      topperBackground: article?.topperBackground,
    },
    canDownloadEpisodes: article?.canDownloadEpisodes || false,
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


// Wagtail: Transform page data from the API into a simpler and typed format
export async function normalizeWagtailListItem (article: Record<string, any | undefined>): ArticlePage {
  if (typeof article === 'undefined')
    return null

  const isEventItem = article.contentType === 'event_page' || article.type === 'event'
  const normalizedImage = isEventItem
    ? (
      article.image
      ?? article.listingImage
      ?? article.content?.listingImage
      ?? article.leadAsset?.[0]?.value?.image
      ?? article.leadAsset?.[0]?.value?.defaultImage
    )
    : (article.leadAsset?.[0]?.value?.image ?? article.leadAsset?.[0]?.value?.defaultImage ?? article.image)
  return Object.assign({}, await normalizePage(article), {
    image: normalizedImage,
    imageFullWidth: normalizedImage?.width ?? article.leadAsset?.[0]?.value?.image?.width ?? article.leadAsset?.[0]?.value?.defaultImage?.width,
    imageFullHeight: normalizedImage?.height ?? article.leadAsset?.[0]?.value?.image?.height ?? article.leadAsset?.[0]?.value?.defaultImage?.height,
    cmsSource: cmsSources.WAGTAIL,
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
    url: article.url,
    shareUrl: article.url,
    section: { name: article.ancestry?.[0].title, slug: article.ancestry?.[0].slug },
    rawBody: getWagtailRawBody(article.body),
    audio: article.audio,
    hasAudio: article.audio ? true : false,
    canDownloadEpisodes: article?.canDownloadEpisodes || false,
    // for comments
    estimatedDuration: undefined,
    readingTime: article.readingTime,
    sortDate: article.sortDate,
    meta: article.meta,
    showTitle: article.showTitle,
    tease: article.body,

    // Event-specific fields
    contentType: article.contentType,
    subtitle: article.subtitle,
    body: article.body,
    eventDate: article.eventDate,
    endDate: article.endDate,
    startTime: article.startTime,
    endTime: article.endTime,
    duration: article.duration,
    ticketUrl: article.ticketUrl,
    price: article.price,
    eventLocation: article.eventLocation,
    venueName: article.venueName,
    eventUrl: article.eventUrl,
    startDatetime: article.startDatetime,
    endDatetime: article.endDatetime,
  })
}

// SimpleCast: Transform page data from the SimpleCast API into a simpler and typed format
export async function normalizeSimplecastListItem (article: Record<string, any | undefined>): ArticlePage {
  if (typeof article === 'undefined')
    return null
  const config = useRuntimeConfig()
  // Simplecast uses UUIDs as episode IDs - preserve the original UUID for API calls
  const simplecastId = article.id || article.episodeId || article.uuid

  // Extract show UUID from CMS data
  const showId = article.showId || article.show_id
  const showTitle = article.showTitle || article.show_title
  const showImageUrl = article.showImageUrl || article.show_image_url

  return Object.assign({}, await normalizePage(article), {
    tease: article.description, // OVERRIDE from the normalizePage
    uuid: simplecastId, // Preserve the Simplecast UUID
    showId, // Preserve the show UUID
    showSlug: showId, // Use showId as slug for Simplecast shows
    description: article.subtitle || article.description,
    image: article.image || article.imageUrl,
    imageFullWidth: undefined,
    imageFullHeight: undefined,
    cmsSource: cmsSources.SIMPLECAST,
    type: 'episode',
    authors: undefined,
    contributingOrganizations: undefined,
    sponsors: undefined,
    publicationDate: (article.publishedAt && new Date(article.publishedAt)),
    updatedDate: undefined,
    showAsFeature: undefined,
    sensitiveContent: undefined,
    provocativeContent: undefined,
    sponsoredContent: undefined,
    relatedLinks: undefined,
    url: article.url,
    shareUrl: `${config.public.BFF_URL}${mediaTypeRoutes.simplecast}${simplecastId}`,
    link: `${mediaTypeRoutes.simplecast}${simplecastId}`,
    section: undefined,
    //rawBody: getWagtailRawBody(article.body),
    body: article.body,
    audio: article.enclosureUrl,
    hasAudio: article.enclosureUrl ? true : false,
    canDownloadEpisodes: article?.canDownloadEpisodes || false,
    // for comments
    estimatedDuration: article.duration,
    sortDate: article.publishedAt,
    meta: { slug: article.slug, type: 'episode', simplecastId },
    showTitle,
    headers: showTitle && showImageUrl ? { brand: { title: showTitle, logoImage: { url: showImageUrl } } } : undefined,
  })
}

/**
 * Helper: Extract image data from Simplecast article
 */
function getSimplecastImage (article: SimplecastArticle) {
  if (article.imageUrl) {
    return { url: article.imageUrl }
  }
  if (article.podcast?.imageUrl) {
    return { url: article.podcast.imageUrl }
  }
  return undefined
}

/**
 * Helper: Extract show information from Simplecast article
 */
function getSimplecastShowInfo (article: SimplecastArticle) {
  const showId = article.showId || article.show_id
  const showTitle = article.showTitle || article.show_title || article.podcast?.title
  const showImageUrl = article.showImageUrl || article.show_image_url || article.podcast?.imageUrl

  return { showId, showTitle, showImageUrl }
}

/**
 * Helper: Extract show object from Simplecast article
 */
function getSimplecastShow (article: SimplecastArticle, showTitle?: string) {
  if (article.podcast) {
    return { title: article.podcast.title, url: article.podcast.href }
  }
  if (showTitle) {
    return { title: showTitle }
  }
  return undefined
}

/**
 * Helper: Extract headers from Simplecast show info
 */
function getSimplecastHeaders (showTitle?: string, showImageUrl?: string) {
  if (showTitle && showImageUrl) {
    return { brand: { title: showTitle, logoImage: { url: showImageUrl } } }
  }
  return undefined
}

/**
 * Helper: Extract and process tags from Simplecast article
 */
function getSimplecastTags (article: SimplecastArticle): string[] {
  return article.keywords?.collection?.filter(k => k?.value)?.map(k => k.value) || []
}

/**
 * Helper: Calculate or estimate duration for Simplecast article
 */
async function getSimplecastDuration (article: SimplecastArticle): Promise<number | undefined> {
  const duration = article.duration
  if (duration && typeof duration === 'number' && duration > 0) {
    return duration
  }
  const audioUrl = article.audioFileUrl || article.enclosureUrl
  return await estimateMp3Duration(audioUrl)
}

/**
 * Normalize an article page object from Simplecast into a generic ArticlePage object.
 * @param article 
 * @returns 
 */
export async function normalizeSimplecastPage (article: SimplecastArticle): Promise<ArticlePage> {
  if (typeof article === 'undefined')
    return null
  const config = useRuntimeConfig()
  const duration = await getSimplecastDuration(article)
  const simplecastId = article.id
  const { showId, showTitle, showImageUrl } = getSimplecastShowInfo(article)
  const image = getSimplecastImage(article)
  const audioUrl = article.audioFileUrl || article.enclosureUrl
  const bodyText = article.longDescription || article.description
  return Promise.resolve(Object.assign({}, normalizePage(article), {
    tease: article.description, // OVERRIDE from the normalizePage
    uuid: simplecastId,
    showId,
    showSlug: showId,
    description: article.description || article.longDescription,
    image,
    imageFullWidth: undefined,
    imageFullHeight: undefined,
    leadImageCaption: undefined,
    imageLink: undefined,
    type: article.type || 'episode',
    link: `${mediaTypeRoutes.simplecast}${simplecastId}`,
    cmsSource: cmsSources.SIMPLECAST,
    sortDate: article.publishedAt,
    leadAsset: undefined,
    leadImage: undefined,
    leadGallery: undefined,
    meta: {
      firstPublishedAt: article.publishedAt && new Date(article.publishedAt),
      slug: article.slug,
      simplecastId,
      type: article.type || 'episode',
    },
    title: article.title,
    gallerySlides: undefined,
    legacyId: article.id,
    authors: undefined,
    contributingOrganizations: undefined,
    sponsors: undefined,
    publicationDate: article.publishedAt && new Date(article.publishedAt),
    updatedDate: article.updatedAt && new Date(article.updatedAt),
    showAsFeature: undefined,
    sensitiveContent: undefined,
    provocativeContent: undefined,
    sponsoredContent: undefined,
    relatedLinks: undefined,
    tags: getSimplecastTags(article),
    //url: article.episodeUrl,
    url: null,
    shareUrl: `${config.public.BFF_URL}${mediaTypeRoutes.simplecast}${simplecastId}`,
    section: undefined,
    body: bodyText,
    rawBody: bodyText,
    audio: audioUrl,
    hasAudio: Boolean(audioUrl),
    canDownloadEpisodes: article?.canDownloadEpisodes || false,
    listingImage: image,
    socialImage: image,
    disableComments: undefined,
    commentId: undefined,
    estimatedDuration: duration,
    show: getSimplecastShow(article, showTitle),
    showTitle,
    headers: getSimplecastHeaders(showTitle, showImageUrl),
    segments: undefined,
    transcript: article.transcription,
    embedCode: undefined,
    episodeNumber: article.number,
    seasonNumber: article.season?.number,
    guid: article.guid,
    isPublished: article.isPublished,
  }))
}

/**
 * Normalize an article page object from Publisher into a generic ArticlePage object.
 * @param article 
 * @returns 
 */
export async function normalizePublisherPage (article: Record<string, any | undefined>): Promise<ArticlePage> {
  if (typeof article === 'undefined')
    return null
  let duration = article.attributes.estimatedDuration
  if (!duration || typeof duration !== 'number' || duration === 0) {
    duration = await estimateMp3Duration(article.attributes.audio)
  }

  //segment audio duration
  const segments = article.attributes.segments
  if (segments && segments.length > 0) {
    segments.forEach(async (segment, index) => {
      if (!segment.audioDurationReadable) {
        article.attributes.segments[index].audioDurationReadable = await estimateMp3Duration(article.attributes.audio[index])
      }
    })
  }
  const authors = article.attributes.appearances?.authors.map(normalizeAuthor)
  const config = useRuntimeConfig()
  // Remove publisher author fields because we don't haven't built out the author pages for publisher
  authors.forEach((author) => {
    delete author.slug
    delete author.url
  })
  return Promise.resolve(Object.assign({}, await normalizePage(article), {
    description: article?.attributes?.tease,
    image: article.type === 'show' || article.type === 'tout' ? article.attributes.image : article.attributes.imageMain,
    imageFullWidth: article.type === 'show' || article.type === 'tout' ? article.attributes.image?.w : article.attributes.imageMain?.w,
    imageFullHeight: article.type === 'show' || article.type === 'tout' ? article.attributes.image?.h : article.attributes.imageMain?.h,
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
    authors,
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
    //url: article.attributes.url,
    url: null,
    shareUrl: `${config.public.BFF_URL}${getPublisherArticleLink(article)}`,
    section: undefined, //Does this exist in publisher?
    body: article.attributes.body,
    rawBody: article.attributes.body,
    audio: article.attributes.audio,
    hasAudio: article.attributes.audio ? true : false,
    canDownloadEpisodes: article.attributes.audioMayDownload || false,
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

/**
 * Normalize an article page object from Publisher into a generic ArticlePage object.
 * @param article 
 * @returns 
 */
export async function normalizePublisherListItem (article: Record<string, any | undefined>): Promise<ArticlePage> {
  if (typeof article === 'undefined')
    return null
  let duration = article.attributes.estimatedDuration
  if (!duration || typeof duration !== 'number' || duration === 0) {
    duration = await estimateMp3Duration(article.attributes.audio)
  }

  //segment audio duration
  const segments = article.attributes.segments
  if (segments && segments.length > 0) {
    segments.forEach(async (segment, index) => {
      if (!segment.audioDurationReadable) {
        article.attributes.segments[index].audioDurationReadable = await estimateMp3Duration(article.attributes.audio[index])
      }
    })
  }
  return Promise.resolve(Object.assign({}, await normalizePage(article), {
    image: article.type === 'show' || article.type === 'tout' ? article.attributes.image : article.attributes.imageMain,
    imageFullWidth: article.type === 'show' || article.type === 'tout' ? article.attributes.image?.w : article.attributes.imageMain?.w,
    imageFullHeight: article.type === 'show' || article.type === 'tout' ? article.attributes.image?.h : article.attributes.imageMain?.h,
    type: article.type === 'show' || article.type === 'tout' ? article.type : article.attributes.itemType,
    cmsSource: cmsSources.PUBLISHER,
    meta: {
      firstPublishedAt: article.attributes.publishAt && new Date(article.attributes.publishAt),
      slug: article.attributes.slug,
    },
    title: article.attributes.title,
    tease: article.attributes.tease,
    authors: article.attributes.appearances?.authors.map(normalizeAuthor),
    contributingOrganizations: article.attributes?.producingOrganizations,
    publicationDate: article.attributes.publishAt && new Date(article.attributes.publishAt),
    url: article.attributes.url,
    shareUrl: article.attributes.url,
    rawBody: null,
    body: article.attributes.body,
    audio: article.attributes.audio,
    hasAudio: article.attributes.audio ? true : false,
    canDownloadEpisodes: article.attributes?.audioMayDownload || false,
    estimatedDuration: duration,
    show: article.attributes.show,
    showTitle: article.attributes.showTitle,
    headers: article.attributes.headers,
  }))
}

// fetch tweet/X content from tweetId
const fetchTweetEmbed = async (tweetId) => {
  const response = await fetch(`https://publish.twitter.com/oembed?url=https://twitter.com/web/status/${tweetId}`)
  const data = await response.json()
  return data.html
}

// get authors
const getAuthorsFromBylineUrl = memoize(async (url: string): Promise<Author> => {
  const config = useRuntimeConfig()
  const options = {
    method: 'GET',
    url: `${config.public.NPR_CDS_API}${url}`,
    headers: {
      Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
    },
  }
  let response = null
  try {
    response = await axios(options)
  } catch (e) {
    if (e.response && e.response.status === 404) {
      console.error('404 = ', e)
    } else {
      console.error(e)
    }
  }
  let image
  let biography = ''
  const res = response?.data?.resources[0]
  if (res?.assets !== undefined && res?.assets !== null) {
    for (const asset of Object.values(res?.assets)) {
      if (asset.profiles[0]?.href === '/v1/profiles/image') {
        image = asset.enclosures.filter((enclosure) => {
          return enclosure.rels.includes('primary')
        })[0]?.hrefTemplate
      }
    }
  }
  if (res.layout !== undefined && res.layout !== null) {
    for (const layoutItem of Object.values(res.layout)) {
      const layoutId = layoutItem?.href?.substring(layoutItem.href.lastIndexOf("/") + 1)
      if (res?.profiles[0]?.href === '/v1/profiles/text') {
        biography += response?.data?.resources[layoutId]?.text ? `<p>${response?.data?.resources[layoutId]?.text}</p>` : ''
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
  }
  return author
})

// get show info from program collection url
const getShowInfoFromProgramUrl = memoize(async (url: string): Promise<{ title: string; slug?: string }> => {
  const config = useRuntimeConfig()
  const options = {
    method: 'GET',
    url: `${config.public.NPR_CDS_API}${url}`,
    headers: {
      Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
    },
  }

  try {
    const response = await axios(options)
    const resource = response?.data?.resources?.[0]
    const showTitle = resource?.title || 'NPR'
    // Extract slug from nprWebsitePath (e.g., "/programs/all-things-considered/" -> "all-things-considered")
    const nprPath = resource?.nprWebsitePath
    const showSlug = nprPath ? nprPath.split('/').filter(Boolean).pop() : undefined
    return { title: showTitle, slug: showSlug }
  } catch (e) {
    console.error('Error fetching show info from NPR:', e)
    return { title: 'NPR' }
  }
})

// NPR Article Type Definitions
interface NprEnclosure {
  href?: string
  hrefTemplate?: string
  type?: string
  rels?: string[]
}

interface NprProfile {
  href: string
}

interface NprAsset {
  id?: string
  profiles?: NprProfile[]
  text?: string
  html?: string
  videoId?: string
  tweetId?: string
  caption?: string
  producer?: string
  provider?: string
  enclosures?: NprEnclosure[]
  duration?: number
}

interface NprLayoutItem {
  href?: string
}

interface NprImage {
  href: string
}

interface NprCollection {
  rels?: string[]
  href?: string
}

interface NprWebPage {
  href: string
}

interface NprArticle {
  id: string
  title?: string
  publishDateTime?: string
  editorialLastModifiedDateTime?: string
  teaser?: string
  showTitle?: string
  webPages?: NprWebPage[]
  images?: NprImage[]
  assets?: Record<string, NprAsset>
  layout?: NprLayoutItem[]
  collections?: NprCollection[]
}

// Helper: Convert NPR image ID from href format to asset key format
// Converts 'g-s1-106569' to 'gS1106569' (remove hyphens, camelCase)
const convertNprImageId = (id: string): string => {
  if (!id) return id
  // Convert from kebab-case to camelCase: g-s1-106569 -> gS1106569
  return id.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase())
}

// Helper: Get image credits for NPR content
const getNprImageCredits = (imageInfo: NprAsset): string => {
  if (imageInfo.producer && imageInfo.provider) {
    return `${imageInfo.producer}/${imageInfo.provider}`
  }
  if (imageInfo.producer) {
    return imageInfo.producer
  }
  if (imageInfo.provider) {
    return imageInfo.provider
  }
  return 'NPR'
}

// Helper: Process text asset
const processTextAsset = (asset: NprAsset): string => {
  return asset.text ? `<p>${asset.text}</p>` : ''
}

// Helper: Process HTML block asset
const processHtmlAsset = (asset: NprAsset): string => {
  return asset?.html || ''
}

// Helper: Process YouTube video asset
const processYoutubeAsset = (asset: NprAsset): string => {
  const videoID = asset.videoId
  return `<div class="user-embedded-video"><div><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>\n`
}

// Helper: Process tweet asset
const processTweetAsset = async (asset: NprAsset): Promise<string> => {
  const tweetHTML = await fetchTweetEmbed(asset.tweetId)
  return tweetHTML || ''
}

// Helper: Process image asset
const processImageAsset = (asset: NprAsset): string => {
  const imageHTML = asset.enclosures?.[0]?.hrefTemplate
    ? `<div class="mt-4 html-img"><img src="${asset.enclosures[0].hrefTemplate}" alt="${asset.caption}"/></div>`
    : ""

  const imageHTMLCaption = asset.caption
    ? `<div class="mt-1 mb-6"><p class=" my-0 text-xs opacity-70">${asset.caption}</p><p class="mt-0 text-xs opacity-70 font-italic">${getNprImageCredits(asset)}</p></div>`
    : ""

  return imageHTML + imageHTMLCaption
}

// Helper: Process NPR article layout to generate body content
const processNprLayout = async (article: NprArticle): Promise<string> => {
  let textBody = ''
  let index = 0

  if (!article.layout) {
    return textBody
  }

  for (const layoutItem of article.layout) {
    const rawLayoutId = layoutItem?.href?.substring(layoutItem.href.lastIndexOf("/") + 1)

    // Try both camelCase and kebab-case formats since NPR API is inconsistent
    const camelCaseId = rawLayoutId ? convertNprImageId(rawLayoutId) : undefined
    const asset = rawLayoutId
      ? (article?.assets?.[camelCaseId] || article?.assets?.[rawLayoutId])
      : undefined

    if (!asset?.profiles?.[0]) {
      continue
    }

    const profileHref = asset.profiles[0].href

    if (profileHref === '/v1/profiles/text') {
      textBody += processTextAsset(asset)
    } else if (profileHref === '/v1/profiles/html-block') {
      textBody += processHtmlAsset(asset)
    } else if (profileHref === '/v1/profiles/youtube-video') {
      textBody += processYoutubeAsset(asset)
    } else if (profileHref === '/v1/profiles/tweet') {
      textBody += await processTweetAsset(asset)
    } else if (profileHref === '/v1/profiles/image' && index > 0) {
      textBody += processImageAsset(asset)
    }

    index++
  }

  return textBody
}

// Helper: Extract audio information from NPR assets
const extractNprAudio = (article: NprArticle): { url?: string; duration?: number } => {
  if (!article?.assets) {
    return {}
  }

  for (const asset of Object.values(article?.assets)) {
    const hasAudioProfile = asset.profiles?.some(p => p.href === '/v1/profiles/audio')
    const hasAudioEnclosure = asset.enclosures?.some(e => e.type?.startsWith('audio/'))

    if (hasAudioProfile || hasAudioEnclosure) {
      const audioURL = asset.enclosures?.find(enclosure =>
        enclosure.type?.includes('audio/mpeg')
      )?.href || asset.enclosures?.find(enclosure =>
        enclosure.type?.startsWith('audio/')
      )?.href

      return {
        url: audioURL,
        duration: asset.duration
      }
    }
  }

  return {}
}

// Helper: Get NPR image URLs
const getNprImageUrls = (firstImage?: NprAsset) => {
  if (!firstImage?.enclosures) {
    return { square: undefined, wide: undefined }
  }

  const squareHref = firstImage.enclosures.find(e => e.rels?.includes('image-square'))
  const wideHref = firstImage.enclosures.find(e => e.rels?.includes('image-wide'))

  return {
    square: squareHref?.hrefTemplate,
    wide: wideHref?.hrefTemplate
  }
}

// Helper: Extract dimensions from NPR image URL
const extractImageDimensions = (image?: string): { w: number; h: number } => {
  if (!image) {
    return { w: 0, h: 0 }
  }

  const cropRegex = /crop\/(\d+)x(\d+)/
  const cropMatch = cropRegex.exec(image)
  if (cropMatch) {
    return {
      w: parseInt(cropMatch[1], 10),
      h: parseInt(cropMatch[2], 10)
    }
  }

  return { w: 0, h: 0 }
}

// Normalize an article page object from NPR into a generic ArticlePage object.
export async function normalizeNprPage (article: NprArticle, componentType = "default", showSlug?: string): Promise<ArticlePage> {
  const config = useRuntimeConfig()
  const id = article.id
  const firstImageHref = article.images?.[0]?.href
  const rawImageId = firstImageHref?.substring(firstImageHref.lastIndexOf("/") + 1)

  // Try both camelCase and kebab-case formats since NPR API is inconsistent
  const camelCaseId = rawImageId ? convertNprImageId(rawImageId) : undefined
  const firstImage = rawImageId
    ? (article?.assets?.[camelCaseId] || article?.assets?.[rawImageId])
    : undefined

  /*   console.log('NPR Image Debug:', {
      articleId: id,
      hasImages: Boolean(article.images),
      imageCount: article.images?.length,
      firstImageHref,
      rawImageId,
      camelCaseId,
      hasFirstImage: Boolean(firstImage),
      hasAssets: Boolean(article.assets),
      assetKeys: article.assets ? Object.keys(article.assets).slice(0, 10) : [],
      firstImageAsset: firstImage ? 'FOUND!' : 'not found'
    }) */

  const firstImageCaption = firstImage?.caption

  const { square, wide } = getNprImageUrls(firstImage)
  const image = componentType === 'default' ? (square ?? wide) : (wide ?? square)

  //console.log('NPR Image URLs:', { square, wide, selected: image })

  const textBody = await processNprLayout(article)
  const { url: audioURL, duration: audioDuration } = extractNprAudio(article)

  const bylineUrl = article.collections?.find(c => c.rels?.includes('byline'))?.href ?? null
  const authors = bylineUrl ? [await getAuthorsFromBylineUrl(bylineUrl)] : null

  // Fetch show info from program collection if available
  const programUrl = article.collections?.find(c => c.rels?.includes('program'))?.href ?? null
  const showInfo = programUrl ? await getShowInfoFromProgramUrl(programUrl) : { title: article.showTitle ?? 'NPR' }
  const derivedShowSlug = showInfo.slug || showSlug

  const dimensions = extractImageDimensions(image)

  return Promise.resolve({
    id,
    uuid: article.id,
    title: article.title,
    publicationDate: article.publishDateTime,
    publishAt: article.publishDateTime,
    updatedDate: article.editorialLastModifiedDateTime,
    tease: article.teaser,
    description: article.teaser,
    image,
    imageFullWidth: dimensions.w,
    imageFullHeight: dimensions.h,
    leadImageCaption: firstImageCaption,
    cmsSource: cmsSources.NPR,
    audio: audioURL ?? null,
    hasAudio: Boolean(audioURL),
    type: audioURL ? mediaTypes.NPR_EPISODE : mediaTypes.NPR_ARTICLE,
    estimatedDuration: audioDuration ?? null,
    meta: {
      firstPublishedAt: article.publishDateTime,
      slug: id,
      ...(derivedShowSlug ? { showSlug: derivedShowSlug } : {}),
    },
    showTitle: showInfo.title,
    body: textBody,
    rawBody: textBody,
    link: article.webPages?.[0]?.href ?? '/',
    shareUrl: `${config.public.BFF_URL}${mediaTypeRoutes[mediaTypes.NPR_ARTICLE]}${article.id}`,
    authors,
  })
}

/**
 * Helper: Get the first lead asset from search results
 */
const getLeadAsset = (result: any) => result.leadAsset?.[0]

/**
 * Helper: Get primary image from search results (from explicit image or lead asset)
 */
const getPrimaryImage = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return result.image ?? leadAsset?.value?.image ?? leadAsset?.value?.defaultImage
}

/**
 * Helper: Get image width dimension
 */
const getImageWidth = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return result.image ?? leadAsset?.value?.image?.w ?? leadAsset?.value?.defaultImage?.w
}

/**
 * Helper: Get image height dimension
 */
const getImageHeight = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return result.image ?? leadAsset?.value?.image?.h ?? leadAsset?.value?.defaultImage?.h
}

/**
 * Helper: Get lead image caption from search results
 */
const getLeadImageCaption = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return leadAsset?.value?.caption ?? leadAsset?.value?.image?.caption
}

/**
 * Helper: Get lead image if type is 'lead_image'
 */
const getLeadImage = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return leadAsset?.type === 'lead_image' && leadAsset?.value.image
}

/**
 * Helper: Get lead gallery if type is 'lead_gallery'
 */
const getLeadGallery = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return leadAsset?.type === 'lead_gallery' && leadAsset?.value
}

/**
 * Helper: Get gallery slides if type is 'lead_gallery'
 */
const getGallerySlides = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return leadAsset?.type === 'lead_gallery' && leadAsset?.slides
}

/**
 * Helper: Get publication date from search results
 */
const getPublicationDate = (result: any) => {
  if (result.publicationDate) {
    return new Date(result.publicationDate)
  }
  if (result.meta?.firstPublishedAt) {
    return new Date(result.meta.firstPublishedAt)
  }
  return undefined
}

/**
 * Helper: Get updated date from search results
 */
const getUpdatedDate = (result: any) => {
  return result.updatedDate ? new Date(result.updatedDate) : undefined
}

/**
 * Helper: Get section information from search results
 */
const getSectionInfo = (result: any) => {
  const firstAncestor = result.ancestry?.[0]
  return firstAncestor ? { name: firstAncestor.title, slug: firstAncestor.slug } : undefined
}

/**
 * Helper: Get listing image from search results
 */
const getListingImage = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return result.listingImage || leadAsset?.value?.image || leadAsset?.value?.defaultImage
}

/**
 * Helper: Get social/OG image from search results
 */
const getSocialImage = (result: any) => {
  const leadAsset = getLeadAsset(result)
  return result.socialImage || leadAsset?.value?.image || leadAsset?.value?.defaultImage
}

/**
 * Helper: Get comment ID from search results
 */
const getCommentId = (result: any) => {
  return String(result.legacyId || result.uuid)
}

// Transform page data from the API into a simpler and typed format
export function normalizeSearchResults (results: Record<string, any | undefined>): ArticlePage {
  const result = results.result

  return {
    id: result.id,
    type: result.type,
    title: result.listingTitle || result.title,
    description: result.description,
    tease: result.description,
    image: getPrimaryImage(result),
    imageFullWidth: getImageWidth(result),
    imageFullHeight: getImageHeight(result),
    leadImageCaption: getLeadImageCaption(result),
    imageLink: getLeadAsset(result)?.value?.imageLink,
    link: getArticleLink(result),
    publishAt: result.publicationDate || result.meta?.firstPublishedAt,
    meta: result.meta || {
      firstPublishedAt: result.publicationDate,
      slug: result.url,
    },

    leadAsset: getLeadAsset(result),
    leadImage: getLeadImage(result),
    leadGallery: getLeadGallery(result),

    gallerySlides: getGallerySlides(result),
    legacyId: result.legacyId,
    authors: result.relatedAuthors?.map(normalizeAuthor),
    contributingOrganizations: result.relatedContributingOrganizations,
    sponsors: result.relatedSponsors,
    publicationDate: getPublicationDate(result),
    updatedDate: getUpdatedDate(result),
    showAsFeature: result.showAsFeature,
    sensitiveContent: result.sensitiveContent,
    provocativeContent: result.provocativeContent,
    sponsoredContent: result.sponsoredContent,
    relatedLinks: result.relatedLinks,
    tags: result.tags,
    url: result.url,
    shareUrl: result.url,
    uuid: result.uuid,
    section: getSectionInfo(result),
    body: result.body,
    embedCode: result.embedCode,

    // for listing pages
    listingImage: getListingImage(result),
    listingTitle: result.listingTitle || result.title,
    listingDescription: result.listingSummary || result.description,

    // for social/OG metadata
    socialImage: getSocialImage(result),
    socialTitle: result.socialTitle || result.title,
    socialDescription: result.socialText || result.description,

    preventSearchIndexing: result.preventSearchIndexing,
    seoTitle: result.meta?.seoTitle || result.title,
    searchDescription: result.meta?.searchDescription || result.description,

    // for comments
    disableComments: result.disableComments,
    commentId: getCommentId(result),
  }
}

// Transform a list of article page data from the /pages API into a simpler and typed format
export function normalizeFindArticlePagesResponse (articlesResponse: any): ArticlePage[] {
  return articlesResponse.value?.items?.map(normalizeArticlePage)
}

// Transform a list of article page data from the /search API into a simpler and typed format
export function normalizeSearchArticlePagesResponse (articlesResponse: any): ArticlePage[] {
  return articlesResponse.value?.items?.map(normalizeSearchResults)
}
