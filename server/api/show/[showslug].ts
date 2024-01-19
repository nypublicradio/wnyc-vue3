import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { normalizeArticlePage } from '~/composables/data/articlePages'

const config = useRuntimeConfig()

const getEpisodes = async (slug: string, showImage: string, type?: string, page?: string) => {
    try {
        // If page is not defined, set it to 1
        if (!page) {
            page = '1';
        }
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v3/story/`,
            params: {
                [type]: slug,
                ordering: '-newsdate',
                page,
            }
        };
        const res = await axios(option);
        const resData = res.data.data
        for (let i = 0; i < resData.length; i++) {
            // if (!resData[i].attributes['estimated-duration']) {
            //     const url: string = resData[i].attributes.audio
            //     resData[i].attributes['estimated-duration'] = await fetchDuration(url)
            // }

            resData[i].cmsSource = cmsSources.PUBLISHER
            resData[i].showImage = showImage
            resData[i] = normalizeArticlePage(humps.camelizeKeys(resData[i]))
        }
        //console.log(resData[0])
        //Passing meta and data separately to the client. Meta is to used for pagination
        return {
            data: resData,
            meta: humps.camelizeKeys(res.data).meta
        };
    } catch (e) {
        console.log('getEpisodes error = ', e);
    }
    return null
}

const getShow = async (slug: string) => {
    console.log('get Show')
    try {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v1/list/shows-for-app/`,
        };
        const res = await axios(option);
        const resData = humps.camelizeKeys(res.data).results;
        // Find the show from the list of shows
        const show = resData.find((s: any) => {
            return s.slug === slug
        });
        show.image.template = show.image.url.replace('raw', '%s/%s/%s/%s');
        return show;
    } catch (e) {
        console.log('getShow error = ', e);
    }
    return null
}

export default defineEventHandler(async (event) => {
    let res = event?.node?.res;
    //Fetching slug and type from the path params
    const slug: string | undefined = event?.context?.params?.showslug;

    //Fetching query params
    const query = getQuery(event);
    const page: string | undefined = Array.isArray(query.page) ? query.page[0] : query.page;
    if (slug) {
        // Get show details
        const show = await getShow(slug);
        const episodes = await getEpisodes(slug, show?.image?.template, show?.type, page);
        res.setHeader('Cache-Control', 'maxage=3600, stale-while-revalidate');
        return {
            show: show,
            episodes: episodes
        }
    } else {
        return null;
    }
})
