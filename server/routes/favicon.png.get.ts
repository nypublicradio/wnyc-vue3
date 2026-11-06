// Serves the site favicon from PROD Wagtail so it can be changed in the CMS without a release
// (replace the file on image 362345). Falls back to the bundled /favicon-32x32.png if Wagtail
// or its image CDN is unreachable. CloudFront caches successful responses for an hour.
const REMOTE_FAVICON =
  "https://cms.prod.nypr.digital/images/362345/fill-32x32|format-png/"

export default defineEventHandler(async (event) => {
  try {
    const icon = await $fetch<ArrayBuffer>(REMOTE_FAVICON, {
      responseType: "arrayBuffer",
      timeout: 3000,
    })
    setResponseHeaders(event, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    })
    return Buffer.from(icon)
  } catch {
    // Not cached, so the remote favicon is picked up again as soon as Wagtail recovers
    setResponseHeader(event, "Cache-Control", "no-store")
    return sendRedirect(event, "/favicon-32x32.png", 302)
  }
})
