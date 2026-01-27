<script setup lang="js">
import { useToast } from "primevue/usetoast"
import { useTopStories } from "~/composables/useTopStories"
import { formatTime, dynamicNavigation } from "~/utilities/helpers"

const { getFilteredTopStories } = useTopStories()
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()

const { data: event, status, error } = useFetch(
  `${config.public.BFF_URL}/api/events/${route.params.slug}`,
  {
    onResponse({ response }) {
      const res = response._data
      $analytics.sendPageView({
        page_title: res.title,
        page_type: "event_page",
        content_group: "on_demand_event",
        article_authors: res?.authors?.map((author) => author.name).join(","),
        article_publish_date: res.publicationDate,
        article_updated_date: res.updatedDate ? res.updatedDate : res.publicationDate,
        article_title: res.title,
      })
    },
    onResponseError() {
      toast.add({
        severity: "error",
        summary: "We are having a problem loading this event. Please try again later.",
        life: 6000,
        closable: true,
      })
    },
  }
)

const eventData = computed(() => event.value)

const { data: moreEvents } = useFetch(
  `${config.public.BFF_URL}/api/events/list?limit=4`
)

const title = computed(() => eventData.value?.title)
const theSlug = computed(
  () => eventData.value?.meta?.slug ?? route.params.slug
)

const summary = computed(
  () =>
    eventData.value?.listingSummary ||
    eventData.value?.description ||
    eventData.value?.listingTitle ||
    ""
)

const eventTags = computed(() => eventData.value?.tags ?? [])
const eventBadges = computed(() => {
  const tags = eventTags.value
  const tagLabels = tags.map((tag) => (tag.slug || tag.name || "").toLowerCase())
  const hasLiveStream = tagLabels.some((tag) =>
    ["live_stream", "live-stream", "livestream"].some((needle) => tag.includes(needle))
  )
  const hasInPerson = tagLabels.some((tag) =>
    ["in_person", "in-person", "in_studio"].some((needle) => tag.includes(needle))
  )
  return [
    { label: "WNYC EVENTS", color: "var(--p-surface-900)", bg: "var(--p-surface-300)" },
    ...(hasInPerson
      ? [{ label: "IN-PERSON", color: "var(--p-surface-0)", bg: "var(--p-green-500)" }]
      : []),
    ...(hasLiveStream
      ? [{ label: "LIVE STREAM", color: "var(--p-surface-0)", bg: "var(--p-blue-400)" }]
      : []),
  ]
})

const startDatetime = computed(() => eventData.value?.startDatetime ?? null)
const endDatetime = computed(() => eventData.value?.endDatetime ?? null)

const eventDateLabel = computed(() =>
  startDatetime.value ? formatTime(startDatetime.value, "MMM d, yyyy") : null
)
const eventDateShort = computed(() =>
  startDatetime.value ? formatTime(startDatetime.value, "MMM") : null
)
const eventDayNumber = computed(() =>
  startDatetime.value ? formatTime(startDatetime.value, "d") : null
)
const eventTimeLabel = computed(() => {
  if (!startDatetime.value) return null
  const startTime = formatTime(startDatetime.value, "h:mma")?.toLowerCase()
  if (!endDatetime.value) return startTime
  const endTime = formatTime(endDatetime.value, "h:mma")?.toLowerCase()
  return endTime ? `${startTime}–${endTime}` : startTime
})

const endDateLabel = computed(() =>
  endDatetime.value ? formatTime(endDatetime.value, "MMM d, yyyy") : null
)
const endTimeLabel = computed(() =>
  endDatetime.value ? formatTime(endDatetime.value, "h:mm a") : null
)

const eventCtaUrl = computed(
  () =>
    eventData.value?.ticketUrl ||
    eventData.value?.eventUrl ||
    eventData.value?.url ||
    null
)
const eventDateTimeLine = computed(() => {
  if (!eventDateLabel.value) return null
  return eventTimeLabel.value
    ? `${eventDateLabel.value} | ${eventTimeLabel.value}`
    : eventDateLabel.value
})

const venueName = computed(() => eventData.value?.venueName || null)
const eventLocation = computed(() => eventData.value?.eventLocation || null)
const locationName = computed(
  () => venueName.value || eventLocation.value || null
)
const mapsUrl = computed(() => {
  const query = [venueName.value, eventLocation.value].filter(Boolean).join(", ")
  if (!query) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
})

const formattedPrice = computed(() => {
  const raw = eventData.value?.price
  if (!raw) return null
  return raw.split(/,\s*/).join('\n')
})

const handleEventCta = () => {
  if (!eventCtaUrl.value) return
  navigateTo(eventCtaUrl.value, { external: true })
}

const otherEvents = computed(() => {
  const list = moreEvents.value?.events ?? []
  const currentId = eventData.value?.id
  return list.filter((item) => item?.id !== currentId).slice(0, 3)
})

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Events", route: "/events" },
  { label: title.value, route: `/events/${theSlug.value}` },
])
</script>

<template>
  <div class="event-page">
    <Html lang="en">
      <Head>
        <Title>{{ title }} | WNYC</Title>
        <Meta name="og:title" :content="`${title} | WNYC`" />
        <Meta name="twitter:title" :content="`${title} | WNYC`" />
      </Head>
    </Html>
    <section>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
    </section>
    <FetchError v-if="error" />

    <section class="event-hero  py-6">
      <template v-if="status === 'success'">
        <div class="event-hero__header">
          <div class="event-hero__datebox" v-if="eventDayNumber">
            <span class="event-hero__datebox-day">{{ eventDayNumber }}</span>
            <span class="event-hero__datebox-month">{{ eventDateShort }}</span>
          </div>
          <div class="event-hero__titlegroup">
            <h1 class="event-hero__title">{{ title }}</h1>
            <div class="event-hero__meta">
              <p class="event-hero__date" v-if="eventDateTimeLine">
                {{ eventDateTimeLine }}
              </p>
              <div v-if="eventBadges.length" class="event-hero__badges">
                <VBadge
                  v-for="badge in eventBadges"
                  :key="badge.label"
                  :label="badge.label"
                  :color="badge.color"
                  :bg-color="badge.bg"
                />
              </div>
            </div>
            <EventButton
              v-if="eventCtaUrl"
              variant="hero"
              class="event-hero__cta"
              @on-click="handleEventCta"
            >
              <template #icon></template>
            </EventButton>
          </div>
        </div>
      </template>
      <template v-else>
        <Skeleton class="mb-2" height="18px" width="120px" borderRadius="8px" />
        <Skeleton class="mb-3" height="48px" width="85%" borderRadius="16px" />
        <Skeleton class="mb-2" height="16px" width="70%" borderRadius="8px" />
        <Skeleton class="mb-2" height="16px" width="60%" borderRadius="8px" />
      </template>
    </section>

    <section class="event-body ">
      <div class="grid">
        <div class="col-12 lg:col-8">
          <div v-if="status === 'success'" class="event-body__image">
            <VImage
              v-if="eventData?.image"
              :src="eventData?.image"
              :size="{
                xxs: [316, 210],
                xs: [517, 344],
                sm: [709, 472],
                md: [885, 589],
                lg: [757, 504],
                xl: [923, 614],
                xxl: [688, 458],
              }"
              :alt="eventData?.image?.title || eventData?.title"
              class="event-body__image-frame mb-4"
            />
            <p v-if="eventData?.image?.credit" class="text-right type-fineprint">
              {{ eventData?.image?.credit }}
            </p>
          </div>
          <Skeleton
            v-else
            borderRadius="0px"
            class="event-body__image-frame mb-4 opacity-60 w-full h-auto"
          />

          <HtmlConvert
            v-if="eventData?.description && status === 'success'"
            class="event-body__description mb-4"
            :htmlContent="eventData?.description"
          />

          <VStreamfield
            v-if="eventData?.body && status === 'success'"
            class="event-body__streamfield mb-5"
            :article="eventData"
          />
          <div v-else-if="status !== 'success'" class="mb-5">
            <skeleton-text />
          </div>
        </div>
        <div class="col-12 lg:col-4">
          <aside class="event-rail">
            <div class="event-rail__section">
              <h3>Date &amp; Time</h3>
              <p v-if="eventDateTimeLine" class="event-rail__value">
                {{ eventDateTimeLine }}
              </p>
            </div>

            <div v-if="locationName" class="event-rail__section">
              <h3>Location</h3>
              <p v-if="venueName" class="event-rail__value">{{ venueName }}</p>
              <p v-if="eventLocation" class="event-rail__address">{{ eventLocation }}</p>
              <VFlexibleLink v-if="mapsUrl" :to="mapsUrl" raw>
                <span class="event-rail__link">Open in Google Maps</span>
              </VFlexibleLink>
            </div>

            <div v-if="eventData?.price" class="event-rail__section">
              <h3>Price</h3>
              <p class="event-rail__value event-rail__price">{{ formattedPrice }}</p>
            </div>

            <div v-if="eventData?.url" class="event-rail__section">
              <h3>Event URL</h3>
              <VFlexibleLink :to="eventData?.url" raw>
                <span class="event-rail__link">{{ eventData?.url }}</span>
              </VFlexibleLink>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section v-if="otherEvents.length" class="event-more ">
      <Divider class="mt-6 mb-4" />
      <h2 class="mb-3">Other Upcoming Events</h2>
      <div class="grid grid-nogutter">
        <MediaCard
          v-for="(eventItem, index) in otherEvents"
          :key="`${eventItem.id}-${index}`"
          class="col-12 mb-5"
          :data="eventItem"
          is-horizontal
          imgCol="md:w-7rem lg:w-6"
          :size="{ xs: [112, 112], lg: [332, 184] }"
          @on-click="dynamicNavigation(eventItem)"
        />
      </div>
    </section>

    <section v-if="getFilteredTopStories" class="thinContent">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="getFilteredTopStories()" />
    </section>

    <BackToTopButton />
  </div>
</template>

<style lang="scss" scoped>
.event-hero {
  .event-hero__header {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 1rem;
    row-gap: 0.5rem;
    align-items: start;
  }

  .event-hero__datebox {
    grid-column: 1;
    grid-row: 1;
    width: 60px;
    height: 60px;
    background: #101012;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  .event-hero__datebox-day {
    font-family: 'Open Sans', sans-serif;
    font-size: 26px;
    font-weight: 700;
    line-height: 35px;
    text-align: center;
  }

  .event-hero__datebox-month {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    line-height: 15px;
    text-align: center;
    text-transform: uppercase;
  }

  .event-hero__titlegroup {
    display: contents;
  }

  .event-hero__title {
    grid-column: 2;
    grid-row: 1;
    font-family: var(--font-family-header);
    font-size: 46px;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: #000000;
    margin-top: -0.1em;
  }

  .event-hero__meta {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.85rem;
    row-gap: 0.35rem;
    align-items: baseline;
  }

  .event-hero__date {
    font-weight: var(--font-weight-400);
    font-size: 18px;
    line-height: 1.8;
    margin: 0;
    white-space: nowrap;
    display: flex;
    align-items: center;
    color: #000000;
  }

  .event-hero__badges {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .event-hero__badges :deep(.badge .content) {
    font-size: 10px;
    line-height: 14px;
    padding: 1px 6px;
    letter-spacing: -0.02em;
    font-weight: var(--font-weight-600);
    border-radius: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .event-hero__summary {
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 46rem;
  }

  .event-hero__cta {
    grid-column: 1 / -1;
    grid-row: 3;
    align-self: flex-start;
    margin-top: 0.4rem;
  }

  .event-hero__cta :deep(.icon) {
    display: none;
  }

  .event-hero__cta :deep(.p-button .pi) {
    display: none;
  }

  @include media(">=md") {
    .event-hero__meta {
      flex-wrap: nowrap;
    }
  }
}

.event-body {
  .event-body__image-frame {
    width: 100%;
  }

  .event-body__description {
    font-size: 1rem;
    line-height: 1.6;
  }
}

.event-rail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  h3 {
    font-size: 1rem;
    font-weight: var(--font-weight-700);
    margin-bottom: 0.25rem;
  }

  .event-rail__value {
    margin: 0;
    font-size: 1rem;
    line-height: 1.4;
  }

  .event-rail__address {
    margin: 0;
    font-size: 1rem;
    line-height: 1.4;
    white-space: pre-line;
  }

  .event-rail__link {
    word-break: break-all;
    color: var(--link-button-color);
  }

  .event-rail__price {
    white-space: pre-line;
  }

  .event-rail__cta {
    align-self: flex-start;
  }
}
</style>
