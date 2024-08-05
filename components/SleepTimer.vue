<script setup>
import useSleepTimer from "~/composables/useSleepTimer"
import { useSleepTimerRunning } from "~/composables/states"
const {
  sleepTimerSelectedTime,
  formattedTime,
  startTimer,
  pauseTimer,
  resetTimer,
  onUpdateDuration,
  isPaused,
} = useSleepTimer()
const sleepTimerRunning = useSleepTimerRunning()
const timeLengthOptions = [
  { label: "15 minutes", value: 900 },
  { label: "30 minutes", value: 1800 },
  { label: "45 minutes", value: 2700 },
  { label: "60 minutes", value: 3600 },
]

const customTime = ref(90)
const handleCutomTimeChange = (value) => {
  customTime.value += value
}
</script>

<template>
  <div>
    <div class="sleep-timer">
      <div v-if="!sleepTimerRunning" class="p-8 flex align-items-center gap-2">
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
              class="style-mode-dark flex align-items-center justify-content-between"
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
                  @click.stop="handleCutomTimeChange(-5)"
                />
                <Button
                  icon="pi pi-plus"
                  rounded
                  outlined
                  severity="secondary"
                  aria-label="add time"
                  @click.stop="handleCutomTimeChange(5)"
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
      <div v-else class="p-8">
        <p>{{ formattedTime }}</p>
        <button v-if="isPaused" @click="startTimer">Resume</button>
        <button v-else @click="pauseTimer">Pause</button>
        <button @click="resetTimer">Cancel Timer</button>
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
</style>
