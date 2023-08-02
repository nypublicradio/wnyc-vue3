<script setup lang="ts">
import {
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
} from '~/composables/states'

import PlayIcon from '~/components/icons/PlayIcon.vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Listen Live',
  },
  slug: {
    type: String,
    default: 'wnyc-fm939',
  },
})

const emit = defineEmits(['stream-button-click'])

const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()

const togglePlay = () => {
  if (!currentEpisode.value) {
    currentEpisode.value = currentEpisodeHolder.value
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  emit('stream-button-click', !isEpisodePlaying.value)
}
</script>

<template>
  <div class="listen-live-button">
    <Button
      severity="secondary"
      @click="currentEpisodeHolder ? togglePlay() : null"
    >
      <slot name="icon">
        <PlayIcon />
      </slot>
      <!-- <slot>
        <div class="flex align-items-center">
          <i
            v-if="!currentEpisodeHolder"
            class="pi pi-spin pi-spinner mr-2"
          ></i>
          <img
            v-else-if="!isEpisodePlaying"
            alt="play icon"
            src="/play.svg"
            class="mr-2"
          />
          <img v-else alt="pause icon" src="/pause.svg" class="mr-2" />
          <span class="p-button-label">{{ props.label }}</span>
        </div>
      </slot> -->
    </Button>
  </div>
</template>
