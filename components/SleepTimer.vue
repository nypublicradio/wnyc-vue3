<script setup>
import useSleepTimer from "~/composables/useSleepTimer"
import SleepIcon from "~/components/icons/SleepIcon.vue"
const {
  sleepTimerSelectedTime,
  sleepTimerCurrentTime,
  sleepTimerRunning,
  formattedTime,
  startTimer,
  pauseTimer,
  resetTimer,
  onUpdateDuration,
  isPaused,
} = useSleepTimer()

const timeLengthOptions = [
  { label: "10 seconds", value: 10 },
  { label: "15 minutes", value: 900 },
  { label: "30 minutes", value: 1800 },
  { label: "45 minutes", value: 2700 },
  { label: "60 minutes", value: 3600 },
]

const timeToIncrement = 5

const customTime = ref(90)
const handleCutomTimeChange = (inc) => {
  const seconds = inc ? timeToIncrement * 60 : -timeToIncrement * 60
  const destination = sleepTimerCurrentTime.value + seconds
  if (sleepTimerRunning.value && destination > 0) {
    sleepTimerCurrentTime.value += seconds
  } else {
    customTime.value += seconds / 60
  }
  // add preferred custom time to the local storage preferences
}
</script>

<template>
  <div>
    <div class="sleep-timer">
      <div
        v-if="!sleepTimerRunning"
        class="py-8 flex align-items-center justify-content-center gap-2 style-mode-light"
      >
        <DropupMenu
          id="sleep-timer-duration"
          v-model:data.sync="sleepTimerSelectedTime"
          :options="timeLengthOptions"
          optionLabel="label"
          placeholder="Select a Sleep Timer Duration"
          label="Sleep Timer Duration"
          @change="onUpdateDuration"
          normal
          :checkMark="false"
        >
          <template #footer="slotpProps">
            <div
              class="flex align-items-center justify-content-between"
              @click="
                onUpdateDuration({
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
                  @click.stop="handleCutomTimeChange(false)"
                />
                <Button
                  icon="pi pi-plus"
                  rounded
                  outlined
                  severity="secondary"
                  aria-label="add time"
                  @click.stop="handleCutomTimeChange(true)"
                />
              </div>
            </div>
          </template>
        </DropupMenu>
        <Button
          label="Start"
          severity="success"
          @click="onUpdateDuration({ value: sleepTimerSelectedTime })"
        />
      </div>
      <div v-else>
        <div class="count-down">
          <div><SleepIcon /></div>
          <div class="time-holder flex align-items-center justify-content-between">
            <Button
              class="mr-3"
              icon="pi pi-minus"
              rounded
              outlined
              severity="secondary"
              aria-label="subtract time"
              @click="handleCutomTimeChange(false)"
            />
            <p class="time">{{ formattedTime }}</p>
            <Button
              class="ml-3"
              icon="pi pi-plus"
              rounded
              outlined
              severity="secondary"
              aria-label="add time"
              @click="handleCutomTimeChange(true)"
            />
          </div>
          <div class="flex">
            <Button v-if="isPaused" @click="startTimer" severity="secondary"
              >Resume</Button
            >
            <Button v-else @click="pauseTimer" severity="secondary">Pause</Button>
          </div>
          <Button @click="resetTimer" severity="">Cancel Timer</Button>
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
  .count-down {
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    .sleep-icon {
      width: 4rem;
      height: 4rem;
      margin-bottom: -1rem;
      path {
        fill: var(--text-color);
      }
    }
    .time-holder {
      .time {
        font-size: 3.5rem;
        font-weight: bold;
        line-height: 3rem;
      }
    }
  }
}
</style>
