import axios from 'axios'
import humps from 'humps'
import { cmsSources, mediaTypes } from '~/composables/globals'
import { normalizeArticlePage } from '~/composables/data/articlePages'
//import { checkUrl404 } from '~/utilities/helpers'

const config = useRuntimeConfig()

const getEpisodes = async (slug: string, showImage: string, type?: string, pageSize?: string, page?: number) => {
    try {
        const pageNumber = page || 1
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v3/story/`,
            params: {
                [type]: slug,
                // channel: slug,
                ordering: '-newsdate',
                page: pageNumber,
                page_size: Number(pageSize),
                audio_only: true,
            }
        }
        const res = await axios(option)
        const resData = await Promise.all(res.data.data.map(async (item: Record<string, unknown>) => {
            item.cmsSource = cmsSources.PUBLISHER
            item.showImage = showImage
            return await normalizeArticlePage(humps.camelizeKeys(item))
        }))
        //Passing meta and data separately to the client. Meta is to used for pagination
        return {
            data: resData,
            meta: humps.camelizeKeys(res.data.meta)
        }
    } catch (e) {
        console.error('getEpisodes error = ', e)
        return null
    }
}


export default defineCachedEventHandler(async (event) => {
    //Fetching slug and type from the path params
    const slug: string | undefined = event?.context?.params?.showslug

    //Fetching query params
    const query = getQuery(event)
    const page: number | undefined = Array.isArray(query.page) ? query.page[0] : query.page
    const pageSize: string | undefined = query.pageSize?.toString() ?? '10'
    if (slug) {
        // Get show details
        const show = await getShow(slug)
        const episodes = await getEpisodes(slug, show?.image?.template, show?.type, pageSize, page)
        return {
            show,
            episodes,
        }
    } else {
        return null
    }
}, {
    maxAge: 3600, // 1 hour
    swr: true,
    name: 'show-detail',
    // Create a unique key based on the show slug and the requested page number
    getKey: (event) => {
        const slug = event.context.params?.showslug
        const query = getQuery(event)
        const pageKey = query.page?.toString() ?? '1'
        return `show:${slug}:page:${pageKey}`
    }
})
