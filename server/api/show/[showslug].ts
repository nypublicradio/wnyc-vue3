import axios from 'axios'
import humps from 'humps'
import { fetchDuration } from '~/utilities/helpers'

const config = useRuntimeConfig()

/* const fetchDuration = async (url: string) => {
    try{
        const options = {
            method: 'HEAD',
            url: url,
        };
        const mp3Res = await axios(options);
        const mp3Size = mp3Res.headers['content-length'];
        // Calculate the duration in seconds not converting size into bits. 
        // The bitrate is 128kps according to vlc and the file size is in bytes.
        //Multiplying the file size by 8 and dividing by 128000 gives the same 
        //duration as dividing by 16000 and not multiplying the file size by 8.
        const duration: number = Math.round(mp3Size / 16000) * 1000;
        return duration
    } catch (e) {
        //console.log(e);
    }
  } */

const getEpisodes = async (slug: string, type: string, page?: string) => {
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
        const cleanEpisodes = res.data.data.filter((episode: any) => {
            // removing episodes with no audio
            if (Array.isArray(episode.attributes.audio)) {
                return episode.attributes.audio[0] !== null
            } else {
                return episode.attributes.audio !== null
            }                       
        })
        for (let i = 0; i < cleanEpisodes.length; i++) {
            if (!cleanEpisodes[i].attributes.estimatedDuration) {
                const url: string = cleanEpisodes[i].attributes.audio
                cleanEpisodes[i].attributes.estimatedDuration = await fetchDuration(url)
            }
        }
        //Passing meta and data separately to the client. Meta is to used for pagination
        return {
            data: humps.camelizeKeys(cleanEpisodes),
            meta: humps.camelizeKeys(res.data).meta
        };
    } catch (e) {
        //console.log(e);
    }
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
        const show = resData.find((show: any) => show.slug === slug);
        show.image.template = show.image.url.replace('raw', '%s/%s/%s/%s');
        return show;
    } catch (e) {
        //console.log(e);
    }
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
        const episodes = await getEpisodes(slug, show.type, page);
        res.setHeader('Cache-Control', 'maxage=3600, stale-while-revalidate');
        return {
            show: show,
            episodes: episodes
        }
    }
    return null;
})
