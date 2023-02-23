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
    const fetchData = await useFetch(`${config['LIVESTREAM_URL']}?include=current-airing.image,current-show.show.image,current-episode.segments`)
    //console.log('fetchData.data.value  = ', fetchData.data.value.data)

    const fetchingAll = await Promise.all(fetchData.data.value.data.map(async (stream) => {
        //console.log('stream: ', stream)
        // conditional to check what shows are currently running
        if (stream.relationships['current-show'].data !== null) {
            const fetchedRunningShowData = await useFetch(`${config['LIVESTREAM_URL']}?filter[slug]=${stream.attributes.slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)
            return fetchedRunningShowData
        }
    }))
    //console.log('fetchingAll: ', fetchingAll.filter(Boolean))
    allCurrentStations.value = fetchingAll.filter(Boolean)
}