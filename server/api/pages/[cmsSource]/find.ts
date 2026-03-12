import axios from 'axios'
import humps from 'humps'
import { getQuery, createError } from 'h3'

// Helper to obtain runtime config, with test override support.
const __getConfig = () => {
  const testCfg = (globalThis as any)?.__testRuntimeConfig
  return testCfg ?? useRuntimeConfig()
}
// normalize the cms location
const normalizeCmsLocation = (location: string, baseApi: string) => {
  const base = new URL(baseApi)
  const absolute = new URL(location, base)

  // Force the origin to match the CMS API host so we don't follow redirects
  // to a placeholder site domain.
  absolute.protocol = base.protocol
  absolute.host = base.host

  return absolute.toString()
}
// if cms_site is passed in, use it, otherwise use the default
const resolveCmsSite = (config: ReturnType<typeof __getConfig>, override?: string | null) => {
  if (override) {
    return override
  }
  return config.cmsSite || 'demo.wnyc.org:443'
}

export default defineEventHandler(async (event) => {
  const config = __getConfig()
  const { html_path, cms_site } = getQuery(event)

  console.log('[find API] ============ START REQUEST ============')
  console.log('[find API] Request received:', { html_path, cms_site })
  console.log('[find API] Config:', {
    baseApi: config.public.AVIARY_BASE_API,
    cmsSite: config.cmsSite,
  })

  if (!html_path || typeof html_path !== 'string') {
    console.log('[find API] ERROR: Missing html_path')
    throw createError({ statusCode: 400, statusMessage: 'Missing html_path' })
  }

  const baseApi = config.public.AVIARY_BASE_API
  const cmsSite = resolveCmsSite(config, typeof cms_site === 'string' ? cms_site : null)
  const requestOptions = {
    headers: {
      'X-CMS-Site': cmsSite,
    },
    maxRedirects: 0,
    validateStatus: () => true,
  }

  console.log('[find API] Making request to CMS:', {
    url: `${baseApi}pages/find/`,
    params: { html_path },
    headers: requestOptions.headers,
  })

  const res = await axios.get(`${baseApi}pages/find/`, {
    params: { html_path },
    ...requestOptions,
  })

  console.log('[find API] CMS response status:', res.status)
  console.log('[find API] CMS response headers:', res.headers)
  console.log('[find API] CMS response data keys:', res.data ? Object.keys(res.data) : 'no data')

  if (res.status >= 300 && res.status < 400) {
    console.log('[find API] Handling redirect...')
    const location = res.headers?.location
    if (!location) {
      console.log('[find API] ERROR: Redirect without location header')
      throw createError({ statusCode: 502, statusMessage: 'CMS redirect missing location header' })
    }

    const nextUrl = normalizeCmsLocation(location, baseApi)
    console.log('[find API] Following redirect to:', nextUrl)
    const pageRes = await axios.get(nextUrl, requestOptions)

    if (pageRes.status < 200 || pageRes.status >= 300) {
      console.log('[find API] ERROR: Redirect target failed with status:', pageRes.status)
      throw createError({ statusCode: pageRes.status, statusMessage: 'CMS page fetch failed' })
    }

    console.log('[find API] Redirect successful, returning camelized data')
    return humps.camelizeKeys(pageRes.data)
  }

  if (res.status >= 200 && res.status < 300) {
    console.log('[find API] SUCCESS: Returning successful response with camelized data')
    const result = humps.camelizeKeys(res.data)
    console.log('[find API] Result keys:', Object.keys(result))
    console.log('[find API] Result preview:', JSON.stringify(result).substring(0, 500))
    console.log('[find API] ============ END REQUEST (SUCCESS) ============')
    return result
  }

  if (res.status === 404) {
    console.log('[find API] PAGE NOT FOUND: Throwing 404 error')
    console.log('[find API] ============ END REQUEST (404) ============')
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
  }

  console.log('[find API] ERROR: Unexpected status:', res.status)
  console.log('[find API] ============ END REQUEST (ERROR) ============')
  throw createError({ statusCode: res.status || 500, statusMessage: 'CMS find request failed' })
})
