import { useCurrentEpisodeHolder, useCurrentStreamStation, useAllCurrentStations, useCurrentUserProfile, useGlobalToast } from '~/composables/states'
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

export async function updateAllLiveStreams(init = true) {
    const allCurrentStations = useAllCurrentStations()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const currentStreamStation = useCurrentStreamStation()
    const currentUserProfile = useCurrentUserProfile()
    const config = useRuntimeConfig()
    // BFF
    try {
        const fetchingAll = await $fetch(`${config.public.BFF_URL}/api/streams`)
        // set all streams to the filtered array
        allCurrentStations.value = fetchingAll.filter(Boolean)

        let thisStation = null

        if (init) {
            // set initial stream with the `currentStreamStation` value in the states.ts file
            thisStation = allCurrentStations.value.find(
                (option) => {
                    const profile = typeof currentUserProfile.value.default_live_stream === 'string' ? currentUserProfile.value.default_live_stream : currentUserProfile.value.default_live_stream.station
                    // set the current stream station slug
                    currentStreamStation.value = option.slug
                    return option.station === profile
                }
            )
        } else {
            thisStation = allCurrentStations.value.find(
                (option) => {
                    return option.slug === currentStreamStation.value
                }
            )
            // also update the current stream data, the media session data and the schedule

        }
        currentEpisodeHolder.value = thisStation

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
