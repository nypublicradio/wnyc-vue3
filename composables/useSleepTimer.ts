import { computed } from 'vue'
import { RemoteStreamer } from "@nypublicradio/capacitor-remote-streamer"
import { localUserProfileKey } from "~/composables/globals"
import { trackClickEvent } from "~/utilities/helpers"
import {
    useIsEpisodePlaying,
    useTogglePlayTrigger,
    useSleepTimerRunning,
    useSleepTimerPaused,
    useSleepTimerSideBar,
    useSleepTimerCurrentTime,
    useSleepTimerInterval,
    useSleepTimerSelectedTime,
    useGlobalToast,
    useCurrentUserProfile,
    useCurrentEpisode,
} from "~/composables/states"
import { Preferences } from "@capacitor/preferences"
import { clearInterval, setInterval } from 'worker-timers';

// composable to handle the sleep timer
export default function useSleepTimer() {
    const currentEpisode = useCurrentEpisode()
    const isEpisodePlaying = useIsEpisodePlaying()
    const togglePlayTrigger = useTogglePlayTrigger()
    const sleepTimerRunning = useSleepTimerRunning()
    const sleepTimerPaused = useSleepTimerPaused()
    const sleepTimerSideBar = useSleepTimerSideBar()
    const sleepTimerCurrentTime = useSleepTimerCurrentTime()
    const sleepTimerInterval = useSleepTimerInterval()
    const sleepTimerSelectedTime = useSleepTimerSelectedTime()
    const currentUserProfile = useCurrentUserProfile()
    const globalToast = useGlobalToast()

    const chunck = 60
    const chunckedTime = ref(0)

    // Formatted time
    const formattedTime = computed(() => {
        const hours = Math.floor(sleepTimerCurrentTime.value / 3600)
        const minutes = Math.floor((sleepTimerCurrentTime.value % 3600) / 60)
        const seconds = sleepTimerCurrentTime.value % 60
        const cHours = hours > 0 ? `${hours}:` : ""
        return `${cHours}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    })

    // Clear the interval
    function clearTheInterval() {
        clearInterval(sleepTimerInterval.value)
        sleepTimerInterval.value = null
        chunckedTime.value = 0
        //console.log("----------------------------Clear The Interval")
    }

    // Start the timer
    function startTimer(repeat = false) {
        //console.log("----------------------------Start The Interval")
        sleepTimerRunning.value = true
        if (!sleepTimerPaused.value && !repeat) {
            globalToast.value = {
                severity: "info",
                summary: `Sleep timer started for ${sleepTimerSelectedTime.value.label}`,
                life: 3000,
                closable: true,
            }
        }
        sleepTimerPaused.value = false
        sleepTimerInterval.value = setInterval(() => {
            if (chunckedTime.value < chunck) {
                chunckedTime.value++
                if (sleepTimerCurrentTime.value > 0) {
                    sleepTimerCurrentTime.value--
                } else {
                    clearTheInterval()
                    onTimeEnd() // Function to call when time ends
                }
            } else {
                // restart new interval
                clearTheInterval()
                startTimer(true)
            }
        }, 1000)
    }

    // Pause the timer
    function pauseTimer() {
        sleepTimerPaused.value = true
        clearTheInterval()
    }

    // Reset the timer
    function resetTimer() {
        clearTheInterval()
        sleepTimerCurrentTime.value = sleepTimerSelectedTime.value.value
        sleepTimerRunning.value = false
        sleepTimerSideBar.value = false
    }

    // Function to call when time ends
    function onTimeEnd() {

        sleepTimerSideBar.value = false
        sleepTimerRunning.value = false
        trackClickEvent(
            "Click Tracking - Sleep timer event",
            "Sleep Timer - Ended",
            sleepTimerSelectedTime.value.label
        )

        // slowly decrease volume to 0
        const duration = 7000 // 10 seconds
        const interval = 100 // 100 milliseconds
        const steps = duration / interval
        const volumeStep = 1 / steps

        let currentVolume = 1

        globalToast.value = {
            severity: "success",
            summary: "Sleep Timer Ended. Audio fading out...",
            life: duration,
        }

        const volumeInterval = setInterval(() => {
            currentVolume -= volumeStep
            if (currentVolume < 0) { currentVolume = 0 }
            RemoteStreamer.setVolume({ volume: currentVolume })

            if (currentVolume <= 0) {
                clearInterval(volumeInterval)

                // pause the audio
                if (isEpisodePlaying.value) {
                    togglePlayTrigger.value = !togglePlayTrigger.value
                }

                // return the volume to 1
                RemoteStreamer.setVolume({ volume: 1 })

                //notify the user
                globalToast.value = {
                    severity: "success",
                    summary: "Sleep Timer Ended. Audio paused.",
                }
            }
        }, interval)

        // if (isEpisodePlaying.value) {
        //     togglePlayTrigger.value = !togglePlayTrigger.value
        // }
        // sleepTimerSideBar.value = false
        // sleepTimerRunning.value = false
        // trackClickEvent(
        //     "Click Tracking - Sleep timer event",
        //     "Sleep Timer - Ended",
        //     sleepTimerSelectedTime.value.label
        // )
        // globalToast.value = {
        //     severity: "success",
        //     summary: "Audio Paused. Sleep Timer Ended.",
        //     //life: 6000,
        // }
    }

    // Update the duration, reset and start the timer
    function onUpdateDuration(e) {
        sleepTimerSelectedTime.value = e.value
        resetTimer()
        startTimer()
        sleepTimerSideBar.value = false
        trackClickEvent(
            "Click Tracking - Sleep timer duration",
            "Sleep Timer Sidebar - Duration",
            formattedTime
        )
    }

    // Update the user preferences
    async function updateUserPreferences(customTime) {
        currentUserProfile.value.sleep_timer = customTime
        const currentUserProfileSTRING = JSON.stringify(currentUserProfile.value)
        await Preferences.set({
            key: localUserProfileKey,
            value: currentUserProfileSTRING,
        })
    }

    // Get the user preferences
    async function getUserPreferenceSleepTime() {
        const userPreferences = await Preferences.get({ key: localUserProfileKey })
        if (userPreferences.value) {
            const userPreferencesObj = JSON.parse(userPreferences.value)
            if (userPreferencesObj.sleep_timer) {
                return userPreferencesObj.sleep_timer
            }
        }
        return 90
    }

    // handle the sleep timer side bar toggle and tracking
    function handleSleepTimer() {
        sleepTimerSideBar.value = !sleepTimerSideBar.value
        trackClickEvent(
            "Click Tracking - Sleep Timer",
            "Expanded Audio Player",
            currentEpisode.value?.title ?? "No audio selected"
        )
    }

    return { sleepTimerSelectedTime, sleepTimerCurrentTime, sleepTimerRunning, formattedTime, startTimer, pauseTimer, resetTimer, onTimeEnd, onUpdateDuration, sleepTimerPaused, updateUserPreferences, getUserPreferenceSleepTime, handleSleepTimer }
}