import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
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
const getWagtailPageData = async (pageSlug: string) => {
    const config = __getConfig()
    const options = {
        method: 'GET',
        url: `${config.public.AVIARY_BASE_API}pages/${pageSlug}`,
        headers: {
            'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443'
        }
    }

    try {
        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)
        // console.log('resData', resData)
        // Add cmsSource to the data so normalizeArticlePage knows which normalizer to use
        resData.cmsSource = cmsSources.WAGTAIL

        // Transform curated content if it exists
        if (resData.body && Array.isArray(resData.body)) {
            const transformedCuratedContent = await transformCuratedContent(resData.body)
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
const getPageData = async (pageSlug: string, cmsSource: string) => {
    switch (cmsSource) {
        case cmsSources.WAGTAIL:
            return await getWagtailPageData(pageSlug)
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
    if (pageSlug && cmsSource) {
        const PageData = await getPageData(pageSlug, cmsSource)

        return PageData
    } else {
        return null
    }
})
