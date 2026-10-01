import { format } from 'date-fns'
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz'

const PUBLISHER_TIME_ZONE = 'America/New_York'
type Timestamp = string | Date

// Publisher timestamps without an offset are New York wall time, not viewer-local time.
function parsePublisherTimestamp (value: Timestamp): Date {
  return typeof value === 'string' && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
    ? zonedTimeToUtc(value, PUBLISHER_TIME_ZONE)
    : new Date(value instanceof Date ? value.getTime() : value)
}

export function getPublisherPublicationDate (attributes: { newsdate?: Timestamp | null, publishAt?: Timestamp | null }): Date | undefined {
  for (const value of [attributes.newsdate, attributes.publishAt]) {
    if (!value) continue
    const date = parsePublisherTimestamp(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return undefined
}

interface StoryDateData {
  cmsSource?: string
  meta?: { firstPublishedAt?: Timestamp }
  updatedDate?: Timestamp
  publicationDate?: Timestamp
}

export function getStoryDate (
  data: StoryDateData | null,
  formatString: string,
  relativeTime: (date: Timestamp) => string | null,
): string | null {
  // Saved/history records retain their display date in this metadata field.
  const date = data?.meta?.firstPublishedAt || data?.updatedDate || data?.publicationDate
  if (!date) return format(new Date(), formatString)

  const currentDate = new Date()
  const isPublisher = data?.cmsSource === 'publisher'
  const inputDate = isPublisher ? parsePublisherTimestamp(date) : new Date(date instanceof Date ? date.getTime() : date)
  const displayFormat = (value: Date, pattern: string) => isPublisher
    ? formatInTimeZone(value, PUBLISHER_TIME_ZONE, pattern)
    : format(value, pattern)

  // Use the same calendar zone for the label, year, and today comparison.
  if (displayFormat(currentDate, 'yyyy-MM-dd') === displayFormat(inputDate, 'yyyy-MM-dd')) {
    return relativeTime(isPublisher ? inputDate : date)
  }
  if (displayFormat(currentDate, 'yyyy') !== displayFormat(inputDate, 'yyyy')) {
    formatString = `${formatString}, yyyy`
  }
  return displayFormat(inputDate, formatString)
}
