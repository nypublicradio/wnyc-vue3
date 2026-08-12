import { parseFromTokenizer, parseWebStream } from 'music-metadata'
import { makeTokenizer } from '@tokenizer/http'
import memoize from 'memoize'
import { hasAudio } from '~/utilities/helpers'

/**
 * Parse duration using a full fetch (fallback when Range requests are not supported).
 */
async function parseDurationFullFetch (audioTrackUrl: string): Promise<number | null> {
	const response = await fetch(audioTrackUrl)
	if (!response.ok || !response.body) {
		console.error(`Failed to fetch ${audioTrackUrl}: ${response.status}`)
		return null
	}
	const contentLength = response.headers.get('Content-Length')
	const size = contentLength ? parseInt(contentLength, 10) : undefined
	const metadata = await parseWebStream(response.body, {
		mimeType: response.headers.get('Content-Type') ?? 'audio/mpeg',
		size,
	}, { duration: true })
	return metadata.format.duration ? Math.round(metadata.format.duration) : null
}

/**
 * Estimate the duration of an audio track in seconds. Tries Range requests first
 * for efficiency, falls back to a full fetch if the server doesn't support them.
 * Results cached in-memory.
 * 
 * @param audioTrackUrl 
 * @returns 
 */
export const estimateMp3Duration = memoize(async (audioTrackUrl: string): Promise<number | null> => {
	if (hasAudio(audioTrackUrl)) {
		try {
			const httpTokenizer = await makeTokenizer(audioTrackUrl)
			const metadata = await parseFromTokenizer(httpTokenizer, { duration: true })
			const duration = metadata.format.duration
			if (!duration) {
				console.error(`Duration metadata unavailable for ${audioTrackUrl}`)
				return null
			}
			return Math.round(duration)
		} catch (e) {
			// Fall back to full fetch when server doesn't support Range requests
			console.warn('Failed to estimate duration using Range requests, falling back to full fetch', e)
			try {
				const duration = await parseDurationFullFetch(audioTrackUrl)
				if (duration) return duration
			} catch (fallbackError) {
				console.error(`Failed to estimate duration of ${audioTrackUrl}`, fallbackError)
			}
			return null
		}
	} else {
		console.error(`Failed to estimate duration of ${audioTrackUrl} because the audio URL is NULL or is an empty array`)
		return null
	}
})
