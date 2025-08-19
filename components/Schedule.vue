<script setup>
import { trackClickEvent, formatDate } from "~/utilities/helpers"
import useLiveStream, { updateLiveStream } from "~/composables/data/liveStream"
import {
  useAllCurrentStations,
  useIsApp,
  useCurrentEpisodeHolder,
} from "~/composables/states"

import { scheduleLocalNotification, getEntryTitle } from "~/utilities/local-notifications"

const {
  getTheTime,
  allLiveScheduleData,
  fetchScheduleSimple,
  currentScheduleDate,
  nextDayScheduleDate,
  previousDayScheduleDate,
  setToNextDay,
  setToPreviousDay,
  isToday,
  abortScheduleFetches,
  createScheduleAbortController,
} = useLiveStream()

const allCurrentStations = useAllCurrentStations()
const isApp = useIsApp()
const currentEpisodeHolder = useCurrentEpisodeHolder()

// schedule a local notification and track it
const handleScheduleLocalNotification = async (entry) => {
  trackClickEvent(
    "Click Tracking - Schedule Notify Button",
    "Live Page",
    `Notify me about ${entry.station} - ${getEntryTitle(entry)} at ${
      entry.attributes.start
    }`
  )
  entry.station = currentEpisodeHolder.value.station
  await scheduleLocalNotification(entry)
}

watch(
  allCurrentStations,
  async () => {
    allLiveScheduleData.value = await Promise.all(
      allCurrentStations.value.map((station) => {
        return fetchScheduleSimple(station.slug, new Date())
      })
    )
  },
  { once: true }
)

watch(currentScheduleDate, async () => {
  allLiveScheduleData.value = []

  // Create new abort controller (automatically aborts any existing fetches)
  const abortController = createScheduleAbortController()

  const results = await Promise.all(
    allCurrentStations.value.map((station) => {
      return fetchScheduleSimple(
        station.slug,
        currentScheduleDate.value,
        abortController.signal
      )
    })
  )

  // Filter out null results (aborted requests)
  allLiveScheduleData.value = results.filter((result) => result !== null)
})

// handle the PDF download button
const handleScheduleDownload = async (entry) => {
  trackClickEvent(
    "Click Tracking - Schedule Download Button",
    "Live Page",
    "download schedule PDF"
  )
  // need to pull this from the CMS
  window.open(
    "https://media.wnyc.org/media/resources/2025/Mar/31/wnyc-schedule.pdf",
    "_blank"
  )
}
</script>

<template>
  <div class="schedule">
    <div class="flex flex-wrap justify-content-between align-items-end mb-4">
      <h2 class="text-5xl">Schedule</h2>
      <Button
        severity="secondary"
        variant="link"
        class="link -ml-2"
        @click="handleScheduleDownload"
        label="Weekly Schedule (pdf)"
      ></Button>
    </div>
    <Tabs value="0" scrollable v-if="allCurrentStations">
      <TabList>
        <Tab
          v-for="(entry, index) in allCurrentStations"
          :key="entry.id"
          :value="index.toString()"
          >{{ entry.station }}</Tab
        >
      </TabList>
      <hr class="w-full mt-5" />
      <div class="date-tools flex justify-content-between align-items-center my-4">
        <Button
          severity="secondary"
          variant="text"
          class="day-change-btn link -ml-3"
          @click="setToPreviousDay()"
          :label="formatDate(previousDayScheduleDate, 'EEEE')"
          icon="pi pi-chevron-left"
        ></Button>
        <div class="today flex flex-column gap-0 align-items-center text-center">
          <span class="day font-bold text-lg">{{
            formatDate(currentScheduleDate, "EEEE")
          }}</span>
          <span class="date text-sm">{{
            formatDate(currentScheduleDate, "LLLL d, yyyy")
          }}</span>
        </div>
        <Button
          severity="secondary"
          variant="text"
          iconPos="right"
          class="day-change-btn link -mr-3"
          @click="setToNextDay()"
          :label="formatDate(nextDayScheduleDate, 'EEEE')"
          icon="pi pi-chevron-right"
        ></Button>
      </div>

      <TabPanels>
        <TabPanel
          v-for="(data, index) in allLiveScheduleData"
          :key="`${data.id}-${index}`"
          :value="index.toString()"
          :class="[{ selected: index === 0 }]"
        >
          <div class="flex flex-column gap-4">
            <div
              v-for="(entry, entryIndex) in data"
              class="schedule-entry flex justify-content-between align-items-center gap-3"
              :class="[{ selected: entryIndex === 0 && isToday }]"
            >
              <div class="flex align-items-stretch">
                <div class="left my-1" />
                <div>
                  <p class="time">
                    {{
                      getTheTime(entry.attributes.start, entry.attributes.end, entryIndex)
                    }}
                  </p>
                  <h2 class="title">
                    {{ getEntryTitle(entry) }}
                  </h2>
                </div>
              </div>
              <Button
                v-if="isApp && entryIndex > 0"
                severity="secondary"
                text
                plain
                rounded
                class="flex-none"
                aria-label="set notification"
                @click="handleScheduleLocalNotification(entry)"
              >
                <template #icon>
                  <NotificationIcon :entry="entry" />
                </template>
              </Button>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <div v-else class="skeleton mt-5">
      <div class="flex gap-6 mb-5">
        <Skeleton
          v-for="i in 4"
          :key="`tabs-skeleton-${i}`"
          height="20px"
          width="150px"
          borderRadius="4px"
        />
      </div>
      <hr />
      <div class="flex justify-content-between mt-5">
        <Skeleton height="20px" width="110px" borderRadius="4px" />
        <div class="flex flex-column gap-2">
          <Skeleton height="16px" width="110px" borderRadius="4px" />
          <Skeleton height="10px" width="110px" borderRadius="4px" />
        </div>
        <Skeleton height="20px" width="110px" borderRadius="4px" />
      </div>
    </div>
    <div v-if="!allLiveScheduleData.length > 0" class="skeleton -mt-2">
      <div
        v-for="i in 10"
        :key="`schedule-skeleton-${i}`"
        class="flex align-items-center justify-content-between pr-2 mb-5"
      >
        <div class="flex gap-3">
          <Skeleton
            height="30px"
            width="4px"
            borderRadius="2px"
            :class="[{ 'opacity-0': i > 0 }]"
          />
          <div class="flex flex-column gap-1">
            <Skeleton class="opacity-50" height="12px" width="64px" borderRadius="4px" />
            <Skeleton height="14px" width="174px" borderRadius="4px" />
          </div>
        </div>
        <Skeleton
          :class="[{ 'opacity-0': i < 1 }]"
          height="26px"
          width="26px"
          borderRadius="15px"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
html {
  &.style-mode-dark {
    .schedule {
      .schedule-entry {
        &.selected {
          background-color: #ffffff1a;
          padding: 0.75rem 0.5rem 0.75rem 0;
          border-radius: 8px;
          .left {
            border: none;
          }
        }
      }
    }
  }
  .schedule {
    .date-tools {
      .day-change-btn {
        .p-button-label {
          @include media("<sm") {
            display: none;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.schedule {
  .schedule-entry {
    .left {
      border: 2px solid transparent;
      border-radius: 8px;
      margin-right: 1rem;
    }
    &.selected {
      .left {
        border-color: var(--p-primary-500);
      }
    }
    .follow-icon {
      width: 28px;
      height: 28px;
    }
  }
}
</style>
