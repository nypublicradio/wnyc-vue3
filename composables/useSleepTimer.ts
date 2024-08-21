import { computed } from 'vue'
import { localUserProfileKey } from "~/composables/globals"
import { trackClickEvent } from "~/utilities/helpers"
import {
    useIsEpisodePlaying,
    useTogglePlayTrigger,
    useSleepTimerRunning,
    useSleepTimerSideBar,
    useSleepTimerCurrentTime,
    useSleepTimerInterval,
    useSleepTimerSelectedTime,
    useGlobalToast,
    useCurrentUserProfile,
} from "~/composables/states"
import { Preferences } from "@capacitor/preferences"
import { clearInterval, setInterval } from 'worker-timers';

export default function useSleepTimer(initialTime = 30) {
    const isEpisodePlaying = useIsEpisodePlaying()
    const togglePlayTrigger = useTogglePlayTrigger()
    const sleepTimerRunning = useSleepTimerRunning()
    const sleepTimerSideBar = useSleepTimerSideBar()
    const sleepTimerCurrentTime = useSleepTimerCurrentTime()
    const sleepTimerInterval = useSleepTimerInterval()
    const sleepTimerSelectedTime = useSleepTimerSelectedTime()
    const currentUserProfile = useCurrentUserProfile()
    const globalToast = useGlobalToast()

    const isPaused = ref(false)

    const chunck = 60
    const chunckedTime = ref(0)

    const formattedTime = computed(() => {
        const hours = Math.floor(sleepTimerCurrentTime.value / 3600)
        const minutes = Math.floor((sleepTimerCurrentTime.value % 3600) / 60)
        const seconds = sleepTimerCurrentTime.value % 60
        const cHours = hours > 0 ? `${hours}:` : ""
        return `${cHours}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    })

    function clearTheInterval() {
        clearInterval(sleepTimerInterval.value)
        sleepTimerInterval.value = null
        chunckedTime.value = 0
    }

    function startTimer(repeat = false) {
        sleepTimerRunning.value = true
        if (!isPaused.value && !repeat) {
            globalToast.value = {
                severity: "info",
                summary: `Sleep timer started for ${sleepTimerSelectedTime.value.label}`,
                life: 3000,
                closable: true,
            }
        }
        isPaused.value = false
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

    function pauseTimer() {
        isPaused.value = true
        clearTheInterval()
    }

    function resetTimer() {
        clearTheInterval()
        sleepTimerCurrentTime.value = sleepTimerSelectedTime.value.value
        sleepTimerRunning.value = false
        sleepTimerSideBar.value = false
    }

    function onTimeEnd() {
        // slowly decrease volume to 0
        if (isEpisodePlaying.value) {
            togglePlayTrigger.value = !togglePlayTrigger.value
        }
        sleepTimerSideBar.value = false
        sleepTimerRunning.value = false
        trackClickEvent(
            "Click Tracking - Sleep timer event",
            "Sleep Timer - Ended",
            sleepTimerSelectedTime.value.label
        )
        globalToast.value = {
            severity: "success",
            summary: "Audio Paused. Sleep Timer Ended.",
            //life: 6000,
        }
    }

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

    async function updateUserPreferences(customTime) {
        currentUserProfile.value.sleep_timer = customTime
        const currentUserProfileSTRING = JSON.stringify(currentUserProfile.value)
        await Preferences.set({
            key: localUserProfileKey,
            value: currentUserProfileSTRING,
        })
    }

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

    return { sleepTimerSelectedTime, sleepTimerCurrentTime, sleepTimerRunning, formattedTime, startTimer, pauseTimer, resetTimer, onTimeEnd, onUpdateDuration, isPaused, updateUserPreferences, getUserPreferenceSleepTime }
}