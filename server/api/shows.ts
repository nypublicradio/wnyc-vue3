import axios from 'axios'
import humps from 'humps'
import { cmsSources, FALLBACKIMAGE } from '~/composables/globals'
import { getLegacyDiscoverShows } from '~/server/api/v2/discover/shows'
import { customAlphabeticalSort } from '~/utilities/helpers'

const config = useRuntimeConfig()

//Fetch all shows for the app
const allShows = async () => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v1/list/shows-for-app/`,
        }
        const res = await axios(option)
        res.data.results.forEach((show) => {
            show.cmsSource = cmsSources.PUBLISHER
            show.image.template = show.image.url ? show.image.url.replace('raw', '%s/%s/%s/%s') : FALLBACKIMAGE
        })
        return humps.camelizeKeys(res.data).results
    } catch (e) {
        console.error('error = ', e)
        return null
    }
}

//Fetch featured shows for the app
const featuredShows = async () => {
    try {
        const data = await getLegacyDiscoverShows({
            discover_station: 'wnyc-vue3-app-featured',
            api_key: 'spotlight',
        })

        const resData = data.map((show) => {
            show.cmsSource = cmsSources.PUBLISHER
            const humped = humps.camelizeKeys(show)
            return humped
        })
        return resData
    } catch (e) {
        console.error('error = ', e)
        return null
    }
}


export default defineEventHandler(async (event) => {
    const res = event?.node?.res
    const allShowsData = await allShows()
    const featuredShowsData = await featuredShows()

    // Sort allShowsData
    allShowsData.sort(customAlphabeticalSort())

    // Sort featuredShowsData
    featuredShowsData.sort(customAlphabeticalSort())

    // Match IDs and update featuredShowsData
    featuredShowsData.forEach((show) => {
        const match = allShowsData.find((item) => item.slug === show.slug)
        if (match) {
            show.id = match.id
        }
    })

    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')
    return {
        all: allShowsData,
        featuredShows: featuredShowsData
    }
})
