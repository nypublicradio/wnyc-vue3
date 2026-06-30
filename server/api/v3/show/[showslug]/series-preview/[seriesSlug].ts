import { buildSeriesResponse, getWagtailSeriesPreview, seriesNotFound } from '~/server/utils/showSeries'

const getQueryValue = (value: unknown) => Array.isArray(value) ? value[0] : value

export default defineEventHandler(async (event) => {
    const showSlug: string | undefined = event?.context?.params?.showslug
    const seriesSlug: string | undefined = event?.context?.params?.seriesSlug
    const query = getQuery(event)
    const identifier = getQueryValue(query.identifier)?.toString()
    const token = getQueryValue(query.token)?.toString()

    if (!showSlug || !seriesSlug || !identifier || !token) {
        throw seriesNotFound('Series preview not found')
    }

    const seriesData = await getWagtailSeriesPreview(identifier, token, showSlug, seriesSlug)
    event?.node?.res?.setHeader?.('Cache-Control', 'no-store')

    return await buildSeriesResponse(showSlug, seriesSlug, seriesData)
})
