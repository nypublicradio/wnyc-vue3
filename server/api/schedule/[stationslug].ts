const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'

const getSchedule = async (slug: string, schedDate: string) => {
    const options = {
        method: 'GET',
        url: config.public.PUBLISHER_BASE_API + 'v3/schedule/',
        params: {
            scheduleStation: slug,
            scheduleDate: schedDate
        }
    };
    const res = await axios(options);
    const resData = humps.camelizeKeys(res.data).data;
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

//Write a function that removes schedules > 36 hours from now
const removeFutureShows = (schedule: any) => {
    const now = new Date();
    const filteredSchedule = schedule.filter((show: any) => {
        const start = new Date(show.attributes.start);
        const diff = start.getTime() - now.getTime();
        const diffHours = diff / (1000 * 3600);
        return diffHours < 24;
    });
    return filteredSchedule;
};

export default defineEventHandler(async (event) => {
    //const query = getQuery(event);
    const slug = event?.context?.params?.stationslug as string;
    if (slug) {
        //Get schedule for today and tomorrow
        //const date = new Date(query.localDate);
        const date = new Date();
        const offset = date.getTimezoneOffset() * 60 * 1000;
        const today = new Date(date.getTime() - offset);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const scheduleToday = await getSchedule(slug, today.toISOString().split('T')[0]);
        const scheduleTomorrow = await getSchedule(slug, tomorrow.toISOString().split('T')[0]);
        const filteredScheduleTomorrow = removeFutureShows(scheduleTomorrow);

        //Combine today and tomorrow's schedule and return
        const concatSchedule = scheduleToday.concat(filteredScheduleTomorrow);

        return concatSchedule;
    }
    return null;
});