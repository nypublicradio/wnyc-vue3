import { cmsSources } from '~/composables/globals'
import { getPublisherCalendarDay, getPublisherDisplayDate, getPublisherTimestamp } from './publisherDate'

type Timestamp = string | Date
interface StoryDateData {
  cmsSource?: string
  displayDate?: string
  displayDateTime?: string
  releaseDateTime?: string | null
  meta?: { firstPublishedAt?: Timestamp }
  updatedDate?: Timestamp
  publicationDate?: Timestamp
}

const calendarLabel = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC', month: 'short', day: 'numeric',
})

// Only story details opt in. Legacy release fields and their consumers stay intact.
export function getStoryDetailDate (
  data: StoryDateData | null,
  getDate: (data: StoryDateData | null, pattern: string) => string | null,
  relativeTime?: (date: Date) => string | null,
): string | null {
  if (data?.cmsSource !== cmsSources.PUBLISHER) return getDate(data, 'LLL d')
  const now = new Date()
  const today = getPublisherCalendarDay(now)
  const release = getPublisherTimestamp(Object.hasOwn(data, 'releaseDateTime')
    ? data.releaseDateTime
    : data.meta?.firstPublishedAt ?? data.updatedDate ?? data.publicationDate)
  if (!Object.hasOwn(data, 'displayDate') && !Object.hasOwn(data, 'releaseDateTime')) return release ? getDate(data, 'LLL d') : null
  const display = getPublisherDisplayDate(data.displayDate)
  const editorialTime = getPublisherTimestamp(data.displayDateTime)
  // A future airing or scheduled release uses the actual release timestamp.
  // A draft's old editorial date must not replace its future release label.
  const useRelease = !display || display > today || (editorialTime && editorialTime > now) || (release && release > now)
  const day = useRelease ? (release && getPublisherCalendarDay(release)) : display
  if (!day) return null
  if (release && day === today && (useRelease || day === getPublisherCalendarDay(release))) {
    return relativeTime ? relativeTime(release) : getDate({ publicationDate: release }, 'LLL d')
  }
  const date = new Date(`${day}T12:00:00Z`)
  const year = day.slice(0, 4)
  return calendarLabel.format(date) + (year === today.slice(0, 4) ? '' : `, ${year}`)
}
