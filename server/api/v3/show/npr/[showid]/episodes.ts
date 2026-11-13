import { handleNprCdsItem } from '~/utilities/curatedContent'
import { NPR } from '~/server/utils/npr'
import { TtlCache } from '~/server/utils/simplecastCache'

const npr = new NPR()

// NPR CDS rejects any query where limit + offset > 2000
const CDS_MAX_DEPTH = 2000
const DEFAULT_LIMIT = 10
// Each document is normalized (layout, audio parsing), so keep pages small
const MAX_LIMIT = 20

// Cache pages for 5 minutes. TtlCache doesn't cache rejections, so failures retry right away.
const episodesCache = new TtlCache<any>(5 * 60 * 1000)

// Returns the fallback when absent, null when present but not an integer >= min.
const parseIntParam = (value: unknown, fallback: number, min: number) => {
    if (value === undefined) return fallback
    const n = Number(Array.isArray(value) ? value[0] : value)
    return Number.isInteger(n) && n >= min ? n : null
}

const emptyPage = (offset: number, limit: number) => ({
    data: [],
    meta: {
        hasMore: false,
        pagination: { offset, limit, count: 0, nextOffset: null }
    }
})

const fetchNprEpisodes = async (showId: string, offset: number, limit: number) => {
    const res: any = await npr.getFromNPR('documents', {
        params: {
            // The audio stories Wagtail lists for the show. Without the filter the daily
            // "program-episode" documents, which have no audio, are mixed in.
            profileIds: 'story,has-audio',
            collectionIds: showId,
            sort: 'publishDateTime:desc',
            limit,
            offset
        }
    })
    // getFromNPR swallows axios errors and returns undefined
    if (!res?.data?.resources) {
        throw createError({ statusCode: 502, statusMessage: 'Failed to fetch NPR episodes' })
    }

    const resources: any[] = res.data.resources
    // handleNprCdsItem drops restricted documents (null), same as the Wagtail lists
    const episodes = (await Promise.all(
        resources.map(doc => handleNprCdsItem({ content: doc }, 'default'))
    )).filter(Boolean)
    const nextOffset = offset + limit
    // CDS gives no total count, so a full page means there may be more
    const hasMore = resources.length === limit && nextOffset < CDS_MAX_DEPTH

    return {
        data: episodes,
        meta: {
            hasMore,
            pagination: {
                offset,
                limit,
                count: episodes.length,
                nextOffset: hasMore ? nextOffset : null
            }
        }
    }
}

/**
 * Paged NPR episodes for a show, keyed by the show's NPR collection id
 * (the page gets it from `meta.nprShowId` on the episodes Wagtail already sends).
 *
 * GET /api/v3/show/npr/{showId}/episodes?offset=10&limit=10
 * - offset: default 0
 * - limit: default 10, max 20; trimmed so offset + limit <= 2000 (NPR CDS cap)
 */
export default defineEventHandler(async (event) => {
    const showId: string | undefined = event?.context?.params?.showid
    const query = getQuery(event)
    const offset = parseIntParam(query.offset, 0, 0)
    const requestedLimit = parseIntParam(query.limit, DEFAULT_LIMIT, 1)

    if (!showId || !/^\d+$/.test(showId)) {
        throw createError({ statusCode: 400, statusMessage: 'Show id must be a numeric NPR collection id' })
    }
    if (offset === null || requestedLimit === null) {
        throw createError({ statusCode: 400, statusMessage: 'offset must be an integer >= 0 and limit an integer >= 1' })
    }

    const limit = Math.min(requestedLimit, MAX_LIMIT, CDS_MAX_DEPTH - offset)
    if (limit <= 0) return emptyPage(offset, 0)

    const result = await episodesCache.getOrFetch(
        `${showId}-${offset}-${limit}`,
        () => fetchNprEpisodes(showId, offset, limit)
    )
    event?.node?.res?.setHeader('Cache-Control', 'max-age=300, stale-while-revalidate=600')
    return result
})
