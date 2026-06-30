import axios from 'axios'
import humps from 'humps'
import { normalizeWagtailShowDetail } from '~/composables/data/shows'
import { FALLBACKIMAGE } from '~/composables/globals'
import { getCmsPathRedirect, getCmsRequestOptions, normalizeCmsLocation } from '~/server/utils/cmsRedirect'
import { transformCuratedContent } from '~/utilities/curatedContent'

const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

export const seriesNotFound = (message: string) => createError({ statusCode: 404, statusMessage: message })
export const seriesUpstreamError = (message: string) => createError({ statusCode: 502, statusMessage: message })

const isSuccessfulStatus = (status?: number) => !status || (status >= 200 && status < 300)
const isRedirectStatus = (status?: number) => Boolean(status && status >= 300 && status < 400)

export const getWagtailShow = async (showSlug: string) => {
    const config = __getConfig()
    const requestOptions = getCmsRequestOptions(config.public.cmsSite)
    const res = await axios({
        method: 'GET',
        url: `${config.public.AVIARY_BASE_API}pages/`,
        params: {
            type: 'shows.ShowPage',
            slug: showSlug,
            fields: 'description,topper_display_title,linked_data_source,show_art,show_logo,topper_background,body,about_module,can_download_episodes,can_embed_episodes,in_page_navigation',
        },
        ...requestOptions,
    })

    if (!isSuccessfulStatus(res.status)) {
        if (res.status === 404) {
            throw seriesNotFound(`Show not found: ${showSlug}`)
        }
        throw seriesUpstreamError(`CMS show request failed: ${showSlug}`)
    }

    const resData = humps.camelizeKeys(res.data)
    const showData = resData.items?.[0]
    if (!showData) {
        throw seriesNotFound(`Show not found: ${showSlug}`)
    }

    return {
        normalized: normalizeWagtailShowDetail(showData, showSlug),
        raw: showData,
    }
}

export const getWagtailSeries = async (showSlug: string, seriesSlug: string) => {
    const config = __getConfig()
    const baseApi = config.public.AVIARY_BASE_API
    const htmlPath = `/browse/shows/${showSlug}/${seriesSlug}/`
    const requestOptions = getCmsRequestOptions(config.public.cmsSite)

    try {
        const res = await axios({
            method: 'GET',
            url: `${baseApi}pages/find/`,
            params: {
                html_path: htmlPath,
            },
            ...requestOptions,
        })

        if (isRedirectStatus(res.status)) {
            const location = res.headers?.location
            if (!location) {
                throw seriesUpstreamError('CMS redirect missing location header')
            }

            const nextUrl = normalizeCmsLocation(location, baseApi)
            const pageRes = await axios({
                method: 'GET',
                url: nextUrl,
                ...requestOptions,
            })

            if (!isSuccessfulStatus(pageRes.status)) {
                if (pageRes.status === 404) {
                    throw seriesNotFound(`Series not found: ${showSlug}/${seriesSlug}`)
                }
                throw seriesUpstreamError(`CMS series page fetch failed: ${showSlug}/${seriesSlug}`)
            }

            const redirectedSeriesData = humps.camelizeKeys(pageRes.data)
            if (redirectedSeriesData?.meta?.type && redirectedSeriesData.meta.type !== 'shows.SeriesPage') {
                throw seriesNotFound(`Series not found: ${showSlug}/${seriesSlug}`)
            }

            return redirectedSeriesData
        }

        if (res.status === 404) {
            const redirect = await getCmsPathRedirect(baseApi, htmlPath, requestOptions)
            if (redirect) {
                return redirect
            }
            throw seriesNotFound(`Series not found: ${showSlug}/${seriesSlug}`)
        }

        if (!isSuccessfulStatus(res.status)) {
            throw seriesUpstreamError(`CMS series request failed: ${showSlug}/${seriesSlug}`)
        }

        const seriesData = humps.camelizeKeys(res.data)
        if (seriesData?.meta?.type && seriesData.meta.type !== 'shows.SeriesPage') {
            throw seriesNotFound(`Series not found: ${showSlug}/${seriesSlug}`)
        }

        return seriesData
    } catch (error: any) {
        if (error?.statusCode === 404 || error?.response?.status === 404) {
            const redirect = await getCmsPathRedirect(baseApi, htmlPath, requestOptions)
            if (redirect) {
                return redirect
            }
            throw seriesNotFound(`Series not found: ${showSlug}/${seriesSlug}`)
        }

        if (error?.statusCode) {
            throw error
        }

        console.error('[Wagtail Series] Error fetching series:', error?.response?.data || error?.message || error)
        throw seriesUpstreamError(`CMS series request failed: ${showSlug}/${seriesSlug}`)
    }
}

export const getWagtailSeriesPreview = async (identifier: string, token: string, showSlug: string, seriesSlug: string) => {
    const config = __getConfig()
    const requestOptions = getCmsRequestOptions(config.public.cmsSite)

    try {
        const res = await axios({
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}page_preview/`,
            params: {
                identifier,
                token,
            },
            ...requestOptions,
        })

        if (!isSuccessfulStatus(res.status)) {
            if (res.status === 404) {
                throw seriesNotFound(`Series preview not found: ${showSlug}/${seriesSlug}`)
            }
            throw seriesUpstreamError(`CMS series preview request failed: ${showSlug}/${seriesSlug}`)
        }

        const seriesData = humps.camelizeKeys(res.data)
        if (seriesData?.meta?.type !== 'shows.SeriesPage') {
            throw seriesNotFound(`Series preview not found: ${showSlug}/${seriesSlug}`)
        }

        return seriesData
    } catch (error: any) {
        if (error?.statusCode) {
            throw error
        }

        console.error('[Wagtail Series Preview] Error fetching series preview:', error?.response?.data || error?.message || error)
        throw seriesUpstreamError(`CMS series preview request failed: ${showSlug}/${seriesSlug}`)
    }
}

export const normalizeSeriesMetadata = (seriesData: any, show: any, showSlug: string, seriesSlug: string) => {
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

export const buildSeriesResponse = async (showSlug: string, seriesSlug: string, seriesData: any) => {
    const showResult = await getWagtailShow(showSlug)
    const body = await transformCuratedContent(seriesData.body || [], 'default', showSlug, showResult.raw)

    return {
        series: normalizeSeriesMetadata(seriesData, showResult.normalized, showSlug, seriesSlug),
        show: showResult.normalized,
        body,
    }
}
