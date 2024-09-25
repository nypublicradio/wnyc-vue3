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
import { useGlobalToast } from "~/composables/states"
const globalToast = useGlobalToast()
const { platform, osVersion } = await Device.getInfo()
const { initBackgroundMode } = useBackgroundMode()

const timeLengthOptions = [
  { label: "15 minutes", value: 900 },
  { label: "30 minutes", value: 1800 },
  { label: "45 minutes", value: 2700 },
  { label: "60 minutes", value: 3600 },
]

const timeToIncrement = 5
const customTime = ref(await getUserPreferenceSleepTime())

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

// start the timer
const handleStartTimer = async (obj) => {
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
        summary: "You must allow WNYC to run in the background for the sleep timer",
        life: 8000,
        closable: true,
      }
      return
    }
  }

  // start the timer
  onUpdateDuration(obj)
}
</script>

<template>
  <div>
    <div class="sleep-timer px-3 pb-8 pt-6">
      <div><SleepIcon :active="sleepTimerRunning" /></div>
      <h1 class="my-3 text-center" :class="[{ 'text-center': sleepTimerRunning }]">
        We'll lull you to sleep in:
      </h1>
      <div
        v-if="!sleepTimerRunning"
        class="flex flex-column w-full align-items-stretch gap-3 style-mode-light"
      >
        <DropupMenu
          id="sleep-timer-duration"
          v-model="sleepTimerSelectedTime"
          :options="timeLengthOptions"
          optionLabel="label"
          placeholder="Select a Sleep Timer Duration"
          label="Sleep Timer"
          @change="handleStartTimer"
          normal
          :checkMark="false"
        >
          <template #footer="slotpProps">
            <div class="style-mode-dark">
              <hr />
              <p>Custom time:</p>

              <div
                class="flex align-items-center justify-content-between"
                @click="
                  handleStartTimer({
                    value: { value: customTime * 60, label: `${customTime} minutes` },
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
          severity=""
          @click="handleStartTimer({ value: sleepTimerSelectedTime })"
        />
      </div>
      <div v-else>
        <div class="count-down">
          <div class="time-holder flex align-items-center justify-content-between">
            <Button
              class="mr-3"
              :class="[{ 'opacity-20': sleepTimerCurrentTime < timeToIncrement * 60 }]"
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
    font-weight: 600;
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
      fill: var(--text-color);
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
</style>
