import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig()

const getEpisode = async (slug: string, type: string) => {
    console.log('wtf')
    try {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v3/story/?${type}=${slug}`
        };
        const res = await axios(option);
        //Passing meta and data separately to the client. Meta is to used for pagination
        return {
            data: humps.camelizeKeys(res.data).data,
            meta: humps.camelizeKeys(res.data).meta
        };
    } catch (e) {
        //console.log(e);
    }
}

const getShow = async (slug: string) => {
    console.log('wtf2')
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
    //Fetching slug and type from the path params
    const slug: string | undefined = event?.context?.params?.showslug;
    console.log('slug = ', slug)
    //Fetching query params
    const query = getQuery(event);
    if (slug) {
        // Get show details
        const show = await getShow(slug);
        const episode = await getEpisode(slug, show.type);

        return {
            episode: episode
        }
    }
    return null;
});