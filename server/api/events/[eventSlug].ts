import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig();
const BASE =
  process.env.DEMO_AVIARY_BASE_API ||
  process.env.AVIARY_BASE_API ||
  (config as any).aviaryBaseApi ||
  (config as any).public?.AVIARY_BASE_API

const getWagtailEventData = async (eventSlug: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${BASE}pages/${eventSlug}/`,
        };
        
        const res = await axios(option);
        return humps.camelizeKeys(res.data);
    } catch (e) {
        // Silently handle errors
    }
    return null
};

export default defineEventHandler(async (event) => {
    const eventSlug: string | undefined = event?.context?.params?.eventSlug;
    
    if (eventSlug) {
        const eventData = await getWagtailEventData(eventSlug);
        
        // Set cache headers - longer cache for past events
        const res = event?.node?.res;
        if (eventData && eventData.startDatetime) {
            const eventDate = new Date(eventData.startDatetime);
            const now = new Date();
            const cacheTime = eventDate < now ? 3600 : 1800; // 1 hour for past events, 30 min for future
            res.setHeader('Cache-Control', `maxage=${cacheTime}, stale-while-revalidate`);
        } else {
            res.setHeader('Cache-Control', 'maxage=1800, stale-while-revalidate');
        }
        
        return eventData;
    }
    
    return null
});
