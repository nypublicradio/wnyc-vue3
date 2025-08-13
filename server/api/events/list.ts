import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig();
const BASE =
  process.env.DEMO_AVIARY_BASE_API ||
  process.env.AVIARY_BASE_API ||
  (config as any).aviaryBaseApi ||
  (config as any).public?.AVIARY_BASE_API

const getWagtailEvents = async (query: Record<string, any>) => {
    try {
        const options = {
            method: 'GET',
            url: `${BASE}pages/`,
            params: {
                type: 'events.EventPage',
                fields: 'id,title,start_datetime,end_datetime,duration,event_image,description,ticket_url,price,event_location,venue_name,event_url,body,tags,listing_title,listing_summary',
                limit: query.limit || 20,
                offset: query.offset || 0,
            }
        };

        // Add date filtering if requested
        if (query.upcoming === 'true') {
            const now = new Date().toISOString().split('T')[0]; // Get date part only
            options.params['event_date__gte'] = now;
        } else if (query.past === 'true') {
            const now = new Date().toISOString().split('T')[0]; // Get date part only
            options.params['event_date__lt'] = now;
        }

        // Add venue filter if provided
        if (query.venue) {
            options.params['venue_name'] = query.venue;
        }

        
        const res = await axios(options);
        const data = humps.camelizeKeys(res.data);
        
        // Transform the response to include both data and meta
        return {
            events: data.items || [],
            meta: {
                totalCount: data.meta?.totalCount || 0,
                limit: query.limit || 20,
                offset: query.offset || 0,
            }
        };
    } catch (e) {
        // Silently handle errors
        return {
            events: [],
            meta: {
                totalCount: 0,
                limit: query.limit || 20,
                offset: query.offset || 0,
            }
        };
    }
};

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const res = event?.node?.res;
    
    // Set cache header - short cache for dynamic list
    res.setHeader('Cache-Control', 'maxage=300, stale-while-revalidate');
    
    const eventsData = await getWagtailEvents(query);
    return eventsData;
});
