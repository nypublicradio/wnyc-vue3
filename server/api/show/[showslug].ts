import axios from 'axios'
import humps from 'humps'
import { cmsSources, mediaTypes } from '~/composables/globals'
import { normalizeArticlePage } from '~/composables/data/articlePages'
//import { checkUrl404 } from '~/utilities/helpers'

const config = useRuntimeConfig()

const getEpisodes = async (slug: string, showImage: string, type?: string, pageSize?: string, page?: number) => {
    try {
        // If page is not defined, set it to 1
        if (!page) {
            page = 1;
        }
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v3/story/`,
            params: {
                [type]: slug,
                // channel: slug,
                ordering: '-newsdate',
                page,
                page_size: Number(pageSize),
                audio_only: true,
            }
        };
        const res = await axios(option);
        const resData = await Promise.all(res.data.data.map(async (item: any) => {
            item.cmsSource = cmsSources.PUBLISHER;
            item.showImage = showImage;
            return await normalizeArticlePage(humps.camelizeKeys(item))
        }));
        //Passing meta and data separately to the client. Meta is to used for pagination
        return {
            data: resData,
            meta: humps.camelizeKeys(res.data).meta
        };
    } catch (e) {
        console.error('getEpisodes error = ', e);
    }
    return null
}

// gets the publisher show data
const getShow = async (slug: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v1/list/shows-for-app/`,
        };
        const res = await axios(option);
        const resData = humps.camelizeKeys(res.data).results;
        // Find the show from the list of shows
        const show = resData.find((s) => {
            return s.slug === slug
        });
        show.image.template = show.image.url.replace('raw', '%s/%s/%s/%s');
        show.cmsSource = cmsSources.PUBLISHER
        show.type = mediaTypes.SHOW
        show.url = show.url ?? `${config.public.WNYC_SHOW_SHARE_BASE_URL}${show.slug}`
        return show;
    } catch (e) {
        console.error('getShow error = ', e);
    }
    return null
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res;
    //Fetching slug and type from the path params
    const slug: string | undefined = event?.context?.params?.showslug;

    //Fetching query params
    const query = getQuery(event);
    const page: number | undefined = Array.isArray(query.page) ? query.page[0] : query.page;
    const pageSize: string | undefined = query.pageSize?.toString() ?? '10';
    if (slug) {
        // Get show details
        const show = await getShow(slug);
        const episodes = await getEpisodes(slug, show?.image?.template, show?.type, pageSize, page);
        res.setHeader('Cache-Control', 'maxage=3600, stale-while-revalidate');
        //console.log('page = ', page)
        return {
            show,
            episodes,
        }
    } else {
        return null;
    }
})
