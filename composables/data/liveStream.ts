import { useCurrentEpisodeHolder, useAllCurrentStations, useCurrentUserProfile, } from '~/composables/states'



// Get a list of article pages using the Aviary /pages api
export async function updateLiveStream(slug: string) {
    const config = useRuntimeConfig()
    //BFF
    const { data: fetchData } = await useFetch(`${config.public.BFF_URL}/api/whatson/${slug}`)
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    currentEpisodeHolder.value = fetchData.value
}

export async function updateAllLiveStreams() {
    const allCurrentStations = useAllCurrentStations()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const currentUserProfile = useCurrentUserProfile()
    const config = useRuntimeConfig()
    // BFF
    const { data: fetchingAll } = await useFetch(`${config.public.BFF_URL}/api/streams`)
    console.log('fetchingAll = ', fetchingAll.value)
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
