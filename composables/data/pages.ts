import type { ArticlePage, InformationPage, Page, TagPage } from '../types/Page'
import { WAGTAIL_PAGE_TYPES, normalizePage } from './basePages'
import { normalizeArticlePage } from './articlePages'
import { normalizeGalleryPage } from './galleryPages'
import { normalizeTagPage } from './tagPages'
import { transformResponseData } from '~/composables/useAviary'
import { ref } from 'vue'

export async function findPage (htmlPath: string, cmsSite?: string) {
  const params = cmsSite ? { html_path: htmlPath, cms_site: cmsSite } : { html_path: htmlPath }
  console.log('[findPage] Calling $fetch with params:', params)
  console.log('[findPage] Environment:', { server: import.meta.server, client: import.meta.client })
  
  try {
    const response = await $fetch('/api/pages/wagtail/find', {
      params,
      // This will throw on 4xx/5xx responses
    })
    
    console.log('[findPage] $fetch SUCCESS:', {
      hasResponse: !!response,
      responseType: typeof response,
      responseKeys: response ? Object.keys(response as any) : [],
      responsePreview: response ? JSON.stringify(response).substring(0, 200) : 'null',
    })
    
    return { data: ref(response), error: ref(null), status: ref('success') }
  } catch (err: any) {
    console.log('[findPage] $fetch ERROR:', {
      errorType: typeof err,
      errorMessage: err?.message,
      errorStatusCode: err?.statusCode,
      errorData: err?.data,
      errorFull: JSON.stringify(err, null, 2).substring(0, 500),
    })
    
    return { 
      data: ref(null), 
      error: ref(err), 
      status: ref('error') 
    }
  }
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
