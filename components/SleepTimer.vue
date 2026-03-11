<script setup>
import { Device } from "@capacitor/device"
import useSleepTimer from "~/composables/useSleepTimer"
import SleepIcon from "~/components/icons/SleepIcon.vue"
import { useBackgroundMode } from "~/composables/useBackgroundMode"
const {
  sleepTimerSelectedTime,
  sleepTimerCurrentTime,
  sleepTimerRunning,
  formattedTime,
  startTimer,
  pauseTimer,
  resetTimer,
  onUpdateDuration,
  sleepTimerPaused,
  updateUserPreferences,
  getUserPreferenceSleepTime,
} = useSleepTimer()
const globalToast = useGlobalToast()
const { initBackgroundMode } = useBackgroundMode()

const timeLengthOptions = [
  { id: "15 minutes", label: "15 minutes", value: 900 },
  { id: "30 minutes", label: "30 minutes", value: 1800 },
  { id: "45 minutes", label: "45 minutes", value: 2700 },
  { id: "60 minutes", label: "60 minutes", value: 3600 },
]

const timeToIncrement = 5
const customTime = ref(90)

onMounted(async () => {
  if (import.meta.client) {
    customTime.value = await getUserPreferenceSleepTime()
  }
})

// increment or decrement the custom time
const handleCustomTimeChange = (inc) => {
  const seconds = inc ? timeToIncrement * 60 : -timeToIncrement * 60
  if (customTime.value + seconds / 60 >= 5) {
    customTime.value += seconds / 60
    // add preferred custom time to the local storage preferences
    updateUserPreferences(customTime.value)
  }
}
// increment or decrement the current time
const handleCurrentTimeChange = (inc) => {
  const seconds = inc ? timeToIncrement * 60 : -timeToIncrement * 60
  const destination = sleepTimerCurrentTime.value + seconds
  if (sleepTimerRunning.value && destination > 0) {
    sleepTimerCurrentTime.value += seconds
  }
}

// build the object from the id
const buildSleepTimerDataFromId = (id) => {
  const obj = timeLengthOptions.find((option) => option.id === id)
  return { entry: obj }
}

// start the timer
const handleStartTimer = async (data) => {
  let obj = null
  // data is already an object
  if (typeof data === "object") {
    obj = data
  } else {
    // dropdown menu: id that builds the object
    obj = buildSleepTimerDataFromId(data)
  }

  let platform = "web"
  let osVersion = "0"

  if (import.meta.client) {
    const info = await Device.getInfo()
    platform = info.platform
    osVersion = info.osVersion
  }

  // ios only
  if (platform === "ios" && parseInt(osVersion) < 17) {
    globalToast.value = {
      severity: "error",
      summary: "Sleep Timer requires iOS 17 or later",
      life: 3000,
      closable: true,
    }
    return
  }

  // allow for background interval on android only
  if (platform === "android") {
    if (!(await initBackgroundMode())) {
      // user did not allow the background mode
      globalToast.value = {
        severity: "error",
        summary:
          "You must allow WNYC to run in the background for the sleep timer",
        life: 8000,
        closable: true,
      }
      return
    }
  }

  // start the timer
  onUpdateDuration(obj)
}

//adds the custom time to the timeLengthOptions so it renders in the select menu
watch(
  sleepTimerSelectedTime,
  () => {
    if (
      !timeLengthOptions.some(
        (option) => option.value === sleepTimerSelectedTime.value.entry.value
      )
    ) {
      timeLengthOptions.push(sleepTimerSelectedTime.value.entry)
    }
  },
  {
    immediate: true,
    once: true,
  }
)
</script>

<template>
  <div>
    <div class="sleep-timer px-3 pb-8 pt-6">
      <div><SleepIcon :active="sleepTimerRunning" /></div>
      <h1
        class="my-3 text-center"
        :class="[{ 'text-center': sleepTimerRunning }]"
      >
        We'll lull you to sleep in:
      </h1>
      <div
        v-if="!sleepTimerRunning"
        class="flex flex-column w-full align-items-stretch gap-3 style-mode-light"
      >
        <DropupMenu
          id="sleep-timer-duration"
          v-model="sleepTimerSelectedTime.entry"
          :options="timeLengthOptions"
          optionLabel="label"
          placeholder="Select a Sleep Timer Duration"
          label="Sleep Timer"
          @update:modelValue="handleStartTimer"
          checkMark
        >
          <template #customButton="slotProps">
            <Select
              :options="timeLengthOptions"
              v-model="sleepTimerSelectedTime.entry"
              optionLabel="label"
              placeholder="Select a Time"
              class="w-full"
              overlayClass="sleep-timer-overlay"
            />
          </template>
          <template #footer="slotProps">
            <div class="style-mode-dark">
              <hr />
              <p>Custom time:</p>

              <div
                class="flex align-items-center justify-content-between"
                @click="
                  handleStartTimer({
                    entry: {
                      id: `${customTime} minutes`,
                      label: `${customTime} minutes`,
                      value: customTime * 60,
                    },
                  })
                "
              >
                <p class="custom-time">{{ customTime }} minutes</p>
                <div class="flex align-items-center gap-4 z-2">
                  <Button
                    icon="pi pi-minus"
                    rounded
                    outlined
                    severity="secondary"
                    aria-label="subtract time"
                    @click.stop="handleCustomTimeChange(false)"
                  />
                  <Button
                    icon="pi pi-plus"
                    rounded
                    outlined
                    severity="secondary"
                    aria-label="add time"
                    @click.stop="handleCustomTimeChange(true)"
                  />
                </div>
              </div>
            </div>
          </template>
        </DropupMenu>
        <Button
          label="Start"
          @click="handleStartTimer(sleepTimerSelectedTime)"
        />
      </div>
      <div v-else>
        <div class="count-down">
          <div
            class="time-holder flex align-items-center justify-content-between"
          >
            <Button
              class="mr-3"
              :class="[
                { 'opacity-20': sleepTimerCurrentTime < timeToIncrement * 60 },
              ]"
              icon="pi pi-minus"
              rounded
              outlined
              severity="secondary"
              aria-label="subtract time"
              @click="handleCurrentTimeChange(false)"
              :disabled="sleepTimerCurrentTime < timeToIncrement * 60"
            />
            <p class="time">{{ formattedTime }}</p>
            <Button
              class="ml-3"
              icon="pi pi-plus"
              rounded
              outlined
              severity="secondary"
              aria-label="add time"
              @click="handleCurrentTimeChange(true)"
            />
          </div>
          <div class="flex">
            <Button v-if="sleepTimerPaused" @click="startTimer">Resume</Button>
            <Button v-else @click="pauseTimer">Pause</Button>
          </div>
          <Button @click="resetTimer" severity="secondary">Cancel</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.footer {
  .custom-time {
    font-size: 1rem;
    font-weight: var(--font-weight-600);
  }
}
.sleep-timer {
  .sleep-icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: -1rem;
    position: relative;
    margin: auto;
    display: block;
    path {
      fill: var(--p-text-color);
    }
  }
  .count-down {
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    .time-holder {
      .time {
        font-size: 3.5rem;
        font-weight: bold;
        line-height: 3rem;
      }
    }
  }
  .p-dropdown .p-dropdown-label .ans div {
    justify-content: start !important;
  }
}
.sleep-timer-overlay.p-select-overlay {
  display: none;
}
</style>
