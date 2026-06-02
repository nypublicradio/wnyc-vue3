/**
 * Server-side proxy for downloading audio files to avoid CORS restrictions.
 * This endpoint fetches the audio file from the origin server and streams it to the client.
 */

const DOWNLOAD_PROXY_ALLOWED_HOSTS = [
  "wnyc.org",
  "wqxr.org",
  "gothamist.com",
  "nypublicradio.org",
  "npr.org",
  "simplecast.com",
  "simplecastaudio.com",
  "podtrac.com",
  "megaphone.fm",
  "amazonaws.com",
  "cloudfront.net",
]

const isAllowedHostname = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase()
  return DOWNLOAD_PROXY_ALLOWED_HOSTS.some((allowedHost) => {
    const allowed = allowedHost.toLowerCase()
    return normalized === allowed || normalized.endsWith(`.${allowed}`)
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawUrl = query.url as string

  if (!rawUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "URL parameter is required",
    })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(rawUrl)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid URL",
    })
  }

  if (parsedUrl.protocol !== "https:") {
    throw createError({
      statusCode: 400,
      statusMessage: "Only https URLs are allowed",
    })
  }

  if (!isAllowedHostname(parsedUrl.hostname)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Hostname is not allowed",
    })
  }

  try {
    // Fetch the file from the remote server.
    const response = await fetch(parsedUrl.toString())

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch file: ${response.statusText}`,
      })
    }

    // Get content headers.
    const contentType = response.headers.get("content-type") || "application/octet-stream"
    const contentLength = response.headers.get("content-length")

    // Set response headers.
    setResponseHeaders(event, {
      "Content-Type": contentType,
      ...(contentLength && { "Content-Length": contentLength }),
      "Cache-Control": "public, max-age=3600",
    })

    // Stream the response body.
    return response.body
  } catch (error) {
    console.error("Error in download proxy:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to download file",
    })
  }
})
