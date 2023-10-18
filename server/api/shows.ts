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
            url: `${config.public.PUBLISHER_BASE_API}v1/list/featured-shows/`,
        };
        const res = await axios(option);
        return humps.camelizeKeys(res.data).data;
    } catch (e) {
        //console.log(e);
    }
}


export default defineEventHandler(async (event) => {
    const allShowsData = await allShows();
    //TODO: Uncomment this once the API is ready
    //const featuredShowsData = await featuredShows();
    return {
            all: allShowsData
            //featuredShows: featuredShowsData
    }
});