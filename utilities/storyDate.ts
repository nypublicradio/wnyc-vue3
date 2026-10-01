import { cmsSources } from '~/composables/globals'
import { getPublisherCalendarDay } from './publisherDate'

type Timestamp = string | Date
interface StoryDateData {
  cmsSource?: string
  displayDate?: string
  meta?: { firstPublishedAt?: Timestamp }
  updatedDate?: Timestamp
  publicationDate?: Timestamp
}

const calendarLabel = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC', month: 'short', day: 'numeric',
})

// Only story details opt in. Lists, saved items, the player and older app builds
// keep their existing release-date labels and stored metadata.
export function getStoryDetailDate (
  data: StoryDateData | null,
  getDate: (data: StoryDateData | null, pattern: string) => string | null,
): string | null {
  if (data?.cmsSource !== cmsSources.PUBLISHER) return getDate(data, 'LLL d')
  const now = new Date()
  const value = data.meta?.firstPublishedAt || data.updatedDate || data.publicationDate
  const release = value ? new Date(value instanceof Date ? value.getTime() : value) : null
  const hasRelease = release !== null && Number.isFinite(release.getTime()) && release.getUTCFullYear() !== 1900
  const display = data.displayDate
  // A scheduled airing is not a future publication. Missing/unknown editorial
  // dates also keep the release date rather than inventing a date for the story.
  if (!display || display > getPublisherCalendarDay(now)) return hasRelease ? getDate(data, 'LLL d') : null
  // Preserve existing relative times and local formatting when the two dates
  // already describe the same day. Only differing editorial dates need a change.
  if (hasRelease && display === getPublisherCalendarDay(release)) return getDate(data, 'LLL d')
  const date = new Date(`${display}T12:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== display || display === '1900-01-01') {
    return hasRelease ? getDate(data, 'LLL d') : null
  }
  const year = date.getUTCFullYear()
  return calendarLabel.format(date) + (year === now.getFullYear() ? '' : `, ${year}`)
}
