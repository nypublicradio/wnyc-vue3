import { parseFromTokenizer } from 'music-metadata'
import { makeTokenizer } from '@tokenizer/http'
import memoize from 'memoize'
import { hasAudio } from '~/utilities/helpers'
/**
 * Estimate the duration of an audio track in seconds. This utility function uses
 * a Range request to fetch the minimum number of bytes of the audio track to get sufficient metadata.
 * Results cached in-memory.
 * 
 * @param audioTrackUrl 
 * @returns 
 */
/**
 * Estimate the duration of an audio track in seconds. This utility function uses
 * a Range request to fetch the minimum number of bytes of the audio track to get sufficient metadata.
 * Results cached in-memory.
 * 
 * @param audioTrackUrl 
 * @returns 
 */
export const estimateMp3Duration = memoize(async (audioTrackUrl: string): Promise<number> => {
	//console.log(`Estimating duration for audio URL: ${audioTrackUrl}`)
	//return 0
	if (hasAudio(audioTrackUrl)) {
		try {
			const httpTokenizer = await makeTokenizer(audioTrackUrl)
			const metadata = await parseFromTokenizer(httpTokenizer, { duration: true })
			const duration = metadata.format.duration
			if (!duration) {
				console.error(`Duration metadata unavailable for ${audioTrackUrl}`)
				return null
			}
			return Math.ceil(duration)
		} catch (e) {
			console.error(`Failed to estimate duration of ${audioTrackUrl}`, e)
			return null
		}
	} else {
		//console.error(`Failed to estimate duration of ${audioTrackUrl} because the audio URL is NULL or is an empty array`);
		return null
	}
})

