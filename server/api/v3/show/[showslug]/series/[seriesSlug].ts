import { buildSeriesResponse, getWagtailSeries, seriesNotFound } from '~/server/utils/showSeries'

export default defineEventHandler(async (event) => {
    const showSlug: string | undefined = event?.context?.params?.showslug
    const seriesSlug: string | undefined = event?.context?.params?.seriesSlug

    if (!showSlug || !seriesSlug) {
        throw seriesNotFound('Series not found')
    }

    const seriesData = await getWagtailSeries(showSlug, seriesSlug)

    if (seriesData?.redirect) {
        return seriesData
    }

    event?.node?.res?.setHeader?.('Cache-Control', 'max-age=3600, stale-while-revalidate')
    return await buildSeriesResponse(showSlug, seriesSlug, seriesData)
})
