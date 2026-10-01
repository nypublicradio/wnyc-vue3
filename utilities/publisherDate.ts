const publisherCalendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
})

export function getPublisherCalendarDay (date: Date): string {
  const parts = publisherCalendar.formatToParts(date)
  const part = (type: string) => parts.find(value => value.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

// A date-only value deliberately carries no publication time. Publisher also sends
// offsetless archive dates; their calendar components are already Eastern time.
export function getPublisherDisplayDate (value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ]([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d+)?)?(Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)?)?$/.exec(value)
  if (!match) return undefined
  const [, year, month, day, , , , zone] = match
  const calendarDate = `${year}-${month}-${day}`
  const date = new Date(`${calendarDate}T12:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== calendarDate) return undefined
  if (calendarDate === '1900-01-01') return undefined
  if (!zone) return calendarDate
  const instant = new Date(value)
  if (!Number.isFinite(instant.getTime())) return undefined
  return getPublisherCalendarDay(instant)
}
