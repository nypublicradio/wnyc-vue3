import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { customAlphabeticalSort } from '~/utilities/helpers'

const config = useRuntimeConfig()

//Fetch featured shows for the app
const featuredShowsInMenu = async () => {

    const option = {
        method: 'GET',
        url: config.public.FEATURED_SHOWS,
        params: {
            discover_station: 'wnyc-vue3-app-menulist',
            api_key: 'prixfixe',
        }
    }
    const res = await axios(option)

    const resData = res.data.map((show) => {
        show.cmsSource = cmsSources.PUBLISHER
        const humped = humps.camelizeKeys(show)
        return humped
    })
    return resData
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res
    const featuredShowsData = await featuredShowsInMenu()

    //Sort the data by title
    featuredShowsData.sort(customAlphabeticalSort())
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')
    return {
        featuredShowsInMenu: featuredShowsData
    }
})
