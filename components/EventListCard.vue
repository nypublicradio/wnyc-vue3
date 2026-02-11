<script setup lang="ts">
import { computed } from "vue"
import { dynamicNavigation } from "~/utilities/helpers"
import { useEventData } from "~/composables/useEventData"

const props = defineProps({
  event: {
    type: Object,
    default: () => ({}),
  },
})

const eventData = computed(() => props.event || {})

const {
  dayNumber,
  monthLabel,
  timeLabel,
  timeLabelReadable,
  locationName,
  eventTypeBadges,
  eventCtaUrl,
} = useEventData(eventData)

const metaLineMobile = computed(() => {
  if (!timeLabelReadable.value && !locationName.value) return null
  return [timeLabelReadable.value, locationName.value].filter(Boolean).join(" | ")
})

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
          variant="card"
          class="event-list-card__cta"
          @on-click="handleEventCta"
          @click.stop
          :show-icon="false"
        >
          <template #icon></template>
        </EventButton>
        <div v-if="eventTypeBadges.length" class="event-list-card__badges">
          <VBadge
            v-for="badge in eventTypeBadges"
            :key="badge.label"
            :label="badge.label"
            :color="badge.color"
            :bg-color="badge.bg"
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
  color: var(--p-text-color);

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
  background: var(--p-surface-50);
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
  background: var(--p-text-color);
  color: var(--p-surface-0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  z-index: 2;
}

.event-list-card__date-day {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.event-list-card__date-month {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
}

.event-list-card__content {
  background: var(--p-surface-50);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.event-list-card__title {
  font-size: 20px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.event-list-card__time,
.event-list-card__location {
  margin: 0;
  font-size: 18px;
  line-height: 1.8;
  color: var(--p-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-list-card__meta {
  display: none;
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--p-text-color);
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

@include media(">=md") {
  .event-list-card__footer {
    justify-content: flex-start;
    gap: 12px;
  }

  .event-list-card__cta {
    align-self: flex-start;
  }

  .event-list-card__badges {
    margin-left: auto;
  }
}

@include media("<md") {
  .event-list-card {
    grid-template-columns: 60px minmax(0, 1fr);
    min-height: auto;
    column-gap: 20px;
    align-items: start;
  }

  .event-list-card__media {
    width: 60px;
    height: 60px;
    min-height: 60px;
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
    gap: 8px;
  }

  .event-list-card__title {
    font-size: 14px;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .event-list-card__time,
  .event-list-card__location {
    display: none;
  }

  .event-list-card__meta {
    display: block;
    font-size: 13px;
    line-height: 1.4;
  }

  .event-list-card__footer {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 8px;
  }

  .event-list-card__cta {
    align-self: flex-start;
    width: auto;
  }

  .event-list-card__badges {
    margin-left: 0;
    gap: 8px;
  }

  .event-list-card__badges :deep(.badge .content) {
    font-size: 11px;
    line-height: 14px;
    padding: 2px 8px;
  }
}
</style>
