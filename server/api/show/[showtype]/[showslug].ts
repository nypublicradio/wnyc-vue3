import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig()

const getEpisodes = async (slug: string, type: string, page?: string) => {
    try {
        // If page is not defined, set it to 1
        if (!page) {
            page = '1';
        }
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v3/story/?${type}=${slug}&page=${page}`
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

export default defineEventHandler(async (event) => {
    //Fetching slug and type from the path params
    const slug: string | undefined = event?.context?.params?.showslug;
    const type: string | undefined = event?.context?.params?.showtype;
    //Fetching query params
    const query = getQuery(event);
    const page: string | undefined = Array.isArray(query.page) ? query.page[0] : query.page;
    if (slug && type) {
        return getEpisodes(slug, type, page);
    }
    return null;
});