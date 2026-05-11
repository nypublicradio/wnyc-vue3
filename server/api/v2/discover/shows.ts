import { getFeaturedShows, getShows } from '~/server/api/v3/shows'

type LegacyDiscoverQuery = Record<string, unknown>
type ShowList = Awaited<ReturnType<typeof getShows>>

const LEGACY_TOPIC_SLUGS: Record<string, string[]> = {
    culture: ['all-of-it', 'new-sounds', 'classical-music-happy-hour', 'soundcheck'],
    atc: ['wnyc-news', 'all-things-considered', 'morning-edition', 'nyc-now'],
    poli: ['brian-lehrer-show', 'brian-lehrer-a-daily-politics-podcast', 'ask-governor-sherrill'],
    otm: ['on-the-media'],
    story: ['radiolab', 'terrestrials', 'blindspot'],
    atom: ['science-friday'],
    csharp: ['new-sounds', 'soundcheck', 'classical-music-happy-hour'],
}

const getQueryValue = (query: LegacyDiscoverQuery, key: string) => {
    const value = query[key]
    if (Array.isArray(value)) return String(value[0] ?? '')
    return String(value ?? '')
}

const showsMatchingSlugs = (shows: ShowList, slugs: string[]) => {
    const desiredSlugs = new Set(slugs)
    return shows.filter((show) => desiredSlugs.has(show.slug))
}

export const selectLegacyDiscoverShows = (
    allShows: ShowList,
    featuredShows: ShowList,
    query: LegacyDiscoverQuery
) => {
    const apiKey = getQueryValue(query, 'api_key')
    const discoverStation = getQueryValue(query, 'discover_station')

    if (apiKey === 'spotlight' || discoverStation.includes('featured')) {
        return featuredShows.length ? featuredShows : allShows
    }

    if (discoverStation.includes('menulist')) {
        return allShows
    }

    const topicSlugs = LEGACY_TOPIC_SLUGS[apiKey]
    if (topicSlugs) {
        const topicShows = showsMatchingSlugs(allShows, topicSlugs)
        return topicShows.length ? topicShows : allShows
    }

    return featuredShows.length ? featuredShows : allShows
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res
    res?.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')

    const allShows = await getShows()
    const featuredShows = await getFeaturedShows(allShows)

    return selectLegacyDiscoverShows(allShows, featuredShows, getQuery(event))
})
