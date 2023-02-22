import { useCurrentEpisodeHolder, useAllCurrentStations } from '~/composables/states'
// Get a list of article pages using the Aviary /pages api
export async function updateLiveStream(slug: string) {
    const config = useRuntimeConfig()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const fetchData = await $fetch(`${config['LIVESTREAM_URL']}?filter[slug]=${slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)
    currentEpisodeHolder.value = fetchData
}

export async function updateAllLiveStreams() {
    const config = useRuntimeConfig()
    const allCurrentStations = useAllCurrentStations()
    const fetchData = await $fetch(`${config['LIVESTREAM_URL']}?include=current-airing.image,current-show.show.image,current-episode.segments`)
    let availableStreams = []

    fetchData.data.forEach((stream) => {

        // conditional to check what shows are currently running
        if (stream.relationships['current-show'].data !== null) {
            availableStreams.push(stream)
        }
    })

    allCurrentStations.value = availableStreams
}