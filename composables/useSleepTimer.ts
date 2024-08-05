import { computed } from 'vue'
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
} from "~/composables/states"

export default function useSleepTimer(initialTime = 30) {
    const isEpisodePlaying = useIsEpisodePlaying()
    const togglePlayTrigger = useTogglePlayTrigger()
    const sleepTimerRunning = useSleepTimerRunning()
    const sleepTimerSideBar = useSleepTimerSideBar()
    const sleepTimerCurrentTime = useSleepTimerCurrentTime()
    const sleepTimerInterval = useSleepTimerInterval()
    const sleepTimerSelectedTime = useSleepTimerSelectedTime()
    const globalToast = useGlobalToast()

    const isPaused = ref(false)

    const formattedTime = computed(() => {
        const hours = Math.floor(sleepTimerCurrentTime.value / 3600)
        const minutes = Math.floor((sleepTimerCurrentTime.value % 3600) / 60)
        const seconds = sleepTimerCurrentTime.value % 60
        const cHours = hours > 0 ? `${hours}:` : ""
        return `${cHours}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    })

    function startTimer() {
        sleepTimerRunning.value = true
        if (!isPaused.value) {
            globalToast.value = {
                severity: "info",
                summary: `Sleep timer started for ${sleepTimerSelectedTime.value.label}`,
                life: 3000,
                closable: true,
            }
        }
        isPaused.value = false
        sleepTimerInterval.value = setInterval(() => {
            if (sleepTimerCurrentTime.value > 0) {
                sleepTimerCurrentTime.value--
            } else {
                clearInterval(sleepTimerInterval.value)
                onTimeEnd() // Function to call when time ends
            }
        }, 1000)
    }

    function pauseTimer() {
        isPaused.value = true
        clearInterval(sleepTimerInterval.value)
    }

    function resetTimer() {
        clearInterval(sleepTimerInterval.value)
        sleepTimerCurrentTime.value = sleepTimerSelectedTime.value.value
        sleepTimerRunning.value = false
    }

    function onTimeEnd() {
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
            closable: true,
        }
    }

    async function onUpdateDuration(e) {
        await nextTick()
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

    return { sleepTimerSelectedTime, sleepTimerCurrentTime, sleepTimerRunning, formattedTime, startTimer, pauseTimer, resetTimer, onTimeEnd, onUpdateDuration, isPaused }
}