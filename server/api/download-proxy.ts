/**
 * Server-side proxy for downloading audio files to avoid CORS restrictions
 * This endpoint fetches the audio file from the origin server and streams it to the client
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const url = query.url as string

    if (!url) {
        throw createError({
            statusCode: 400,
            statusMessage: 'URL parameter is required',
        })
    }

    try {
        // Fetch the file from the remote server
        const response = await fetch(url)

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                statusMessage: `Failed to fetch file: ${response.statusText}`,
            })
        }

        // Get content headers
        const contentType = response.headers.get('content-type') || 'application/octet-stream'
        const contentLength = response.headers.get('content-length')

        // Set response headers
        setResponseHeaders(event, {
            'Content-Type': contentType,
            ...(contentLength && { 'Content-Length': contentLength }),
            'Cache-Control': 'public, max-age=3600',
        })

        // Stream the response body
        return response.body
    } catch (error) {
        console.error('Error in download proxy:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to download file',
        })
    }
})
