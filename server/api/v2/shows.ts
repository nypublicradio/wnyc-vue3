import axios from 'axios'
import humps from 'humps'
import { supabaseClient } from '~/server/utils/supabaseClient';
import { NyprDb } from '~/server/utils/nyprdb';
import { cmsSources, FALLBACKIMAGELOCAL } from '~/composables/globals';
import { NPR } from '~/server/utils/npr';
import { customAlphabeticalSort } from '~/utilities/helpers';


const config = useRuntimeConfig();
const supabase = supabaseClient();
const nyprDb = new NyprDb(supabase);
const npr = new NPR();

//Get all NPR shows 
const nprShows = async () => {

    const confShows = await nyprDb.getNPRShows();

    const shows = {
        all: [],
        featuredShows: []
    };
    if (confShows) {
        const fetchedShows = await Promise.all(confShows.map(async (show) => {
            const options = {
                method: 'GET',
                url: `${config.public.NPR_CDS_API}/v1/documents/${show.showId}`,
                headers: {
                    Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
                }
            };
            const { data } = await axios(options);
            const image = npr.findImageUrl(data);
            return {
                id: show.showId,
                title: show.title,
                slug: show.slug,
                //description: data.resources[0]?.teaser,
                //tease: data.resources[0]?.shortTeaser,
                image,
                cmsSource: cmsSources.NPR,
                type: cmsSources.NPR,
                url: data.resources[0]?.webPages[0]?.href,
                featured: show.featured
            }
        }));
        fetchedShows.forEach((show) => {
            if (show.featured) {
                //Remove the featured key from the show object
                delete show.featured;
                shows.featuredShows.push(show);
            }
            delete show.featured;
            shows.all.push(show);
        });
    }
    return shows;
}

//Fetch all shows for the app
const allShows = async () => {

    const option = {
        method: 'GET',
        url: `${config.public.PUBLISHER_BASE_API}v1/list/shows-for-app/`,
    };
    const res = await axios(option);
    res.data.results.forEach((show) => {
        show.cmsSource = cmsSources.PUBLISHER;
        show.image.template = show.image.url ? show.image.url.replace('raw', '%s/%s/%s/%s') : FALLBACKIMAGELOCAL
        delete show.description;
        delete show.image.url;
    });

    return humps.camelizeKeys(res.data).results;
}

//Fetch featured shows for the app
const featuredShows = async () => {

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
}

const mergeShows = (sourceShows, nprShows) => {
    const showMap = new Map(sourceShows.map(show => [show.title, show]));
    nprShows.forEach(show => showMap.set(show.title, show)); // NPR shows override existing entries
    return Array.from(showMap.values());
};

export default defineEventHandler(async (event) => {
    const res = event?.node?.res;
    const allShowsData = await allShows();
    const featuredShowsData = await featuredShows();
    const nprShowsData = await nprShows();

    //Merge the data from all the sources allshowsData with the all shows data from the nprShowsData    
    const allShowsDataMerged = mergeShows(allShowsData, nprShowsData.all);
    const featuredShowsDataMerged = mergeShows(featuredShowsData, nprShowsData.featuredShows);

    //Sort the data by title
    allShowsDataMerged.sort(customAlphabeticalSort());
    featuredShowsDataMerged.sort(customAlphabeticalSort());
    featuredShowsDataMerged.forEach((show) => {
        // Get the id from the allShowsData
        const match = allShowsData.find((item) => item.slug === show.slug);
        if (match) {
            show.id = match.id;
        }
    });
    res.setHeader('Cache-Control', 'maxage=3600, stale-while-revalidate');
    return {
        all: allShowsDataMerged,
        featuredShows: featuredShowsDataMerged
    }
});
