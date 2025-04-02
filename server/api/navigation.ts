import axios from 'axios'

const config = useRuntimeConfig();

async function useNavigationData() {
    let wagtailResponse = null;
    let donateResponse = null;
    let stationsResponse = null;
    let showsResponse = null;

    try {
        // Fetch all data concurrently
        const [wagtailResponseGet, donateResponseGet, stationsResponseGet, showsResponseGet] = await Promise.all([
            axios.get(config.public.HEADER_NAVIGATION_API),
            axios.get(config.public.SYSTEM_MESSAGES_API),
            axios.get(`${config.public.BFF_URL}/api/streams`),
            axios.get(`${config.public.BFF_URL}/api/v2/shows`),
        ]);

        wagtailResponse = wagtailResponseGet.data;
        donateResponse = donateResponseGet.data;
        stationsResponse = stationsResponseGet.data;
        showsResponse = showsResponseGet.data;

    } catch (fetchError) {
        console.error("Failed to fetch or process navigation data:", fetchError);
    }

    return {
        wagtailResponse,
        donateResponse,
        stationsResponse,
        showsResponse,
    };
}

export default defineEventHandler(async (event) => {
    //console.log('getting home page TOP STORIES data')
    const res = event?.node?.res;
    res.setHeader('Cache-Control', 'maxage=120, stale-while-revalidate');
    const data = await useNavigationData();

    return {
        data,
    }
})
