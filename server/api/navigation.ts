import axios from 'axios'

const config = useRuntimeConfig();

// BFF for fetching the data only for the navigation
async function useNavigationData() {
    try {
        // Fetch all data concurrently
        const [wagtail, donate, stations, shows] = await Promise.all([
            axios.get(config.public.HEADER_NAVIGATION_API),
            axios.get(config.public.SYSTEM_MESSAGES_API),
            axios.get(`${config.public.BFF_URL}/api/streams`),
            axios.get(`${config.public.BFF_URL}/api/v2/showsmenu`),

        ]);
        return {
            wagtailResponse: wagtail.data,
            donateResponse: donate.data,
            stationsResponse: stations.data,
            showsResponse: shows.data,
        };
    } catch (fetchError) {
        console.error("Failed to fetch or process navigation data:", fetchError);
        return {
            wagtailResponse: null,
            donateResponse: null,
            stationsResponse: null,
            showsResponse: null,
        };
    }
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res;
    res.setHeader('Cache-Control', 'maxage=120, stale-while-revalidate');
    const data = await useNavigationData();

    return { data };
})
