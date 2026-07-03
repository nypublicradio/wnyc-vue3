import axios from 'axios'
import humps from 'humps'
import { cmsSources, mediaTypeRoutes } from '~/composables/globals'
import { normalizeArticlePage } from '~/composables/data/articlePages'
import { transformCuratedContent } from '~/utilities/curatedContent'
import { getCmsPathRedirect, getCmsRequestOptions } from '~/server/utils/cmsRedirect'
import { shouldBypassServerCache } from '~/server/utils/cacheOptions'

// Helper to obtain runtime config, with test override support.
const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

const isWnycHost = (hostname: string) => hostname === 'wnyc.org' || hostname.endsWith('.wnyc.org')

const routeLegacyShowLocation = (location: string) => {
    const routedShowPrefix = mediaTypeRoutes.show.replace(/\/$/, '')
    const rewritePath = (path: string) => path.replace(/^\/shows(?=\/|$)/, routedShowPrefix)

    if (location.startsWith('/shows/') || location === '/shows') {
        return rewritePath(location)
    }

    try {
        const url = new URL(location)

        if (!isWnycHost(url.hostname) || !(url.pathname.startsWith('/shows/') || url.pathname === '/shows')) {
            return location
        }

        return `${rewritePath(url.pathname)}${url.search}${url.hash}`
    } catch {
        return location
    }
}

const parseBooleanQuery = (value: unknown): boolean => {
    if (Array.isArray(value)) {
        return parseBooleanQuery(value[0])
    }

    if (typeof value === 'boolean') {
        return value
    }

    if (typeof value === 'string') {
        return value.toLowerCase() === 'true'
    }

    return false
}

// getting flat page data from the publisher api
const getPublisherPageData = async (pageSlug: string) => {
    const config = __getConfig()
    const res = await axios(`${config.public.PUBLISHER_BASE_API}v3/flatpages/${pageSlug}`)
    const resData = humps.camelizeKeys(res.data)
    return resData
}

// getting page data from the wagtail api
const getWagtailPageData = async (pageSlug: string, isShowOnly?: boolean, isDownloadRulesOnly?: boolean, isApp?: boolean) => {
    // if the pageSlug is a url (www.example.com or example.com), just return null
    if (/^(www\.)?[^/]+\.[a-z]{2,}$/i.test(pageSlug)) {
        return {}
    }

    const config = __getConfig()
    const options = {
        method: 'GET',
        url: `${config.public.AVIARY_BASE_API}pages/find/`,
        params: { html_path: `${mediaTypeRoutes.show}${pageSlug}/` },
        headers: {
            'X-CMS-Site': config.public.cmsSite
        }
    }
    try {
        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)

        if (isDownloadRulesOnly) {
            return { canDownloadEpisodes: resData.canDownloadEpisodes ?? false }
        }

        // Add cmsSource to the data so normalizeArticlePage knows which normalizer to use
        resData.cmsSource = cmsSources.WAGTAIL
        // Transform curated content if it exists
        if (resData.body && Array.isArray(resData.body)) {
            // if isShowOnly is true, just return null and ignore the body
            // Pass the pageSlug so NPR content can include it
            let transformedCuratedContent = isShowOnly ? null : await transformCuratedContent(resData.body, 'default', pageSlug, resData)

            // if isShowOnly is true, we don't want to return the inPageNavigation

            if (isShowOnly) {
                delete resData.inPageNavigation
            }

            // In app mode, prefer curated_list blocks, but do not blank the page if none exist.
            console.log('######## isApp:', isApp, 'transformedCuratedContent:', transformedCuratedContent)
            if (isApp && Array.isArray(transformedCuratedContent)) {
                const curatedListOnly = transformedCuratedContent.filter((item: any) => item?.type === 'curated_list')
                if (curatedListOnly.length > 0) {
                    transformedCuratedContent = curatedListOnly
                }
            }

            return {
                ...await normalizeArticlePage(resData),
                body: transformedCuratedContent
            }
        }
        return await normalizeArticlePage(resData)
    } catch (error: any) {
        if (error?.response?.status === 404) {
            const requestOptions = getCmsRequestOptions(config.public.cmsSite)
            const redirectPaths = [
                `${mediaTypeRoutes.show}${pageSlug}`,
                `/shows/${pageSlug}`,
            ]

            for (const path of redirectPaths) {
                const redirect = await getCmsPathRedirect(config.public.AVIARY_BASE_API, path, requestOptions)
                if (redirect) {
                    return {
                        ...redirect,
                        location: routeLegacyShowLocation(redirect.location),
                    }
                }
            }

            // Nuxt expects proper error objects to avoid generic 500 noise
            throw createError({ statusCode: 404, statusMessage: `Page not found: ${pageSlug}` })
        }
        console.error('Error in getWagtailPageData!:', pageSlug, error)
        throw error
    }
}

// get page data from the proper CMS
const getPageData = async (pageSlug: string, cmsSource: string, isShowOnly?: boolean, isDownloadRulesOnly?: boolean, isApp?: boolean) => {
    switch (cmsSource) {
        case cmsSources.WAGTAIL:
            return await getWagtailPageData(pageSlug, isShowOnly, isDownloadRulesOnly, isApp)
        case cmsSources.PUBLISHER:
            return await getPublisherPageData(pageSlug)
        default:
            return null
    };
}

// get page data from CMS
export default defineCachedEventHandler(async (event) => {
    const pageSlug: string | undefined = event?.context?.params?.pageSlug
    const cmsSource: string | undefined = event?.context?.params?.cmsSource

    // Get query parameters (e.g. ?showOnly=true)
    const query = getQuery(event)
    const isShowOnly = parseBooleanQuery(query.showOnly)
    const isDownloadRulesOnly = parseBooleanQuery(query.downloadRulesOnly)
    const isApp = parseBooleanQuery(query.isApp)

    if (pageSlug && cmsSource) {
        const PageData = await getPageData(pageSlug, cmsSource, isShowOnly, isDownloadRulesOnly, isApp)

        return PageData
    } else {
        return null
    }
}, {
    maxAge: 300,
    swr: true,
    shouldBypassCache: shouldBypassServerCache,
    name: 'pages',
    getKey: (event) => {
        const slug = event?.context?.params?.pageSlug ?? ''
        const cmsSource = event?.context?.params?.cmsSource ?? ''
        const query = getQuery(event)
        return `${cmsSource}:${slug}:${query.showOnly ?? ''}:${query.downloadRulesOnly ?? ''}:${query.isApp ?? ''}`
    }
})
