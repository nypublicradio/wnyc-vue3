import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig()

// getting radio shows data from the publisher api
// there are no "radio shows" in wagtail, so there is no need to support wagtail here
const getPublisherRadioShowsData = async (showSlug: string) => {
    const res = await axios(`${config.public.PUBLISHER_BASE_API}v3/channel/shows/${showSlug}/radio-shows`, { timeout: 10000 })
    const resData = humps.camelizeKeys(res.data)
    return resData
}

// get radio shows data from CMS
export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'max-age=60, stale-while-revalidate=120')
    const showSlug: string | undefined = event?.context?.params?.showSlug
    if (showSlug) {
        const radioShowsData = await getPublisherRadioShowsData(showSlug)
        return radioShowsData
    } else {
        return null
    }
})