import { useCurrentEpisodeHolder, useAllCurrentStations, useCurrentUserProfile, useGlobalToast } from '~/composables/states'
import { saveRecentlyPlayed } from '~/utilities/helpers'


// Get a list of article pages using the Aviary /pages api
export async function updateLiveStream(slug: string, save = true) {
    const config = useRuntimeConfig()
    //BFF
    try {
        const fetchData = await $fetch(`${config.public.BFF_URL}/api/whatson/${slug}`)
        const currentEpisodeHolder = useCurrentEpisodeHolder()
        currentEpisodeHolder.value = fetchData
        if (save) { saveRecentlyPlayed(currentEpisodeHolder.value, mediaTypes.LIVE) }
    } catch (error) {
        const globalToast = useGlobalToast()
        globalToast.value = {
            severity: "error",
            summary: "Sorry. We are having trouble with the live stream. Please try again later.",
            life: null,
            closable: true,
        }
        console.error('error = ', error)
    }
}

export async function updateAllLiveStreams(setHolder = true) {
    const allCurrentStations = useAllCurrentStations()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const currentUserProfile = useCurrentUserProfile()
    const config = useRuntimeConfig()
    // BFF
    try {
        const fetchingAll = await $fetch(`${config.public.BFF_URL}/api/streams`)
        // set all streams
        allCurrentStations.value = fetchingAll.filter(Boolean)

        // set initial stream with the `currentStreamStation` value in the states.ts file
        const initialStation = allCurrentStations.value.find(
            (option) => {
                if (currentUserProfile.value) {
                    const profile = typeof currentUserProfile.value.default_live_stream === 'string' ? currentUserProfile.value.default_live_stream : currentUserProfile.value.default_live_stream.station
                    return option.station === profile
                } else {
                    return null
                }
            }
        )
        if (setHolder) currentEpisodeHolder.value = initialStation

    } catch (error) {
        const globalToast = useGlobalToast()
        globalToast.value = {
            severity: "error",
            summary: "Sorry. We are having trouble with the live stream. Please try again later.",
            life: 8000,
            closable: true,
        }
        console.error('error = ', error)
    }
}
