<script setup lang="ts">
import { computed } from "vue"
import { dynamicNavigation, formatTime } from "~/utilities/helpers"

const props = defineProps({
  event: {
    type: Object,
    default: () => ({}),
  },
})

const eventData = computed(() => props.event || {})

const startDatetime = computed(() => eventData.value?.startDatetime ?? null)
const endDatetime = computed(() => eventData.value?.endDatetime ?? null)

const dayNumber = computed(() =>
  startDatetime.value ? formatTime(startDatetime.value, "d") : null
)
const monthLabel = computed(() =>
  startDatetime.value ? formatTime(startDatetime.value, "MMM") : null
)

const timeLabel = computed(() => {
  if (!startDatetime.value) return null
  const startTime = formatTime(startDatetime.value, "h:mma")
  if (!endDatetime.value) return startTime
  const endTime = formatTime(endDatetime.value, "h:mma")
  return endTime ? `${startTime}–${endTime}` : startTime
})

const timeLabelReadable = computed(() => {
  if (!startDatetime.value) return null
  const startTime = formatTime(startDatetime.value, "h:mm a")
  if (!endDatetime.value) return startTime
  const endTime = formatTime(endDatetime.value, "h:mm a")
  return endTime ? `${startTime}–${endTime}` : startTime
})

const venueName = computed(() => eventData.value?.venueName || null)
const eventLocation = computed(() => eventData.value?.eventLocation || null)
const locationName = computed(() => venueName.value || eventLocation.value || null)

const metaLineMobile = computed(() => {
  if (!timeLabelReadable.value && !locationName.value) return null
  return [timeLabelReadable.value, locationName.value].filter(Boolean).join(" | ")
})

const eventBadges = computed(() => {
  const tags = eventData.value?.tags ?? []
  const tagLabels = tags.map((tag: any) => (tag.slug || tag.name || "").toLowerCase())
  const hasLiveStream = tagLabels.some((tag) =>
    ["live_stream", "live-stream", "livestream"].some((needle) => tag.includes(needle))
  )
  const hasInPerson = tagLabels.some((tag) =>
    ["in_person", "in-person", "in_studio"].some((needle) => tag.includes(needle))
  )
  return {
    hasLiveStream,
    hasInPerson,
  }
})

const eventCtaUrl = computed(
  () =>
    eventData.value?.ticketUrl ||
    eventData.value?.eventUrl ||
    eventData.value?.url ||
    null
)

const handleCardClick = () => {
  if (!eventData.value) return
  dynamicNavigation(eventData.value)
}

const handleEventCta = () => {
  if (eventCtaUrl.value) {
    navigateTo(eventCtaUrl.value, { external: true })
    return
  }
  if (!eventData.value) return
  dynamicNavigation(eventData.value)
}
</script>

<template>
  <div
    class="event-list-card"
    role="button"
    tabindex="0"
    @click="handleCardClick"
    @keypress.enter.space="handleCardClick"
  >
    <div class="event-list-card__media">
      <div class="event-list-card__date" v-if="dayNumber">
        <span class="event-list-card__date-day">{{ dayNumber }}</span>
        <span class="event-list-card__date-month">{{ monthLabel }}</span>
      </div>
      <div class="event-list-card__image" v-if="eventData?.image">
        <VImage
          :src="eventData?.image"
          :alt="eventData?.image?.title || eventData?.title"
          :size="{ xs: [116, 116], lg: [203, 203] }"
        />
      </div>
    </div>
    <div class="event-list-card__content">
      <h2 class="event-list-card__title">{{ eventData?.title }}</h2>
      <p class="event-list-card__time" v-if="timeLabel">{{ timeLabel }}</p>
      <p class="event-list-card__location" v-if="locationName">
        {{ locationName }}
      </p>
      <p class="event-list-card__meta" v-if="metaLineMobile">
        {{ metaLineMobile }}
      </p>
      <div class="event-list-card__footer">
        <EventButton
          class="event-list-card__cta"
          @on-click="handleEventCta"
          @click.stop
          :show-icon="false"
        >
          <template #icon></template>
        </EventButton>
        <div
          v-if="eventBadges.hasLiveStream || eventBadges.hasInPerson"
          class="event-list-card__badges"
        >
          <VBadge
            v-if="eventBadges.hasLiveStream"
            label="LIVE STREAM"
            color="#101012"
            bg-color="#71c171"
          />
          <VBadge
            v-if="eventBadges.hasInPerson"
            label="IN-PERSON"
            color="#ffffff"
            bg-color="#9747ff"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.event-list-card {
  display: grid;
  grid-template-columns: 203px minmax(0, 1fr);
  min-height: 203px;
  cursor: pointer;
  color: #101012;

  &:focus-visible {
    outline: var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);
    outline-offset: 4px;
  }
}

.event-list-card__media {
  position: relative;
  width: 203px;
  min-height: 203px;
  overflow: hidden;
  background: #f5f5f5;
}

.event-list-card__image {
  width: 100%;
  height: 100%;

  :deep(.v-image-wrapper),
  :deep(.v-image) {
    width: 100%;
    height: 100%;
  }

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.event-list-card__date {
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 60px;
  background: #101012;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  z-index: 2;
}

.event-list-card__date-day {
  font-family: "Open Sans", sans-serif;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.event-list-card__date-month {
  font-family: "Open Sans", sans-serif;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
}

.event-list-card__content {
  background: #f5f5f5;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.event-list-card__title {
  margin: 0;
  font-family: var(--font-family-header);
  font-size: 20px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #101012;
}

.event-list-card__time,
.event-list-card__location {
  margin: 0;
  font-size: 18px;
  line-height: 1.8;
  color: #101012;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-list-card__meta {
  display: none;
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #101012;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-list-card__footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.event-list-card__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.event-list-card__badges :deep(.badge .content) {
  font-size: 10px;
  line-height: 14px;
  letter-spacing: -0.02em;
  padding: 1px 6px;
}

.event-list-card__cta :deep(.p-button) {
  background: #ffffff !important;
  border: 1px solid #eaeaea !important;
  color: #101012 !important;
  min-height: 28px;
  padding: 4px 16px;
  box-shadow: none;
  transition: background var(--p-transition-duration), border-color var(--p-transition-duration);

  &:hover {
    background: #f5f5f5 !important;
    border-color: #d0d0d0 !important;
  }
}

.event-list-card__cta :deep(.content) {
  font-size: 14px;
  line-height: 20px;
  color: #101012;
}

.event-list-card__cta :deep(.icon) {
  display: none;
}

  @include media("<md") {
  .event-list-card {
    grid-template-columns: 60px minmax(0, 1fr);
    min-height: auto;
    column-gap: 16px;
    align-items: start;
  }

  .event-list-card__media {
    width: 60px;
    height: 60px;
    background: transparent;
  }

  .event-list-card__image {
    display: none;
  }

  .event-list-card__date {
    position: relative;
    width: 60px;
    height: 60px;
  }

  .event-list-card__content {
    background: transparent;
    padding: 0;
    border-radius: 0;
    gap: 6px;
  }

  .event-list-card__title {
    font-size: 14px;
    letter-spacing: -0.02em;
  }

  .event-list-card__time,
  .event-list-card__location {
    display: none;
  }

  .event-list-card__meta {
    display: block;
  }

  .event-list-card__footer {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 8px;
  }

  .event-list-card__cta {
    align-self: center;
  }

  .event-list-card__cta :deep(.p-button) {
    min-width: 160px;
    justify-content: center;
  }
}
</style>
