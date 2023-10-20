import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig()

//Fetch all shows for the app
const allShows = async () => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v1/list/shows-for-app/`,
        };
        const res = await axios(option);
        res.data.results.map((show: any) => {
            show.image.template = show.image.url.replace('raw', '%s/%s/%s/%s')
        });
        return humps.camelizeKeys(res.data).results;
    } catch (e) {
        //console.log(e);
    }
}

//Fetch featured shows for the app
const featuredShows = async () => {
    try {
        const option = {
            method: 'GET',
            url: config.public.FEATURED_SHOWS,
            params: {
                discover_station: 'wnyc-vue3-app-featured',
                api_key: 'spotlight',
            }
        };
        const res = await axios(option);
        return humps.camelizeKeys(res.data);
    } catch (e) {
        //console.log(e);
    }
}


export default defineEventHandler(async (event) => {
    const allShowsData = await allShows();
    const featuredShowsData = await featuredShows();
    return {
        all: allShowsData,
        featuredShows: featuredShowsData
    }
});