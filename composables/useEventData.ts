import { computed, unref } from "vue"
import type { ComputedRef, Ref } from "vue"
import { formatTime } from "~/utilities/helpers"

const LIVE_STREAM_TAG_NEEDLES = ["live_stream", "live-stream", "livestream"]
const IN_PERSON_TAG_NEEDLES = ["in_person", "in-person", "in_studio"]

export const EVENT_BADGE_STYLES = {
  liveStream: {
    label: "LIVE STREAM",
    color: "var(--p-text-color)",
    bg: "var(--sea-green)",
  },
  inPerson: {
    label: "IN-PERSON",
    color: "var(--p-surface-0)",
    bg: "var(--electric-violet)",
  },
} as const

type EventLike = Record<string, unknown> | null | undefined
type EventLikeRef = EventLike | Ref<EventLike> | ComputedRef<EventLike>
type EventTag = {
  slug?: string
  name?: string
}

// Utility functions to extract and format event data for display in event cards and details pages. Designed to be flexible with different event data shapes, relying on common properties and tags to determine display values.
const matchesTag = (tags: EventTag[], needles: string[]) => {
  const tagLabels = tags.map((tag) => `${tag?.slug || tag?.name || ""}`.toLowerCase())
  return tagLabels.some((tag) => needles.some((needle) => tag.includes(needle)))
}

// Format event time range, handling cases where end time may be missing or the same as start time. Returns a formatted string like "7:00PM–8:00PM" or just "7:00PM" if no end time.
const formatEventTime = (
  startDatetime: string | null,
  endDatetime: string | null,
  formatString: string
) => {
  if (!startDatetime) return null
  const startTime = formatTime(startDatetime, formatString)
  if (!endDatetime) return startTime
  const endTime = formatTime(endDatetime, formatString)
  return endTime ? `${startTime}–${endTime}` : startTime
}

// Resolve the most appropriate URL for an event's call-to-action, checking common properties in order of priority. This allows flexibility in event data shapes while ensuring a valid URL is returned for event cards and details pages.
export const resolveEventCtaUrl = (eventData: EventLike) =>
  (eventData?.ticketUrl as string) ||
  (eventData?.eventUrl as string) ||
  (eventData?.url as string) ||
  null

// Main composable function to extract and compute all relevant event data for display. Accepts an event-like object or reference and returns computed properties for date formatting, location, tags, and CTA URL. Designed to be flexible with different event data shapes while providing consistent output for use in event cards and details pages.
export const useEventData = (eventSource: EventLikeRef) => {
  const eventData = computed(() => unref(eventSource) || {})
  const tags = computed(() => (eventData.value?.tags as EventTag[]) ?? [])

  const startDatetime = computed(
    () => (eventData.value?.startDatetime as string | null) ?? null
  )
  const endDatetime = computed(
    () => (eventData.value?.endDatetime as string | null) ?? null
  )

  const dayNumber = computed(() =>
    startDatetime.value ? formatTime(startDatetime.value, "d") : null
  )
  const monthLabel = computed(() =>
    startDatetime.value ? formatTime(startDatetime.value, "MMM") : null
  )
  const dateLabel = computed(() =>
    startDatetime.value ? formatTime(startDatetime.value, "MMM d, yyyy") : null
  )
  const timeLabel = computed(() =>
    formatEventTime(startDatetime.value, endDatetime.value, "h:mma")
  )
  const timeLabelReadable = computed(() =>
    formatEventTime(startDatetime.value, endDatetime.value, "h:mm a")
  )

  const venueName = computed(() => (eventData.value?.venueName as string) || null)
  const eventLocation = computed(
    () => (eventData.value?.eventLocation as string) || null
  )
  const locationName = computed(
    () => venueName.value || eventLocation.value || null
  )

  const hasLiveStream = computed(() =>
    matchesTag(tags.value, LIVE_STREAM_TAG_NEEDLES)
  )
  const hasInPerson = computed(() =>
    matchesTag(tags.value, IN_PERSON_TAG_NEEDLES)
  )

  const eventTypeBadges = computed(() => [
    ...(hasInPerson.value ? [EVENT_BADGE_STYLES.inPerson] : []),
    ...(hasLiveStream.value ? [EVENT_BADGE_STYLES.liveStream] : []),
  ])

  const eventCtaUrl = computed(() => resolveEventCtaUrl(eventData.value))

  return {
    startDatetime,
    endDatetime,
    dayNumber,
    monthLabel,
    dateLabel,
    timeLabel,
    timeLabelReadable,
    venueName,
    eventLocation,
    locationName,
    hasLiveStream,
    hasInPerson,
    eventTypeBadges,
    eventCtaUrl,
  }
}
