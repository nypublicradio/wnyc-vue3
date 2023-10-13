import { useCurrentEpisodeHolder, useAllCurrentStations, useCurrentUserProfile, /* useLocalUserProfileDefault */ } from '~/composables/states'
import { formatTime, formatPublisherImageUrl } from '~/utilities/helpers'

//import fetchDataImport from '~/assets/data/fetchedData.json'
//import allCurrentStationsImport from '~/assets/data/allCurrentStationsImport.json'

// Get a list of article pages using the Aviary /pages api
export async function updateLiveStream(slug: string) {
    //BFF
    const { data: fetchData } = await useFetch(`/api/whatson/${slug}`)

    const currentEpisodeHolder = useCurrentEpisodeHolder()
    currentEpisodeHolder.value = fetchData.value
}


export async function updateAllLiveStreams() {
    const allCurrentStations = useAllCurrentStations()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const currentUserProfile = useCurrentUserProfile()
    //const localUserProfileDefault = useLocalUserProfileDefault()

    // BFF
    const { data: fetchingAll } = await useFetch('/api/streams')
    // set all streams
    allCurrentStations.value = fetchingAll.value.filter(Boolean)
    //allCurrentStations.value = allCurrentStationsImport

    // set initial stream with the `currentStreamStation` value in the states.ts file
    const initialStation = allCurrentStations.value.find(
        (option) => {
            //console.log('currentUserProfile.value  = ', currentUserProfile.value)
            if (currentUserProfile.value) {
                const profile = typeof currentUserProfile.value.default_live_stream === 'string' ? currentUserProfile.value.default_live_stream : currentUserProfile.value.default_live_stream.station
                return option.station === profile
            }
        }
    )

    currentEpisodeHolder.value = initialStation
    //console.log('currentEpisodeHolder STREAM= ', currentEpisodeHolder.value)
}
