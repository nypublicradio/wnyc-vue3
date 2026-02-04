import type { ArticlePage, InformationPage, Page, TagPage } from '../types/Page'
import { WAGTAIL_PAGE_TYPES, normalizePage } from './basePages'
import { normalizeArticlePage } from './articlePages'
import { normalizeGalleryPage } from './galleryPages'
import { normalizeTagPage } from './tagPages'
import { transformResponseData } from '~/composables/useAviary'

export async function findPage (htmlPath: string, cmsSite?: string) {
  const params = cmsSite ? { html_path: htmlPath, cms_site: cmsSite } : { html_path: htmlPath }
  const { data, error } = await useFetch('/api/pages/wagtail/find', { params })
  const transformedData = transformResponseData(data)
  return { data: transformedData, error }
}

// Get a page by it's cms id
export async function usePageById (pageId: number) {
  return await useAviary(`/pages/${pageId}/`)
}

export function normalizeInformationPage (page: Record<string, any>): InformationPage {
  return Object.assign({}, normalizePage(page), { body: page.body })
}

export function normalizeFindPageResponse (pageResponse: Record<string, any>): Page | ArticlePage | TagPage | InformationPage {
  const pageType = pageResponse.value?.meta?.type
  switch (WAGTAIL_PAGE_TYPES[pageType]) {
    case 'article_page':
      return normalizeArticlePage(pageResponse.value)
    case 'gallery':
      return normalizeGalleryPage(pageResponse.value)
    case 'tag_page':
      return normalizeTagPage(pageResponse.value)
    case 'information_page':
      return normalizeInformationPage(pageResponse.value)
    default:
      return normalizePage(pageResponse.value)
  }
}
