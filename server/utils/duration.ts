import { parseFromTokenizer, parseWebStream } from 'music-metadata'
import { makeTokenizer } from '@tokenizer/http'
import { hasAudio } from '~/utilities/helpers'

// Simple cache that only stores successful results
const durationCache = new Map<string, number>()

/**
 * Parse duration using a full fetch (fallback when Range requests fail or return no duration).
 * Includes a 15s timeout to avoid hanging on large files.
 */
async function parseDurationFullFetch (audioTrackUrl: string): Promise<number | null> {
	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), 15000)
	try {
		const response = await fetch(audioTrackUrl, { signal: controller.signal })
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
	} finally {
		clearTimeout(timeout)
	}
}

/**
 * Estimate the duration of an audio track in seconds. Tries Range requests first
 * for efficiency, falls back to a full fetch if the server doesn't support them
 * or if the Range request returns no duration metadata.
 * Only successful results are cached. Failures are never cached so they can be retried.
 * 
 * @param audioTrackUrl 
 * @returns 
 */
export async function estimateMp3Duration (audioTrackUrl: string): Promise<number | null> {
	if (!hasAudio(audioTrackUrl)) {
		console.error(`Failed to estimate duration of ${audioTrackUrl} because the audio URL is NULL or is an empty array`)
		return null
	}

	// Strip query params for cache key so all users share the same cached duration
	const cacheKey = audioTrackUrl.split('?')[0]
	const cached = durationCache.get(cacheKey)
	if (cached !== undefined) {
		return cached
	}

	try {
		const httpTokenizer = await makeTokenizer(audioTrackUrl)
		const metadata = await parseFromTokenizer(httpTokenizer, { duration: true })
		const duration = metadata.format.duration
		if (duration) {
			const rounded = Math.round(duration)
			durationCache.set(cacheKey, rounded)
			return rounded
		}
		// Duration metadata not available via Range — fall through to full fetch
		console.warn(`Duration metadata unavailable via Range for ${audioTrackUrl}, trying full fetch`)
	} catch (e) {
		console.warn('Range request failed, falling back to full fetch:', e)
	}

	// Fallback: full fetch for files that don't expose duration in initial headers
	try {
		const duration = await parseDurationFullFetch(audioTrackUrl)
		if (duration) {
			durationCache.set(cacheKey, duration)
			return duration
		}
	} catch (e) {
		console.warn('Full fetch fallback also failed:', e)
	}

	return null
}
