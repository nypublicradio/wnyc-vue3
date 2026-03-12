import type { ArticlePage, InformationPage, Page, TagPage } from '../types/Page'
import { WAGTAIL_PAGE_TYPES, normalizePage } from './basePages'
import { normalizeArticlePage } from './articlePages'
import { normalizeGalleryPage } from './galleryPages'
import { normalizeTagPage } from './tagPages'
import { transformResponseData } from '~/composables/useAviary'

export async function findPage (htmlPath: string, cmsSite?: string) {
  const params = cmsSite ? { html_path: htmlPath, cms_site: cmsSite } : { html_path: htmlPath }
  console.log('[findPage] Calling useFetch with params:', params)
  console.log('[findPage] Environment:', { server: import.meta.server, client: import.meta.client })
  
  const { data, error, status } = await useFetch('/api/pages/wagtail/find', { 
    params,
    // Don't throw on error status codes - let us handle them
    ignoreResponseError: false,
  })
  
  // Debug logging
  console.log('[findPage] useFetch completed:', {
    hasData: !!data?.value,
    hasError: !!error?.value,
    status: status?.value,
    dataType: data?.value ? typeof data.value : 'undefined',
    dataPreview: data?.value ? JSON.stringify(data.value).substring(0, 200) : 'null',
    errorValue: error?.value,
    errorStatusCode: error?.value?.statusCode,
    errorMessage: error?.value?.message,
    errorData: error?.value?.data,
  })
  
  // Return refs as-is so consumers can properly access .value
  return { data, error, status }
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
