import { trackClickEvent, togglePlayEpisode, refreshData } from "~/utilities/helpers"
import {
    useCurrentEpisodeHolder, useCurrentStreamStation, useAllCurrentStations, useCurrentUserProfile, useGlobalToast, useIsRefreshing
} from '~/composables/states'
import { saveRecentlyPlayed } from '~/utilities/helpers'
import { clearTimeout, setTimeout } from 'worker-timers';
// Get a list of article pages using the Aviary /pages api
export async function updateLiveStream(slug: string, save = true) {
    const config = useRuntimeConfig()
    //BFF
    try {
        const fetchData = await $fetch(`${config.public.BFF_URL}/api/whatson/${slug}`)
        const currentEpisodeHolder = useCurrentEpisodeHolder()
        currentEpisodeHolder.value = fetchData
        if (save) { saveRecentlyPlayed(currentEpisodeHolder.value, mediaTypes.LIVE) }
    } catch (error) {
        const globalToast = useGlobalToast()
        globalToast.value = {
            severity: "error",
            summary: "Sorry. We are having trouble with the live stream. Please try again later.",
            life: null,
            closable: true,
        }
        console.error('error = ', error)
    }
}

export async function updateAllLiveStreams(init = true) {
    const allCurrentStations = useAllCurrentStations()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const currentStreamStation = useCurrentStreamStation()
    const currentUserProfile = useCurrentUserProfile()
    const isRefreshing = useIsRefreshing()
    const config = useRuntimeConfig()
    isRefreshing.value = true
    // BFF
    try {
        const fetchingAll = await $fetch(`${config.public.BFF_URL}/api/streams`)
        // set all streams to the filtered array
        allCurrentStations.value = fetchingAll.filter(Boolean)

        let thisStation = null

        if (init) {
            // set initial stream with the `currentStreamStation` value in the states.ts file
            thisStation = allCurrentStations.value.find(
                (option) => {
                    const profile = typeof currentUserProfile.value.default_live_stream === 'string' ? currentUserProfile.value.default_live_stream : currentUserProfile.value.default_live_stream.station
                    // set the current stream station slug
                    currentStreamStation.value = option.slug
                    return option.station === profile
                }
            )
        } else {
            thisStation = allCurrentStations.value.find(
                (option) => {
                    return option.slug === currentStreamStation.value
                }
            )
        }
        currentEpisodeHolder.value = thisStation

    } catch (error) {
        const globalToast = useGlobalToast()
        globalToast.value = {
            severity: "error",
            summary: "Sorry. We are having trouble with the live stream. Please try again later.",
            life: 8000,
            closable: true,
        }
        console.error('error = ', error)
    } finally {
        isRefreshing.value = false
    }
}


const liveScheduleData = ref(null)
let timeout = null

// base liveStream composable
export default function useLiveStream() {
    const config = useRuntimeConfig()
    const allCurrentStations = useAllCurrentStations()
    const currentEpisodeHolder = useCurrentEpisodeHolder()
    const currentEpisode = useCurrentEpisode()
    const isLiveStream = useIsLiveStream()
    const currentStreamStation = useCurrentStreamStation()
    const togglePlayTrigger = useTogglePlayTrigger()
    const isEpisodePlaying = useIsEpisodePlaying()
    const isStreamLoading = useIsStreamLoading()
    const globalToast = useGlobalToast()

    const togglePlayHere = () => {
        if (currentEpisode.value?.id !== currentEpisodeHolder.value?.id) {
            //update slug
            currentStreamStation.value = currentEpisodeHolder.value.slug
            //currentEpisode.value = currentEpisodeHolder.value
            togglePlayEpisode(currentEpisodeHolder.value, mediaTypes.LIVE)
        } else {
            togglePlayTrigger.value = !togglePlayTrigger.value
        }
    }

    // get the time for the schedule entry
    const getTheTime = (startArg, endArg, index) => {
        const start = new Date(startArg)
        const startTime = start.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })
        const end = new Date(endArg)
        const endTime = end.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })
        return index === 0 ? `Now Until ${endTime}` : startTime
    }

    // Function to calculate the time difference between now and the target time
    function getTimeDifference(targetTime) {
        const now = new Date()
        const target = new Date(targetTime)

        // Convert both dates to UTC
        const nowUtc = Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds()
        )
        let targetUtc = Date.UTC(
            target.getUTCFullYear(),
            target.getUTCMonth(),
            target.getUTCDate(),
            target.getUTCHours(),
            target.getUTCMinutes(),
            target.getUTCSeconds()
        )

        // If the target time is in the past, calculate the time until the next occurrence
        if (nowUtc > targetUtc) {
            target.setUTCDate(target.getUTCDate() + 1)
            targetUtc = Date.UTC(
                target.getUTCFullYear(),
                target.getUTCMonth(),
                target.getUTCDate(),
                target.getUTCHours(),
                target.getUTCMinutes(),
                target.getUTCSeconds()
            )
        }

        return targetUtc - nowUtc
    }

    // Function to clear all timeouts
    const clearAllTimeout = () => {
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    // Fetch the schedule
    const fetchSchedule = async () => {
        clearAllTimeout()
        liveScheduleData.value = null
        //const localDate = new Date()
        try {
            const schedule = await $fetch(
                `${config.public.BFF_URL}/api/schedule/${currentStreamStation.value}`,
                {
                    method: "POST",
                    // params: {
                    //   localDate: String(localDate),
                    // },
                }
            )

            // add the slug to the schedule data to pass to the local notification system
            schedule.forEach((entry) => {
                entry.slug = currentStreamStation.value
            })

            liveScheduleData.value = schedule

            // init setTimeouts to refetch the schedule when the current event starts
            if (liveScheduleData.value[0]) {
                // delay plus 2 seconds to make sure the event has ended and the next one has started so when the  next fetch happens, we get the updated schedule displayed
                const delay = (await getTimeDifference(liveScheduleData.value[0].attributes.end)) + 2000
                timeout = setTimeout(refreshData, delay)
            }
        } catch (error) {
            globalToast.value = {
                severity: "error",
                summary:
                    "Sorry. We are having trouble getting the schedule. Please try again later.",
                life: null,
                closable: true,
            }
            clearAllTimeout()
            console.error("error = ", error)
        }
    }

    // targets the active station and scrolls to it
    const scrollToActiveStation = (behavior = "smooth") => {
        const activeStation = document.getElementsByClassName("activestation")
        if (activeStation[0]) {
            activeStation[0].scrollIntoView({
                behavior,
                block: "center",
                inline: "start",
            })
        }
    }

    // switch the station and track it
    const switchStation = async (station, isPLayingCheck = true) => {
        if (!isStreamLoading.value) {
            if (isEpisodePlaying.value && isPLayingCheck) {
                if (station?.slug !== currentStreamStation.value) {
                    await updateLiveStream(station.slug)
                    togglePlayTrigger.value = !togglePlayTrigger.value
                    currentEpisode.value = station
                    currentStreamStation.value = station.slug
                    isLiveStream.value = true
                }
            } else {
                if (isPLayingCheck) {
                    if (station?.slug !== currentStreamStation.value) {
                        currentEpisode.value = null
                    }
                }
                currentStreamStation.value = station.slug
                currentEpisodeHolder.value = station
            }

            trackClickEvent(
                "Click Tracking - Station Button",
                "Live Page",
                `switch station ${station?.station}`
            )
        }
    }

    // Function to get the station by slug and play it when all stations are loaded
    const getStationBySlugAndPlayIt = async (querySlug) => {
        // If stations aren't loaded, wait for them to load then continue
        if (!allCurrentStations.value) {
            await new Promise((resolve) => {
                // because the watch is in a Promise, it will not be destroyed when the component is unmounted, so we need to unwatch it
                const unwatch = watch(
                    allCurrentStations,
                    () => {
                        resolve()
                        unwatch()
                    },
                    { once: true }
                )
            })
        }

        const targetStation = allCurrentStations.value.find(
            (station) => station.slug === querySlug
        )

        if (targetStation) {
            setTimeout(() => {
                switchStation(targetStation)
                togglePlayHere()
            }, 100)
        }
    }
    return { getStationBySlugAndPlayIt, switchStation, scrollToActiveStation, fetchSchedule, clearAllTimeout, getTimeDifference, getTheTime, togglePlayHere, liveScheduleData }
}