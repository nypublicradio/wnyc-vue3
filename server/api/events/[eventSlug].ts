import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig();
const BASE =
  process.env.DEMO_AVIARY_BASE_API ||
  process.env.AVIARY_BASE_API ||
  (config as any).aviaryBaseApi ||
  (config as any).public?.AVIARY_BASE_API

// Diagnostic logging for demo environment debugging
if (process.env.ENV === 'demo' || process.env.environment === 'demo') {
  console.log('[Events Detail API] Demo environment detected');
  console.log('[Events Detail API] ENV:', process.env.ENV);
  console.log('[Events Detail API] environment:', process.env.environment);
  console.log('[Events Detail API] DEMO_AVIARY_BASE_API:', process.env.DEMO_AVIARY_BASE_API);
  console.log('[Events Detail API] AVIARY_BASE_API:', process.env.AVIARY_BASE_API);
  console.log('[Events Detail API] Resolved BASE:', BASE);
}

const getWagtailEventData = async (eventSlug: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${BASE}pages/${eventSlug}/`,
        };
        
        // Log the actual API call being made
        if (process.env.ENV === 'demo' || process.env.environment === 'demo') {
            console.log('[Events Detail API] Making request to:', option.url);
        }
        
        const res = await axios(option);
        return humps.camelizeKeys(res.data);
    } catch (e) {
        if (e.response && e.response.status === 404) {
            console.error('Event not found:', eventSlug)
        } else {
            console.error('Error fetching event:', e);
        }
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
