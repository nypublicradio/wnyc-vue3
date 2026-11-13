/**
 * NPR's own title slug for a story, read from its npr.org link: the path segment right
 * after the story id. Returns null when the link has no title segment.
 * e.g. https://www.npr.org/2026/11/05/nx-s1-6029331/democrats-have-… -> "democrats-have-…"
 */
export const getNprTitleSlug = (link?: string, id?: string): string | null => {
  if (!link || !id) return null
  try {
    const segments = new URL(link).pathname.split("/").filter(Boolean)
    const i = segments.indexOf(id)
    return i >= 0 ? (segments[i + 1] ?? null) : null
  } catch {
    return null // e.g. the normalizer's '/' fallback when NPR has no web page
  }
}
