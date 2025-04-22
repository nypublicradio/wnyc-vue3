<script setup>
import { ref, onUpdated } from "vue"
import Slider from "primevue/slider"

const props = defineProps({
  volume: {
    type: Number,
    default: 100,
  },
  isMuted: {
    type: Boolean,
    default: false,
  },
  showVolume: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["volume-toggle-mute", "volume-change"])

const previousVolume = ref(props.volume)

onUpdated(() => {
  previousVolume.value = props.volume
  //emit("volume-change", props.volume)
})
</script>

<template>
  <div
    class="volume-control align-items-center"
    :class="{ 'show-volume': props.showVolume }"
  >
    <button
      class="volume-control-icon"
      :disabled="disabled"
      :aria-label="props.isMuted ? 'unmute' : 'mute'"
      @click.prevent="emit('volume-toggle-mute')"
      @keypress.space.enter="mute"
    >
      <i v-if="!props.isMuted" class="pi pi-volume-up"></i>
      <i v-if="props.isMuted" class="pi pi-volume-off"></i>
    </button>
    <Slider
      v-show="!props.isMuted"
      v-model="previousVolume"
      :disabled="disabled"
      class="volume-control-slider"
      :min="0"
      :max="100"
      aria-label="Volume slider"
      title="Volume slider"
      aria-labelledby="Volume slider"
      @change="emit('volume-change', previousVolume)"
    />
  </div>
</template>

<style lang="scss">
.volume-control {
  position: relative;
  &:hover,
  &:focus-within,
  &:focus-visible {
    .volume-control-slider {
      width: 116px;
      opacity: 1;
      visibility: visible;
      margin-right: 0;
    }
  }

  &.show-volume .volume-control-slider,
  & .volume-control-slider.focus-visible {
    width: 116px;
    opacity: 1;
    visibility: visible;
    margin-right: 0;
  }
  .label {
    height: 4px;
    line-height: 0px;
    margin-right: 4px;
  }
  .volume-control-icon {
    color: var(--text-color);
    flex: 1 0;
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    display: inline-block;
    height: 36px;
    min-width: 36px;
    max-width: 36px;
    .pi {
      font-size: 1.3rem;
    }
  }
  .volume-control-slider {
    position: absolute;
    right: 40px;
    transition: width var(--p-transition-duration), opacity var(--p-transition-duration),
      margin-right var(--p-transition-duration);
    -webkit-transition: width var(--p-transition-duration),
      opacity var(--p-transition-duration), margin-right var(--p-transition-duration);
    margin-right: 0;
    width: 0px;
    opacity: 0;
    border: none;
  }
}
</style>
