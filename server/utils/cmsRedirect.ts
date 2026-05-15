import axios from 'axios'
import { createError } from 'h3'

export const getCmsRequestOptions = (cmsSite: string) => ({
  headers: {
    'X-CMS-Site': cmsSite,
  },
  maxRedirects: 0,
  validateStatus: () => true,
})

export const normalizeCmsLocation = (location: string, baseApi: string) => {
  const base = new URL(baseApi)
  const absolute = new URL(location, base)

  // Force the origin to match the CMS API host so we don't follow redirects
  // to a placeholder site domain.
  absolute.protocol = base.protocol
  absolute.host = base.host

  return absolute.toString()
}

export const getCmsPathUrl = (baseApi: string, path: string) => {
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

export const redirectResponse = (status: number, location?: string) => {
  if (!location) {
    throw createError({ statusCode: 502, statusMessage: 'CMS redirect missing location header' })
  }

  return {
    redirect: true,
    location,
    statusCode: status,
  }
}

export const getCmsPathRedirect = async (
  baseApi: string,
  path: string,
  requestOptions: ReturnType<typeof getCmsRequestOptions>
) => {
  const redirectUrl = getCmsPathUrl(baseApi, path)
  let redirectRes = await axios.head(redirectUrl, requestOptions)

  if (redirectRes.status >= 300 && redirectRes.status < 400) {
    const location = redirectRes.headers?.location

    if (location && isSlashNormalizationRedirect(redirectUrl, location)) {
      redirectRes = await axios.head(new URL(location, redirectUrl).toString(), requestOptions)
    }
  }

  if (redirectRes.status >= 300 && redirectRes.status < 400) {
    return redirectResponse(redirectRes.status, redirectRes.headers?.location)
  }

  return null
}
