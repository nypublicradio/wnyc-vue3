<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    default: "Play",
  },
  live: {
    type: Boolean,
    default: false,
  },
  isDownloaded: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  /* file filed to match up agaist or, if playing a downloaded file, the directoryAudio.name to match up against */
  file: {
    default: "",
    type: String,
  },
})

const emit = defineEmits(["on-click"])
</script>

<template>
  <div class="read-button" :class="[{ circle: props.label === '' }]">
    <Button
      severity="secondary"
      @click="emit('on-click')"
      aria-label="read this article"
      class="flex align-items-center cursor-pointer"
    >
      <slot name="icon">
        <div class="flex align-items-center icon">
          <ReadIcon />
        </div>
      </slot>
      <slot>
        <div class="content flex white-space-nowrap">
          <span>{{ props.label }}</span>
        </div>
      </slot>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.read-button {
  .p-button {
    padding: 0.219rem 0.75rem;
    min-height: 28px;
    &.active {
      //border: var(--bw-toggle) 1px solid;
    }
  }
  .content {
    font-size: 14px;
    font-weight: 700;
    line-height: normal;
    align-items: center;
    * {
      line-height: 1;
    }
  }
}
</style>
