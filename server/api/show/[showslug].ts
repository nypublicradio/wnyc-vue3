import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
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
        const resData = res.data.data
        for (let i = 0; i < resData.length; i++) {

            // this checks if the audio url is a 404 and removes it by assigning an emptry string to the audio file key, but it slows down the page load
            // if (await checkUrl404(resData[i].attributes.audio)) {
            //     console.log('resData[i].attributes.audio = ', resData[i].attributes.audio)
            //     resData[i].attributes.audio = ''
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
        console.error('getEpisodes error = ', e);
    }
    return null
}

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
        return show;
    } catch (e) {
        console.error('getShow error = ', e);
    }
    return null
}

export default defineEventHandler(async (event) => {
    let res = event?.node?.res;
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
            show: show,
            episodes: episodes
        }
    } else {
        return null;
    }
})
