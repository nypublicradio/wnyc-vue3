import axios from 'axios'
import humps from 'humps'
import { cmsSources, mediaTypeRoutes } from '~/composables/globals'
import { normalizeArticlePage } from '~/composables/data/articlePages'
import { transformCuratedContent } from '~/utilities/curatedContent'

// Helper to obtain runtime config, with test override support.
const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

// getting flat page data from the publisher api
const getPublisherPageData = async (pageSlug: string) => {
    const config = __getConfig()
    const res = await axios(`${config.public.PUBLISHER_BASE_API}v3/flatpages/${pageSlug}`)
    const resData = humps.camelizeKeys(res.data)
    return resData
}

// getting page data from the wagtail api
const getWagtailPageData = async (pageSlug: string, isShowOnly?: boolean) => {
    const config = __getConfig()
    const options = {
        method: 'GET',
        url: `${config.public.AVIARY_BASE_API}pages/find/`,
        params: { html_path: `${mediaTypeRoutes.show}${pageSlug}/` },
        headers: {
            'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443'
        }
    }
    try {
        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)
        // Add cmsSource to the data so normalizeArticlePage knows which normalizer to use
        resData.cmsSource = cmsSources.WAGTAIL
        //console.log("resData", resData?.body[0].value.list)
        // Transform curated content if it exists
        if (resData.body && Array.isArray(resData.body)) {
            // if isShowOnly is true, just return null and ignore the body
            // Pass the pageSlug so NPR content can include it
            const transformedCuratedContent = isShowOnly ? null : await transformCuratedContent(resData.body, 'default', pageSlug)

            // if isShowOnly is true, we don't want to return the inPageNavigation

            if (isShowOnly) {
                delete resData.inPageNavigation
            }

            return {
                ...await normalizeArticlePage(resData),
                body: transformedCuratedContent
            }
        }

        return await normalizeArticlePage(resData)
    } catch (error) {
        console.error('Error in getWagtailPageData:', error)
        throw error
    }
}

// get page data from the proper CMS
const getPageData = async (pageSlug: string, cmsSource: string, isShowOnly?: boolean) => {
    switch (cmsSource) {
        case cmsSources.WAGTAIL:
            return await getWagtailPageData(pageSlug, isShowOnly)
        case cmsSources.PUBLISHER:
            return await getPublisherPageData(pageSlug)
        default:
            return null
    };
}

// get page data from CMS
export default defineEventHandler(async (event) => {
    const pageSlug: string | undefined = event?.context?.params?.pageSlug
    const cmsSource: string | undefined = event?.context?.params?.cmsSource

    // Get query parameters (e.g. ?showOnly=true)
    const query = getQuery(event)
    const showOnly: string | undefined = query.showOnly as string | undefined

    const isShowOnly = showOnly === 'true'
    if (pageSlug && cmsSource) {
        const PageData = await getPageData(pageSlug, cmsSource, isShowOnly)

        return PageData
    } else {
        return null
    }
})
