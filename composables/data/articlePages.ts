import type Author from '../types/Author'
import type { ArticlePage } from '../types/Page'
import { cmsSources } from '~/composables/globals'
import { normalizePage } from './basePages'

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

export function normalizeArticlePage(article: Record<string, any | undefined>): ArticlePage {
  if (article.cmsSource === cmsSources.WAGTAIL)
    return normalizeWagtailPage(article)
  else if (article.cmsSource === cmsSources.PUBLISHER)
    return normalizePublisherPage(article)
  else
    return null
}
// Wagtail: Transform page data from the API into a simpler and typed format
export function normalizeWagtailPage(article: Record<string, any | undefined>): ArticlePage {
  if (typeof article === 'undefined')
    return null

  return Object.assign({}, normalizePage(article), {
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
  })
}

export function normalizePublisherPage(article: Record<string, any | undefined>): ArticlePage {
  if (typeof article === 'undefined')
    return null
  // console.log(article.attributes)
  return Object.assign({}, normalizePage(article), {
    description: article.attributes.tease,
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
    audio: article.attributes.audio,

    // curated images
    listingImage: article.attributes.imageMain, // This may need tweaking
    socialImage: article.attributes.imageMain, // This may need tweaking

    // for comments
    disableComments: undefined,
    commentId: undefined,
    estimatedDuration: article.attributes.estimatedDuration,
    showTitle: article.attributes.showTitle,
  })
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
  console.log('yay = ', articlesResponse.value?.items)
  return articlesResponse.value?.items?.map(normalizeArticlePage)
}

// Transform a list of article page data from the /search API into a simpler and typed format
export function normalizeSearchArticlePagesResponse(articlesResponse: any): ArticlePage[] {
  return articlesResponse.value?.items?.map(normalizeSearchResults)
}
