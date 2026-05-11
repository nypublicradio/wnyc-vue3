import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { getLegacyDiscoverShows } from '~/server/api/v2/discover/shows'
import { customAlphabeticalSort } from '~/utilities/helpers'

//Fetch featured shows for the app
const featuredShowsInMenu = async () => {

    const data = await getLegacyDiscoverShows({
        discover_station: 'wnyc-vue3-app-menulist',
        api_key: 'prixfixe',
    })

    const resData = data.map((show) => {
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
