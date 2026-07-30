import { estimateMp3Duration } from '~/server/utils/duration'

export default defineEventHandler(async (event) => {
	const { url } = getQuery(event)
	if (!url || typeof url !== 'string') {
		throw createError({ statusCode: 400, message: 'Missing url query parameter' })
	}
	const duration = await estimateMp3Duration(url)
	return { duration }
})
