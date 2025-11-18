import type { Page } from '../types/Page'

export const WAGTAIL_PAGE_TYPES = {
  'gallery.GalleryPage': 'gallery',
  'news.ArticlePage': 'article_page',
  'standardpages.IndexPage': 'section_page',
  'standardpages.InformationPage': 'information_page',
  'tagpages.TagPage': 'tag_page',
  'event_page': 'event',
  'episode': 'episode',
}

/**
 * Convert a string (like UUID) to a safe integer by hashing
 * @param str 
 * @returns 
 */
function stringToSafeNumber (str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Convert an id to a number - handles both numeric strings and UUIDs
 * @param id 
 * @returns 
 */
function idToNumber (id: any): number {
  const num = Number(id)
  if (!isNaN(num) && isFinite(num)) {
    return num
  }
  // If it's not a valid number, hash the string
  return stringToSafeNumber(String(id))
}

/**
 * Normalize a Wagtail page object into a generic Page object.
 * @param page 
 * @returns 
 */
export function normalizePage (page: Record<string, any>): Page {
  return {
    id: idToNumber(page.id),
    title: page.title,
    uuid: page.uuid,
    type: WAGTAIL_PAGE_TYPES[page.contentType] ?? WAGTAIL_PAGE_TYPES[page.meta?.type] ?? 'unknown',

    listingTitle: page.listingTitle || page.title,
    listingDescription: page.listingSummary || page.description,
    listingImage: page.listingImage,
    preventSearchIndexing: page.preventSearchIndexing,

    socialTitle: page.socialTitle || page.title,
    socialDescription: page.socialText || page.description,
    socialImage: page.socialImage,

    seoTitle: page.meta?.seoTitle || page.title,
    searchDescription: page.meta?.searchDescription || page.title,
  }
}
