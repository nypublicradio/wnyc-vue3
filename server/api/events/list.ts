import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig();

const getWagtailEvents = async (query: Record<string, any>) => {
    try {
        const options = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/`,
            params: {
                type: 'events.EventPage',
                fields: 'id,title,event_date,end_date,venue,description,image,url,tags,listing_title,listing_summary',
                order: 'event_date',
                limit: query.limit || 20,
                offset: query.offset || 0,
            }
        };

        // Add date filtering if requested
        if (query.upcoming === 'true') {
            const now = new Date().toISOString();
            options.params['event_date__gte'] = now;
        } else if (query.past === 'true') {
            const now = new Date().toISOString();
            options.params['event_date__lt'] = now;
            options.params.order = '-event_date'; // Reverse order for past events
        }

        // Add venue filter if provided
        if (query.venue) {
            options.params['venue'] = query.venue;
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
        console.error('Error fetching events:', e);
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