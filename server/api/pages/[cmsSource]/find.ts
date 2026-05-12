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
  return config.public.cmsSite
}

const getCmsPathUrl = (baseApi: string, path: string) => {
  const base = new URL(baseApi)
  return new URL(path, base.origin).toString()
}

const stripTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/'

const isSlashNormalizationRedirect = (fromUrl: string, location: string) => {
  const from = new URL(fromUrl)
  const to = new URL(location, from)

  return (
    from.origin === to.origin &&
    stripTrailingSlash(from.pathname) === stripTrailingSlash(to.pathname)
  )
}

const redirectResponse = (status: number, location?: string) => {
  if (!location) {
    throw createError({ statusCode: 502, statusMessage: 'CMS redirect missing location header' })
  }

  return {
    redirect: true,
    location,
    statusCode: status,
  }
}

export default defineEventHandler(async (event) => {
  const config = __getConfig()
  const { html_path, cms_site } = getQuery(event)

  if (!html_path || typeof html_path !== 'string') {
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

  const res = await axios.get(`${baseApi}pages/find/`, {
    params: { html_path },
    ...requestOptions,
  })

  if (res.status >= 300 && res.status < 400) {
    const location = res.headers?.location
    if (!location) {
      throw createError({ statusCode: 502, statusMessage: 'CMS redirect missing location header' })
    }

    const nextUrl = normalizeCmsLocation(location, baseApi)
    const pageRes = await axios.get(nextUrl, requestOptions)

    if (pageRes.status < 200 || pageRes.status >= 300) {
      throw createError({ statusCode: pageRes.status, statusMessage: 'CMS page fetch failed' })
    }

    return humps.camelizeKeys(pageRes.data)
  }

  if (res.status >= 200 && res.status < 300) {
    return humps.camelizeKeys(res.data)
  }

  if (res.status === 404) {
    const redirectUrl = getCmsPathUrl(baseApi, html_path)
    let redirectRes = await axios.get(redirectUrl, requestOptions)

    if (redirectRes.status >= 300 && redirectRes.status < 400) {
      const location = redirectRes.headers?.location

      if (location && isSlashNormalizationRedirect(redirectUrl, location)) {
        redirectRes = await axios.get(new URL(location, redirectUrl).toString(), requestOptions)
      }
    }

    if (redirectRes.status >= 300 && redirectRes.status < 400) {
      return redirectResponse(redirectRes.status, redirectRes.headers?.location)
    }

    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
  }

  throw createError({ statusCode: res.status || 500, statusMessage: 'CMS find request failed' })
})
