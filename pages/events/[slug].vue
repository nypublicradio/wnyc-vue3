<script setup lang="js">
import { useToast } from "primevue/usetoast"
import { useTopStories } from "~/composables/useTopStories"
import { EVENT_BADGE_STYLES, useEventData } from "~/composables/useEventData"

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

const eventData = computed(() => event.value || {})

const { data: moreEvents } = useFetch(
  `${config.public.BFF_URL}/api/events/list?limit=4`
)

const title = computed(() => eventData.value?.title)
const {
  dayNumber: eventDayNumber,
  monthLabel: eventDateShort,
  dateLabel: eventDateLabel,
  timeLabel,
  venueName,
  eventLocation,
  locationName,
  hasLiveStream,
  hasInPerson,
  eventCtaUrl,
} = useEventData(eventData)

const eventTimeLabel = computed(() => timeLabel.value?.toLowerCase() ?? null)
const eventBadges = computed(() => [
  { label: "WNYC EVENTS", color: "var(--p-text-color)", bg: "var(--p-surface-200)" },
  ...(hasInPerson.value ? [EVENT_BADGE_STYLES.inPerson] : []),
  ...(hasLiveStream.value ? [EVENT_BADGE_STYLES.liveStream] : []),
])

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
  { label: title.value || "Event", route: route.path },
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

    <section class="event-hero">
      <div class="event-section">
        <template v-if="status === 'success'">
          <div class="event-hero__layout">
            <div class="event-hero__header">
              <div class="event-hero__datebox" v-if="eventDayNumber">
                <span class="event-hero__datebox-day">{{ eventDayNumber }}</span>
                <span class="event-hero__datebox-month">{{ eventDateShort }}</span>
              </div>
              <div class="event-hero__titlegroup">
                <h1
                  class="event-hero__title text-2xl md:text-4xl -mt-1 md:mt-0 line-height-1 md:line-height-2"
                >
                  {{ title }}
                </h1>
                <div class="event-hero__meta">
                  <PipeData
                    v-if="eventDateLabel"
                    class="event-hero__date text-sm md:text-base"
                    :hide-pipe="!eventTimeLabel"
                  >
                    <template #left>{{ eventDateLabel }}</template>
                    <template #right>{{ eventTimeLabel }}</template>
                  </PipeData>
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
                  :show-icon="false"
                >
                  <template #icon></template>
                </EventButton>
              </div>
            </div>
            <div class="event-hero__rail-spacer" aria-hidden="true"></div>
          </div>
        </template>
        <template v-else>
          <Skeleton class="mb-2" height="18px" width="120px" borderRadius="8px" />
          <Skeleton class="mb-3" height="48px" width="85%" borderRadius="16px" />
          <Skeleton class="mb-2" height="16px" width="70%" borderRadius="8px" />
          <Skeleton class="mb-2" height="16px" width="60%" borderRadius="8px" />
        </template>
      </div>
    </section>

    <section class="event-body">
      <div class="event-section">
        <div class="event-body__layout">
          <div class="event-body__content">
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
              <p v-if="eventData?.image?.credit" class="event-body__credit">
                {{ eventData?.image?.credit }}
              </p>
            </div>
            <Skeleton
              v-else
              borderRadius="0px"
              class="event-body__image-frame mb-4 opacity-60 w-full h-auto"
            />

            <VStreamfield
              v-if="eventData?.body && status === 'success'"
              class="event-body__streamfield mb-5"
              :article="eventData"
              :showDonation="false"
            />
            <HtmlConvert
              v-else-if="eventData?.description && status === 'success'"
              class="event-body__description mb-4"
              :htmlContent="eventData?.description"
            />
            <div v-else-if="status !== 'success'" class="mb-5">
              <skeleton-text />
            </div>
          </div>
          <aside class="event-rail">
            <div class="event-rail__section">
              <h3>Date &amp; Time</h3>
              <PipeData
                v-if="eventDateLabel"
                class="event-rail__value"
                :hide-pipe="!eventTimeLabel"
              >
                <template #left>{{ eventDateLabel }}</template>
                <template #right>{{ eventTimeLabel }}</template>
              </PipeData>
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

            <div class="event-rail__ad">
              <story-htlAd
                layout="rectangle"
                slotClass="htlad-wnyc_event_detail_rectangle"
                fineprint="WNYC is funded by sponsors and member donations"
              />
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

    <section v-if="otherEvents.length" class="event-more">
      <div class="event-section">
        <Divider class="event-more__divider" />
        <h2 class="event-more__title">Other Upcoming Events</h2>
        <div class="event-more__list">
          <EventListCard
            v-for="(eventItem, index) in otherEvents"
            :key="`${eventItem.id}-${index}`"
            :event="eventItem"
          />
        </div>
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
.event-page {
  --event-main-col-width: 672px;
  --event-rail-col-width: 20rem;
  --event-grid-gap: 32px;

  .event-section {
    padding: 0 32px;
  }
}

.event-hero {
  padding-top: 32px;
  padding-bottom: 24px;

  .event-hero__layout {
    display: grid;
    grid-template-columns: minmax(0, var(--event-main-col-width)) var(--event-rail-col-width);
    column-gap: var(--event-grid-gap);
    align-items: start;
    justify-content: end;
  }

  .event-hero__rail-spacer {
    grid-column: 2;
    width: 100%;
  }

  .event-hero__header {
    grid-column: 1;
    width: 100%;
    max-width: none;
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 1.25rem;
    row-gap: 0.75rem;
    align-items: start;
  }

  .event-hero__datebox {
    grid-column: 1;
    grid-row: 1;
    width: 48px;
    height: 48px;
    background: var(--p-text-color);
    color: var(--p-surface-0);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  .event-hero__datebox-day {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.1;
    text-align: center;
  }

  .event-hero__datebox-month {
    font-size: 10px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;
  }

  .event-hero__titlegroup {
    display: contents;
  }

  .event-hero__title {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .event-hero__meta {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    flex-wrap: nowrap;
    column-gap: 0.5rem;
    row-gap: 0;
    align-items: baseline;
    justify-content: flex-start;
  }

  .event-hero__date {
    line-height: 180%;
    white-space: nowrap;
    display: flex;
    align-items: center;
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
    border-radius: 3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .event-hero__cta {
    grid-column: 1 / -1;
    grid-row: 3;
    align-self: flex-start;
    margin-top: 0.4rem;
  }

}

.event-body {
  padding-bottom: 24px;

  .event-body__layout {
    display: grid;
    grid-template-columns: minmax(0, var(--event-main-col-width)) var(--event-rail-col-width);
    column-gap: var(--event-grid-gap);
    align-items: start;
    justify-content: end;
  }

  .event-body__content {
    grid-column: 1;
    min-width: 0;
  }

  .event-body__image-frame {
    width: 100%;
    border-radius: 0;
    overflow: hidden;
  }

  .event-body__description,
  .event-body__streamfield :deep(.streamfield-paragraph > *),
  .event-body__streamfield :deep(.html-convert p),
  .event-body__description :deep(.html-convert p) {
    @include longFormBodyTypography();
  }

  .event-body__credit {
    margin: 6px 0 0;
    text-align: right;
    font-size: 12px;
    color: var(--p-surface-600);
  }
}

.event-rail {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h3 {
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .event-rail__value {
    font-size: 0.95rem;
  }

  .event-rail__address {
    font-size: 0.95rem;
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

  .event-rail__ad {
    max-width: 300px;
  }
}

.event-more {
  padding-bottom: 32px;

  .event-more__divider {
    margin: 32px 0 20px;
  }

  .event-more__title {
    margin: 0 0 24px;
    font-size: 24px;
    letter-spacing: -0.02em;
  }

  .event-more__list {
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 672px;
  }
}

@include media(">=xl") {
  .event-hero,
  .event-body {
    padding-left: 0;
    padding-right: 0;

    .event-section {
      padding-left: 0;
      padding-right: 0;
    }
  }

  .event-more {
    padding-left: 0;
    padding-right: 0;

    .event-section {
      padding-left: 0;
      padding-right: 0;
      display: grid;
      grid-template-columns: var(--event-rail-col-width) minmax(0, var(--event-main-col-width)) var(--event-rail-col-width);
      column-gap: var(--event-grid-gap);
      align-items: start;
    }

    .event-more__divider,
    .event-more__title,
    .event-more__list {
      grid-column: 2;
    }

    .event-more__list {
      width: 100%;
      max-width: none;
    }
  }

  .event-hero {
    .event-hero__layout {
      grid-template-columns: var(--event-rail-col-width) minmax(0, var(--event-main-col-width)) var(--event-rail-col-width);
    }

    .event-hero__header {
      grid-column: 2;
    }

    .event-hero__rail-spacer {
      grid-column: 3;
    }
  }

  .event-body {
    .event-body__layout {
      grid-template-columns: var(--event-rail-col-width) minmax(0, var(--event-main-col-width)) var(--event-rail-col-width);
    }

    .event-body__content {
      grid-column: 2;
    }
  }

  .event-rail {
    grid-column: 3;
  }
}

@include media("<lg") {
  .event-body {
    .event-body__layout {
      grid-template-columns: 1fr;
      row-gap: 28px;
    }

    .event-body__content {
      grid-column: 1;
    }
  }

  .event-hero {
    .event-hero__layout {
      grid-template-columns: 1fr;
    }

    .event-hero__header {
      grid-column: 1;
    }

    .event-hero__rail-spacer {
      display: none;
    }
  }

  .event-rail {
    grid-column: 1;
  }
}

@include media("<md") {
  .event-page {
    .event-section {
      padding: 0 20px;
    }
  }

  .event-hero {
    padding-top: 20px;
    padding-bottom: 16px;

    .event-hero__meta {
      flex-wrap: wrap;
      row-gap: 0.35rem;
    }
  }

  .event-body {
    padding-bottom: 16px;
  }

  .event-rail {
    gap: 1rem;

    h3 {
      font-size: 0.85rem;
    }

    .event-rail__value,
    .event-rail__address {
      font-size: 0.85rem;
    }
  }

  .event-more {
    .event-more__title {
      font-size: 18px;
      margin-bottom: 16px;
    }

    .event-more__list {
      gap: 24px;
      max-width: none;
    }
  }

  .event-body {
    .event-body__image-frame {
      margin-left: -20px;
      margin-right: -20px;
      width: calc(100% + 40px);
    }
  }
}
</style>
