import { zonedTimeToUtc } from 'date-fns-tz'

export const PUBLISHER_TIME_ZONE = 'America/New_York'

const calendar = new Intl.DateTimeFormat('en-US', {
  timeZone: PUBLISHER_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', era: 'short',
})

export function getPublisherCalendarDay (date: Date): string {
  const parts = calendar.formatToParts(date)
  const part = (type: string) => parts.find(value => value.type === type)?.value ?? ''
  const year = Number(part('year'))
  const isoYear = part('era') === 'BC' ? 1 - year : year
  return `${String(isoYear).padStart(4, '0')}-${part('month')}-${part('day')}`
}

// Publisher stores naive Eastern wall times; newsdate's serializer attaches its
// Eastern offset, while publish-at's DateTimeField can omit that offset.
export function getPublisherTimestamp (value?: string | Date | null): Date | undefined {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return undefined
    return value.toISOString().slice(0, 10) === '1900-01-01' || getPublisherCalendarDay(value) === '1900-01-01' ? undefined : value
  }
  if (typeof value !== 'string') return undefined
  // Saved newscast metadata can use an explicit RFC/GMT timestamp.
  if (/^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value)) {
    return getPublisherTimestamp(new Date(value))
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ]([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d+)?)?(Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)?)?$/.exec(value)
  if (!match) return undefined
  const [, year, month, day, , , , zone] = match
  const calendarDate = `${year}-${month}-${day}`
  const calendar = new Date(`${calendarDate}T12:00:00Z`)
  if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== calendarDate) return undefined
  if (calendarDate === '1900-01-01' || year === '0000') return undefined
  const date = zone ? new Date(value) : zonedTimeToUtc(value, PUBLISHER_TIME_ZONE)
  return Number.isFinite(date.getTime()) ? date : undefined
}

export function getPublisherDisplayDate (value?: string | null): string | undefined {
  const date = getPublisherTimestamp(value)
  return date ? getPublisherCalendarDay(date) : undefined
}
