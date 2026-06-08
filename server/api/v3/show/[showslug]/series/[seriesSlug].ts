import axios from 'axios'
import humps from 'humps'
import { normalizeWagtailShowDetail } from '~/composables/data/shows'
import { FALLBACKIMAGE } from '~/composables/globals'
import { transformCuratedContent } from '~/utilities/curatedContent'

const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

const notFound = (message: string) => createError({ statusCode: 404, statusMessage: message })

const getWagtailShow = async (showSlug: string) => {
    const config = __getConfig()
    const res = await axios({
        method: 'GET',
        url: `${config.public.AVIARY_BASE_API}pages/`,
        params: {
            type: 'shows.ShowPage',
            slug: showSlug,
            fields: 'description,topper_display_title,linked_data_source,show_art,show_logo,topper_background,body,about_module,can_download_episodes,can_embed_episodes,in_page_navigation',
        },
        headers: {
            'X-CMS-Site': config.public.cmsSite,
        },
    })

    const resData = humps.camelizeKeys(res.data)
    const showData = resData.items?.[0]
    if (!showData) {
        throw notFound(`Show not found: ${showSlug}`)
    }

    return {
        normalized: normalizeWagtailShowDetail(showData, showSlug),
        raw: showData,
    }
}

const getWagtailSeries = async (showSlug: string, seriesSlug: string) => {
    const config = __getConfig()

    try {
        const res = await axios({
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/find/`,
            params: {
                html_path: `/browse/shows/${showSlug}/${seriesSlug}/`,
            },
            headers: {
                'X-CMS-Site': config.public.cmsSite,
            },
        })

        const seriesData = humps.camelizeKeys(res.data)
        if (seriesData?.meta?.type && seriesData.meta.type !== 'shows.SeriesPage') {
            throw notFound(`Series not found: ${showSlug}/${seriesSlug}`)
        }

        return seriesData
    } catch (error: any) {
        if (error?.statusCode === 404 || error?.response?.status === 404) {
            throw notFound(`Series not found: ${showSlug}/${seriesSlug}`)
        }

        console.error('[Wagtail Series] Error fetching series:', error?.response?.data || error?.message || error)
        throw error
    }
}

const normalizeSeriesMetadata = (seriesData: any, show: any, showSlug: string, seriesSlug: string) => {
    const title = seriesData.title || seriesData.meta?.title || ''
    const showTitle = show?.title || ''
    const defaultDescription = `See articles and episodes related to ${title} from ${showTitle}.`
    const pageTitle = seriesData.meta?.seoTitle || seriesData.seoTitle || title
    const description = seriesData.meta?.searchDescription ||
        seriesData.searchDescription ||
        seriesData.listingSummary ||
        defaultDescription
    const socialDescription = seriesData.socialText || description
    const thumbnail = seriesData.socialImage?.file ||
        seriesData.socialImage?.url ||
        seriesData.listingImage?.file ||
        seriesData.listingImage?.url ||
        FALLBACKIMAGE

    return {
        id: seriesData.id,
        title,
        slug: seriesData.meta?.slug || seriesSlug,
        showSlug,
        type: 'series',
        url: seriesData.meta?.htmlUrl || seriesData.url || `/browse/shows/${showSlug}/${seriesSlug}`,
        meta: seriesData.meta,
        seoTitle: pageTitle,
        searchDescription: description,
        socialTitle: seriesData.socialTitle || pageTitle,
        socialDescription,
        socialText: seriesData.socialText,
        socialImage: seriesData.socialImage,
        listingImage: seriesData.listingImage,
        thumbnail,
        preventSearchIndexing: Boolean(seriesData.preventSearchIndexing),
    }
}

export default defineEventHandler(async (event) => {
    const showSlug: string | undefined = event?.context?.params?.showslug
    const seriesSlug: string | undefined = event?.context?.params?.seriesSlug

    if (!showSlug || !seriesSlug) {
        throw notFound('Series not found')
    }

    const [showResult, seriesData] = await Promise.all([
        getWagtailShow(showSlug),
        getWagtailSeries(showSlug, seriesSlug),
    ])

    const body = await transformCuratedContent(seriesData.body || [], 'default', showSlug, showResult.raw)
    event?.node?.res?.setHeader?.('Cache-Control', 'max-age=3600, stale-while-revalidate')

    return {
        series: normalizeSeriesMetadata(seriesData, showResult.normalized, showSlug, seriesSlug),
        show: showResult.normalized,
        body,
    }
})
