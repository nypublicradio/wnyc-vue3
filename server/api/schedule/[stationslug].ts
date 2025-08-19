const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'

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
// const removeFutureShows = (schedule: any) => {
//     const now = new Date();
//     const filteredSchedule = schedule.filter((show: any) => {
//         const start = new Date(show.attributes.start);
//         const diff = start.getTime() - now.getTime();
//         const diffHours = diff / (1000 * 3600);
//         return diffHours < 24;
//     });
//     return filteredSchedule;
// };

//Get schedule for a specific date
const getSchedule = async (slug: string, schedDate: string, isToday = true, signal?: AbortSignal) => {
    const options = {
        method: 'GET',
        url: `${config.public.PUBLISHER_BASE_API}v3/schedule/`,
        params: {
            scheduleStation: slug,
            scheduleDate: schedDate
        },
        signal  // Pass the abort signal to axios
    };
    const res = await axios(options);
    const resData = humps.camelizeKeys(res.data).data;
    const filteredSchedule = removePastShows(resData);
    return isToday ? filteredSchedule : resData;
};

export default defineEventHandler(async (event) => {
    //const query = getQuery(event);
    const slug = event?.context?.params?.stationslug as string;
    const body = await readBody(event);
    const localDate = body?.localDate;
    const isToday = body?.isToday;

    // Create an abort controller that aborts if the request is closed
    const abortController = new AbortController();

    // Listen for request close to abort the axios request
    event.node.req.on('close', () => {
        abortController.abort();
    });

    if (slug) {
        //Get schedule for today and tomorrow
        let date;
        if (localDate) {
            date = new Date(localDate);
        } else {
            date = new Date();
        }

        const offset = date.getTimezoneOffset() * 60 * 1000;
        const today = new Date(date.getTime() - offset);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const scheduleToday = await getSchedule(slug, today.toISOString().split('T')[0], isToday, abortController.signal);
        //const scheduleTomorrow = await getSchedule(slug, tomorrow.toISOString().split('T')[0], isToday, abortController.signal);
        //const filteredScheduleTomorrow = removeFutureShows(scheduleTomorrow);

        //Combine today and tomorrow's schedule and return
        //const concatSchedule = scheduleToday.concat(filteredScheduleTomorrow);

        return scheduleToday;
    }
    return null;
});