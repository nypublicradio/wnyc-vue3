import axios from 'axios'
import humps from 'humps'
import { supabaseClient } from '~/server/utils/supabaseClient';
import { NyprDb } from '~/server/utils/nyprdb';
import { cmsSources, FALLBACKIMAGELOCAL } from '~/composables/globals';
import { he } from 'date-fns/locale';
import { co } from '~/android/app/src/main/assets/public/_nuxt/DPXMAggM';

const config = useRuntimeConfig();
const supabase = supabaseClient();
const nyprDb = new NyprDb(supabase);
/* const getImage = (item) => { 
   // console.log('item = ', item);
}; */

function findImageUrl(item) {
    let imageUrl = null;
    for (const asset of Object.values(item.resources[0].assets)) {
        if (asset.profiles[0]?.href === '/v1/profiles/image') {
            const imageEnclosure = asset.enclosures.find(enclosure => enclosure.rels.includes('image-standard'));
            if (imageEnclosure) {
                imageUrl = { href: imageEnclosure.href, template: imageEnclosure.hrefTemplate };
                break; // Exit the loop once the matching image URL is found

            }
        }
    }
    return imageUrl;
}

//Get all NPR shows 
const nprShows = async () => {
    try {
        const confShows = await nyprDb.getNPRShows();

        let shows = {
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
                const image = findImageUrl(data);
                return  {
                    id: show.showId,
                    title: show.title,
                    slug: show.slug,
                    description: show.description,
                    image: image,
                    cmsSource: cmsSources.NPR,
                    type: cmsSources.NPR,
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
    } catch (e) {
        console.error('error = ', e);
        return null
    }
}

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
    const nprShowsData = await nprShows();
    //Merge the data from all the sources allshowsData with the all shows data from the nprShowsData
    if (nprShowsData) {
        allShowsData.push(...nprShowsData.all);
        featuredShowsData.push(...nprShowsData.featuredShows);
    }
    //Sort the data by title
    allShowsData.sort((a, b) => a.title.localeCompare(b.title));
    featuredShowsData.sort((a, b) => a.title.localeCompare(b.title));
    featuredShowsData.map((show) => {
        //Get the id from the allShowsData
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