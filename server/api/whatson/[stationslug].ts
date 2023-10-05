const config = useRuntimeConfig()
import axios from 'axios'

const getLivestream = async (slug: String) => {
	const res = await axios(`${config.public['LIVESTREAM_URL']}?filter[slug]=${slug}&include=current-airing.image,current-show.show.image,current-episode.segments`)
	return res.data
}

export default defineEventHandler(async (event) => {
	console.dir(event);
	const slug: String | undefined = event?.context?.params?.stationslug;
	if (slug) {
		return getLivestream(slug);
	}
	return null;
});