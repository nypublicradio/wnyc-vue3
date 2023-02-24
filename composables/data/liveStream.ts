import { useCurrentEpisodeHolder, useAllCurrentStations, useCurrentStreamStation } from '~/composables/states'
// Get a list of article pages using the Aviary /pages api
export async function updateLiveStream(slug: string) {
    const config = useRuntimeConfig()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const fetchData = await useFetch(`${config['LIVESTREAM_URL']}?filter[slug]=${slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)
    currentEpisodeHolder.value = fetchData.data.value
}

export async function updateAllLiveStreams() {
    const config = useRuntimeConfig()
    const allCurrentStations = useAllCurrentStations()
    const currentStreamStation = useCurrentStreamStation()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const fetchData = await useFetch(`${config['LIVESTREAM_URL']}?include=current-airing.image,current-show.show.image,current-episode.segments`)

    const fetchingAll = await Promise.all(fetchData.data.value.data.map(async (stream) => {
        // conditional to check what shows are currently running
        if (stream.relationships['current-show'].data !== null) {
            const fetchedRunningShowData = await useFetch(`${config['LIVESTREAM_URL']}?filter[slug]=${stream.attributes.slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)
            return fetchedRunningShowData
        }
    }))
    // set all streams
    allCurrentStations.value = fetchingAll.filter(Boolean)

    // set initial stream with the `currentStreamStation` value in the states.ts file
    const initialStation = allCurrentStations.value.find(
        (station) =>
            station.data.data[0].attributes.slug === currentStreamStation.value
    ).data
    currentEpisodeHolder.value = initialStation
}