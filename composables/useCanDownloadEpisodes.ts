import { getTrueSlug } from "~/utilities/helpers"

// This map lives outside the function, so it is shared across all MediaCard instances!
// It deduplicates concurrent requests for the same show slug.
const pendingRequests = new Map<string, Promise<boolean>>()

export const useCanDownloadEpisodes = (slug: string): Promise<boolean> => {
  if (!slug) return Promise.resolve(false)

  // Grab the config synchronously before any await calls so Nuxt doesn't lose context
  const config = useRuntimeConfig()

  // 1. If another card is already fetching this exact slug, share the promise!
  if (pendingRequests.has(slug)) {
    return pendingRequests.get(slug)!
  }

  // 2. Otherwise, start a new native $fetch
  const fetchPromise = (async () => {
    const trueSlug = await getTrueSlug(slug)
    if (!trueSlug) return false

    try {
      // Use native $fetch for better performance
      //console.log("useCanDownloadEpisodes", trueSlug)
      const res = await $fetch(`${config.public.BFF_URL}/api/pages/wagtail/${trueSlug}?downloadRulesOnly=true`)
      //console.log("###### useCanDownloadEpisodes", res)
      return res?.canDownloadEpisodes ?? false
    } catch (error) {
      return false
    }
  })()

  // 3. Put it in the shared map
  pendingRequests.set(slug, fetchPromise)

  // 4. Clear it after 15 minutes since show download settings rarely change
  setTimeout(() => pendingRequests.delete(slug), 900000) // 15 minutes * 60 seconds * 1000 ms

  return fetchPromise
}
