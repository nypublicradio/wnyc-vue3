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
    const resData =  humps.camelizeKeys(res.data).data;
    const filteredSchedule = removePastShows(resData);
    return filteredSchedule;
};

// Write a function that removes scheduled shows that have already aired using the attribute "end"
const removePastShows = (schedule: any) => {
    const now = new Date();
    const filteredSchedule = schedule.filter((show: any) => {
        const end = new Date(show.attributes.end);
        return end > now;
    });
    return filteredSchedule;
};

export default defineEventHandler(async (event) => {
	const slug: String | undefined = event?.context?.params?.stationslug;
	if (slug) {
		return getSchedule(slug);
	}
	return null;
});