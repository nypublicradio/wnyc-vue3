<script setup>
import { trackClickEvent, formatDate } from "~/utilities/helpers"
import useLiveStream from "~/composables/data/liveStream"
import {
  useAllCurrentStations,
  useIsApp,
  useCurrentEpisodeHolder,
} from "~/composables/states"
import { useDebounceFn } from "@vueuse/core"

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
        return fetchScheduleSimple(station, new Date())
      })
    )
  },
  { once: true }
)

// Fetch all schedule data for all stations
const getAllScheduleData = async () => {
  // Don't fetch if stations aren't loaded yet
  if (!allCurrentStations.value || allCurrentStations.value.length === 0) {
    return
  }

  allLiveScheduleData.value = []

  // Create new abort controller (automatically aborts any existing fetches)
  const abortController = createScheduleAbortController()

  try {
    const results = await Promise.all(
      allCurrentStations.value.map((station) => {
        return fetchScheduleSimple(
          station,
          currentScheduleDate.value,
          abortController.signal
        )
      })
    )

    // Filter out null results (aborted requests)
    allLiveScheduleData.value = results.filter((result) => result !== null)
  } catch (error) {
    console.error("Error in getAllScheduleData:", error)
  }
}

// Debounce the schedule data fetching to prevent rapid successive calls
const debouncedGetAllScheduleData = useDebounceFn(getAllScheduleData, 300)

watch(currentScheduleDate, () => {
  allLiveScheduleData.value.length = 0
  debouncedGetAllScheduleData()
})

onMounted(() => {
  // Wait for allCurrentStations to be populated before fetching schedule data
  const stopWatcher = watchEffect(() => {
    if (allCurrentStations.value && allCurrentStations.value.length > 0) {
      getAllScheduleData()
      stopWatcher() // Stop watching once data is available
    }
  })
})

// handle the PDF download button
const handleScheduleDownload = () => {
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

// handles the click on the bottom fixed footer
const moreFromClick = (entry) => {
  const title = entry.attributes.parentTitle
  const slug = entry.slug
  trackClickEvent(
    `Click Tracking - Schedule current show More from ${title}`,
    "Schedule",
    title
  )
  navigateTo(`/browse/shows/${slug}`)
}

// determine if the entry is the current episode and if the first entry should be featured (New Sounds (q2) and the holiday channel are excluded)
const handleCurrentEpisode = (entry, index) => {
  const badSlugs = ["q2", "wqxr-holiday-channel-on-wnyc"]
  return isToday.value && index === 0 && !badSlugs.includes(entry.slug)
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
            <!-- <pre class="overflow-hidden">{{ currentEpisodeHolder }}</pre> -->
            <div
              v-for="(entry, entryIndex) in data"
              :key="entry.id"
              class="schedule-entry flex justify-content-between align-items-stretch gap-3 style-mode-light light-mode"
              :class="
                handleCurrentEpisode(entry, entryIndex)
                  ? 'selected -ml-3 -mr-3 xl:mr-0'
                  : ''
              "
            >
              <div class="active-content flex flex-column justify-content-between">
                <div>
                  <p class="time">
                    {{
                      getTheTime(entry.attributes.start, entry.attributes.end, entryIndex)
                    }}
                  </p>
                  <h2 class="title truncate t2lines">
                    {{ getEntryTitle(entry) }}
                  </h2>
                  <HtmlConvert
                    v-if="
                      entry.station.episodeBody && handleCurrentEpisode(entry, entryIndex)
                    "
                    :htmlContent="entry.station.episodeBody"
                    class="desc truncate t3lines mt-1"
                    no-blocks
                  />
                </div>
                <div v-if="handleCurrentEpisode(entry, entryIndex)">
                  <!-- <pre>{{ entry }}</pre> -->
                  <Button
                    severity="secondary"
                    variant="link"
                    class="more-from link text-left text-xs md:text-base"
                    @click="moreFromClick(entry)"
                    :label="`More from ${entry.attributes.parentTitle}`"
                  />
                </div>
              </div>
              <div
                v-if="
                  handleCurrentEpisode(entry, entryIndex) &&
                  entry.station.onTodaysShowImageTemplate
                "
                class="hidden md:block"
              >
                <VImage
                  :src="{
                    template: entry.station.onTodaysShowImageTemplate,
                  }"
                  :alt="
                    entry.station.onTodaysShowImageAltText || 'on today\'s show image'
                  "
                  :size="{ md: [320, 213] }"
                  class="flex-none w-20rem"
                  :srcset="[2]"
                />
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
      <div class="flex justify-content-between my-6">
        <Skeleton height="20px" width="110px" borderRadius="4px" />
        <div class="flex flex-column gap-2">
          <Skeleton height="16px" width="110px" borderRadius="4px" />
          <Skeleton height="10px" width="110px" borderRadius="4px" />
        </div>
        <Skeleton height="20px" width="110px" borderRadius="4px" />
      </div>
    </div>
    <div
      v-if="!allLiveScheduleData.length > 0"
      class="skeleton flex flex-column gap-5 -mt-3"
    >
      <Skeleton
        v-if="isToday"
        height="213px"
        width="100%"
        borderRadius="10px"
        class="-ml-3 -mr-3 xl:mr-0 hidden md:block"
      />
      <div
        v-for="i in 9"
        :key="`schedule-skeleton-${i}`"
        class="flex align-items-center justify-content-between pr-2"
      >
        <div class="flex gap-3">
          <div class="flex flex-column gap-2">
            <Skeleton class="opacity-50" height="14px" width="64px" borderRadius="4px" />
            <Skeleton height="22px" width="174px" borderRadius="4px" />
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
  // &.style-mode-dark {
  //   .schedule {
  //     .schedule-entry {
  //       &.selected {
  //         background-color: #ffffff1a;
  //         padding: 0.75rem 0.5rem 0.75rem 0;
  //         border-radius: 8px;
  //         .left {
  //           border: none;
  //         }
  //       }
  //     }
  //   }
  // }
  .schedule {
    margin-bottom: 50px;
    .schedule-entry {
      .date-tools {
        .day-change-btn {
          .p-button-label {
            @include media("<sm") {
              display: none;
            }
          }
        }
      }
      &.selected {
        *:not(.p-button .p-button-label) {
          color: var(--p-surface-950) !important;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.schedule {
  .schedule-entry {
    position: relative;
    // .left {
    //   border: 2px solid transparent;
    //   border-radius: 8px;
    //   margin-right: 1rem;
    // }
    &:before {
      content: "";
      border: 2px solid transparent;
      border-color: var(--p-primary-500);
      border-radius: 8px;
      margin-right: 1rem;
      position: absolute;
      height: 100%;
      display: none;
    }

    .active-content {
      min-height: 0; // Allow flex shrinking
    }
    .more-from {
      margin-left: -0.8rem;
      display: none;
    }
    &.selected {
      &:before {
        display: block;
      }
      .more-from {
        display: block;
      }
      .active-content {
        padding: 0rem 1rem 0rem 1rem;
      }
      @include media(">=md") {
        background-color: var(--p-surface-50);
        border-radius: 10px;
        overflow: hidden;
        .active-content {
          padding: 1rem 1rem 0.5rem 1rem;
        }
        &:before {
          display: none;
        }
      }
      @include media("<md") {
        .more-from,
        .desc {
          display: none;
        }
      }
    }
    .follow-icon {
      width: 28px;
      height: 28px;
    }
  }
}
</style>
