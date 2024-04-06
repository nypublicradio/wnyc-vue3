import { parseFromTokenizer } from 'music-metadata';
import { makeTokenizer } from '@tokenizer/http';

/**
 * Estimate the duration of an audio track in seconds. This utility function uses
 * a Range request to fetch the minimum number of bytes of the audio track to get sufficient metadata.
 * Results cached in-memory.
 * 
 * @param audioTrackUrl 
 * @returns 
 */
export async function estimateMp3Duration(audioTrackUrl: string): Promise<number> {
	try {
		const httpTokenizer = await makeTokenizer(audioTrackUrl);
		const metadata = await parseFromTokenizer(httpTokenizer);
		const duration = Math.round(metadata.format.duration);
		return duration;
	} catch (e) {
		return 0;
	}
}
