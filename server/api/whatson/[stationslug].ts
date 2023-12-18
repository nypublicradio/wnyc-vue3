import axios from 'axios'
import humps from 'humps'
import { formatTime, formatPublisherImageUrl } from '~/utilities/helpers'

const config = useRuntimeConfig()
const getLivestream = async (slug: String) => {
	const res = await axios(`${config.public['LIVESTREAM_URL']}?filter[slug]=${slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)
	return humps.camelizeKeys(formatShowData(res.data))
}

const formatShowData = (apiResponse: any) => {
	const showData = apiResponse?.included?.find((obj: any) =>
		obj.type === 'show'
	)
	const scheduleData = apiResponse?.included?.find((obj: any) => {
		return obj.type === 'show-schedule'
	})
	const imageData = apiResponse?.included?.find((obj: any) => {
		return obj.type === 'image'
	})
	const episodeData = apiResponse?.included?.find((obj: any) => {
		return obj.type === 'episode'
	})
	const airingData = apiResponse?.included?.find((obj: any) => {
		return obj.type === 'airing'
	})
	const segmentData = apiResponse?.included?.filter((item: any) => item.type === 'segment')
	const formattedSegments: any = []
	if (apiResponse.included) {
		if (segmentData !== null) {
			segmentData.forEach(function (value: any) {
				formattedSegments.push(
					{
						title: value.attributes.title,
						url: 'https://www.wnyc.org/story/' + value.attributes.slug,
						newWindow: true
					}
				)
			})
		}
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
	if (!apiResponse.included) {
		title = apiResponse.data[0].attributes.name
		details = apiResponse.data[0].attributes['short-description']
	}
	const formattedData = {
		details,
		detailsLink: showData ? showData.attributes.url : null,
		episodeTitle: episodeData ? episodeData.attributes.title : null,
		episodeLink: episodeData ? episodeData.attributes.url : null,
		episodeBody: episodeData ? episodeData.attributes.body : null,
		episodeTranscript: episodeData ? episodeData.attributes.transcript : null,
		file: apiResponse.data[0].attributes['hls'],
		image: imageData ? 'https://media.wnyc.org/i/448/448/l/80/' + imageData.attributes.name : apiResponse.data[0].attributes['image-logo'],
		slug: apiResponse.data[0].attributes.slug,
		station: apiResponse.data[0].attributes.name,
		timeStart: scheduleData ? formatTime(scheduleData.attributes['iso-start-time']) : null,
		timeEnd: scheduleData ? formatTime(scheduleData.attributes['iso-end-time']) : null,
		title,
		titleLink,
		updated_date: null,
		publishAt: null,
		first_published_at: null,
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
		onTodaysShowSegments: segmentData?.length > 0 ? formattedSegments : null,
		onTodaysShowSocial: showData ? showData.attributes.about.social : null,
		showSchedule: scheduleData ? scheduleData.attributes : null
	}
	return formattedData
};



export default defineEventHandler(async (event) => {
	const slug: String | undefined = event?.context?.params?.stationslug;
	if (slug) {
		return getLivestream(slug);
	}
	return null;
});