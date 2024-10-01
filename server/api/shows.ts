import axios from 'axios'
import humps from 'humps'
import { cmsSources, FALLBACKIMAGELOCAL } from '~/composables/globals';
import { customAlphabeticalSort } from '~/utilities/helpers';

const config = useRuntimeConfig()

//Fetch all shows for the app
const allShows = async () => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v1/list/shows-for-app/`,
        };
        const res = await axios(option);
        res.data.results.forEach((show) => {
            show.cmsSource = cmsSources.PUBLISHER;
            show.image.template = show.image.url ? show.image.url.replace('raw', '%s/%s/%s/%s') : FALLBACKIMAGELOCAL
        });
        return humps.camelizeKeys(res.data).results;
    } catch (e) {
        console.error('error = ', e);
        return null
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

        const resData = res.data.map((show) => {
            show.cmsSource = cmsSources.PUBLISHER;
            const humped = humps.camelizeKeys(show);
            return humped;
        });
        return resData;
    } catch (e) {
        console.error('error = ', e);
        return null
    }
}


export default defineEventHandler(async (event) => {
    let res = event?.node?.res;
    const allShowsData = await allShows();
    const featuredShowsData = await featuredShows();

    // Sort allShowsData
    allShowsData.sort(customAlphabeticalSort());

    // Sort featuredShowsData
    featuredShowsData.sort(customAlphabeticalSort());

    // Match IDs and update featuredShowsData
    featuredShowsData.forEach((show) => {
        const match = allShowsData.find((item) => item.slug === show.slug);
        if (match) {
            show.id = match.id;
        }
    });

    res.setHeader('Cache-Control', 'maxage=3600, stale-while-revalidate');
    return {
        all: allShowsData,
        featuredShows: featuredShowsData
    }
});