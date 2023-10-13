const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'

const getSchedule = async (slug: String) => {
    const options = {
        method: 'GET',
        url: config.public.PUBLISHER_BASE_API + 'schedule/',
        params: {
            scheduleStation: slug,
        }
    };    
    const res = await axios(options);
    return humps.camelizeKeys(res.data).data;
};

export default defineEventHandler(async (event) => {
	const slug: String | undefined = event?.context?.params?.stationslug;
	if (slug) {
		return getSchedule(slug);
	}
	return null;
});