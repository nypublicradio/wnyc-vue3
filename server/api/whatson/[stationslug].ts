import axios from 'axios'
import humps from 'humps'
import { formatTime, formatPublisherImageUrl } from '~/utilities/helpers'
import { cmsSources } from '~/composables/globals'
import { parse, types, stringify } from 'hls-parser';
const config = useRuntimeConfig()

// format the show data from API response
const formatShowData = (apiResponse: any) => {
	const showData = apiResponse?.included?.find((obj) => obj.type === 'show')
	const scheduleData = apiResponse?.included?.find((obj) => obj.type === 'show-schedule')
	const imageData = apiResponse?.included?.find((obj) => obj.type === 'image')
	const episodeData = apiResponse?.included?.find((obj) => obj.type === 'episode')
	const airingData = apiResponse?.included?.find((obj) => obj.type === 'airing')
	const segmentData = apiResponse?.included?.filter((item) => item.type === 'segment')
	const formattedSegments: any = []
	if (apiResponse.included) {
		if (segmentData !== null) {
			segmentData.forEach((value: { attributes: { title: string, slug: string } }) => {
				formattedSegments.push({
					title: value.attributes.title,
					url: `https://www.wnyc.org/story/${value.attributes.slug}`,
					newWindow: true
				});
			});
		}
	}
	let title = showData ? showData.attributes.title : null
	const showSlug = showData ? showData.attributes.slug : null
	let details = showData ? showData.attributes.tease : null
	let titleLink = showData ? showData.attributes.url : null
	const id = showData ? showData.id : null
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
	return {
		cmsSource: cmsSources.PUBLISHER,
		details,
		detailsLink: showData ? showData.attributes.url : null,
		episodeTitle: episodeData ? episodeData.attributes.title : null,
		episodeLink: episodeData ? episodeData.attributes.url : null,
		episodeBody: episodeData ? episodeData.attributes.body : null,
		episodeTranscript: episodeData ? episodeData.attributes.transcript : null,
		audio: apiResponse.data[0].attributes['mobile-mp3'],
		file: apiResponse.data[0].attributes['mobile-mp3'],
		hls: apiResponse.data[0].attributes['hls'],
		id,
		image: imageData ? `https://media.wnyc.org/i/448/448/l/80/${imageData.attributes.name}` : apiResponse.data[0].attributes['image-logo'],
		slug: apiResponse.data[0].attributes.slug,
		station: apiResponse.data[0].attributes.name,
		stationImage: apiResponse.data[0].attributes['image-logo'],
		timeStart: scheduleData ? formatTime(scheduleData.attributes['iso-start-time']) : null,
		timeEnd: scheduleData ? formatTime(scheduleData.attributes['iso-end-time']) : null,
		title,
		titleLink,
		showSlug,
		updated_date: null,
		publishAt: null,
		first_published_at: null,
		onTodaysShowHeadline: episodeData ? episodeData.attributes.title : null,
		onTodaysShowHeadlineLink: episodeData ? episodeData.attributes.url : null,
		onTodaysShowHosts: showData ? showData.attributes.about.roles.host : null,
		onTodaysShowImage: episodeData?.attributes['image-main']?.url ?? null,
		onTodaysShowImageMaxWidth: episodeData?.attributes['image-main']?.w ?? null,
		onTodaysShowImageMaxHeight: episodeData?.attributes['image-main']?.h ?? null,
		onTodaysShowImageTemplate: episodeData?.attributes['image-main'] ? formatPublisherImageUrl(episodeData.attributes['image-main'].template) : null,
		onTodaysShowImageAltText: episodeData?.attributes['image-main']?.['alt-text'] ?? null,
		onTodaysShowImageCaption: episodeData?.attributes['image-main']?.caption ?? null,
		onTodaysShowImageCredits: episodeData?.attributes['image-main']?.['credits-name'] ?? null,
		onTodaysShowImageCreditsUrl: episodeData?.attributes['image-main']?.['credits-url'] ?? null,
		onTodaysShowSegments: segmentData?.length > 0 ? formattedSegments : null,
		onTodaysShowSocial: showData ? showData.attributes.about.social : null,
		showSchedule: scheduleData ? scheduleData.attributes : null
	}
};

// Fetch the livestream data from the API
const getLivestream = async (slug: string) => {

	const res = await axios(`${config.public['LIVESTREAM_URL']}?filter[slug]=${slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)
	return humps.camelizeKeys(formatShowData(res.data))
}
// Fetch the livestream data from the API
const getLivestreamHlsMetadataTemp = async () => {

	const stream = "https://hls-live.wnyc.org/wnycfmapp-hls.aac/playlist.m3u8";

	const playlistResponse = await axios.get(stream);
	console.log('Playlist Response:', playlistResponse);
	const playlist = parse(playlistResponse.data);

	if (playlist.isMasterPlaylist) {
		console.log('Master Playlist detected');

		// Get the first variant (or you can select a specific one based on bandwidth/resolution)
		const variant = playlist.variants[0];

		// Make sure the URI is absolute (some playlists use relative URLs)
		const variantUri = new URL(variant.uri, stream).toString();

		// Fetch the media playlist
		const mediaPlaylistResponse = await axios.get(variantUri);
		const mediaPlaylist = parse(mediaPlaylistResponse.data);

		//console.log('Media Playlist =', mediaPlaylist);
	} else {
		// Already a media playlist
		//console.log('Media Playlist =', playlist);
	}
	//console.log('Playlist Metadata:', playlistMetaData);

	// if (playlistMetaData.isMasterPlaylist && playlistMetaData.variants.length > 0) {
	// 	const variantUri = playlistMetaData.variants[0].uri;
	// 	const mediaPlaylistResponse = await axios.get(variantUri);
	// 	const mediaPlaylistMetaData = HLS.parse(mediaPlaylistResponse.data);
	// 	//console.log('Media Playlist Metadata:', mediaPlaylistMetaData);
	// }
}

export default defineEventHandler((event) => {

	//getLivestreamHlsMetadataTemp()

	const slug: string | undefined = event?.context?.params?.stationslug;
	if (slug) {
		return getLivestream(slug);
	}
	return null;
});