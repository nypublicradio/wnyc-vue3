import { useCurrentEpisodeHolder, useAllCurrentStations, useCurrentUserProfile } from '~/composables/states'
import { formatTime, formatPublisherImageUrl } from '~/utilities/helpers'

//import fetchDataImport from '~/assets/data/fetchedData.json'
//import allCurrentStationsImport from '~/assets/data/allCurrentStationsImport.json'

// Get a list of article pages using the Aviary /pages api
export async function updateLiveStream(slug: string) {
    const config = useRuntimeConfig()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const fetchData = await useFetch(`${config.public['LIVESTREAM_URL']}?filter[slug]=${slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)

    currentEpisodeHolder.value = formatShowData(fetchData.data.value)
}


export async function updateAllLiveStreams() {
    const config = useRuntimeConfig()
    const allCurrentStations = useAllCurrentStations()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const currentUserProfile = useCurrentUserProfile()

    const fetchData = await useFetch(`${config.public['LIVESTREAM_URL']}?include=current-airing.image,current-show.show.image,current-episode.segments`)
    //console.log('fetchData = ', fetchData)

    const fetchingAll = await Promise.all(fetchData?.data?.value.data.map(async (stream) => {
        //const fetchingAll = await Promise.all(fetchDataImport?.data.map(async (stream) => {
        //const fetchingAll = await Promise.all(fetchData?.data.map(async (stream) => {
        // conditional to check what shows are currently running
        if (stream.relationships['current-show'].data !== null) {
            const fetchedRunningShowData = await useFetch(`${config.public['LIVESTREAM_URL']}?filter[slug]=${stream.attributes.slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)

            return formatShowData(fetchedRunningShowData.data.value)
        }
    }))
    // set all streams
    allCurrentStations.value = fetchingAll.filter(Boolean)
    //allCurrentStations.value = allCurrentStationsImport

    //console.log('allCurrentStations value', allCurrentStations.value)
    // set initial stream with the `currentStreamStation` value in the states.ts file
    const initialStation = allCurrentStations.value.find(
        (option) => {
            if (currentUserProfile.value) {
                const profile = typeof currentUserProfile.value.default_live_stream === 'string' ? currentUserProfile.value.default_live_stream : currentUserProfile.value.default_live_stream.station
                return option.station === profile
            }
        }
    )
    currentEpisodeHolder.value = initialStation

}

const formatShowData = (apiResponse) => {
    const showData = apiResponse.included.find((obj) =>
        obj.type === 'show'
    )
    const scheduleData = apiResponse.included.find((obj) => {
        return obj.type === 'show-schedule'
    })
    const imageData = apiResponse.included.find((obj) => {
        return obj.type === 'image'
    })
    const episodeData = apiResponse.included.find((obj) => {
        return obj.type === 'episode'
    })
    const airingData = apiResponse.included.find((obj) => {
        return obj.type === 'airing'
    })
    const segmentData = apiResponse.included.filter(item => item.type === 'segment')
    const formattedSegments = []
    if (segmentData !== null) {
        segmentData.forEach(function (value) {
            formattedSegments.push(
                {
                    title: value.attributes.title,
                    url: 'https://www.wnyc.org/story/' + value.attributes.slug,
                    newWindow: true
                }
            )
        })
    }
    let title = showData ? showData.attributes.title : null
    let details = showData ? showData.attributes.tease : null
    let titleLink = showData ? showData.attributes.url : null
    // handle special airings
    if (airingData) {
        title = airingData.attributes.title
        details = airingData.attributes.description
        titleLink = airingData.attributes.href
    }
    //console.log('episodeData image tample', formatPublisherImageUrl(episodeData?.attributes['image-main'].template))
    const formattedData = {
        details,
        detailsLink: showData ? showData.attributes.url : null,
        episodeTitle: episodeData ? episodeData.attributes.title : null,
        episodeLink: episodeData ? episodeData.attributes.url : null,
        file: apiResponse.data[0].attributes['mobile-mp3'],
        image: imageData ? 'https://media.wnyc.org/i/448/448/l/80/' + imageData.attributes.name : apiResponse.data[0].attributes['image-logo'],
        slug: apiResponse.data[0].attributes.slug,
        station: apiResponse.data[0].attributes.name,
        timeStart: scheduleData ? formatTime(scheduleData.attributes['iso-start-time']) : null,
        timeEnd: scheduleData ? formatTime(scheduleData.attributes['iso-end-time']) : null,
        title,
        titleLink,
        onTodaysShowHeadline: episodeData ? episodeData.attributes.title : null,
        onTodaysShowHeadlineLink: episodeData ? episodeData.attributes.url : null,
        onTodaysShowHosts: showData ? showData.attributes.about.roles.host : null,
        onTodaysShowImage: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main'].url : null,
        onTodaysShowImageMaxWidth: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main'].w : null,
        onTodaysShowImageMaxHeight: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main'].h : null,
        onTodaysShowImageTemplate: episodeData && episodeData.attributes['image-main'] ? formatPublisherImageUrl(episodeData.attributes['image-main'].template) : null,
        onTodaysShowImageAltText: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main']['alt-text'] : null,
        onTodaysShowImageCaption: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main'].caption : null,
        onTodaysShowImageCredits: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main']['credits-name'] : null,
        onTodaysShowImageCreditsUrl: episodeData && episodeData.attributes['image-main'] ? episodeData.attributes['image-main']['credits-url'] : null,
        onTodaysShowSegments: segmentData.length > 0 ? formattedSegments : null,
        onTodaysShowSocial: showData ? showData.attributes.about.social : null
    }
    return formattedData
}