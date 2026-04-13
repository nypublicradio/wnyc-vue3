<script lang="ts" setup>
import { useCurrentEpisode, useIsApp } from "~/composables/states"
import { getCssVar } from "~/utilities/helpers"
const props = defineProps({
  threshold: {
    type: Number,
    default: 600,
  },
})

const currentEpisode = useCurrentEpisode()
const isApp = useIsApp()
const bottomBuffer = ref("0px")

onMounted(() => {
  // only the app has the bottom menu
  const bottomMenuHeight = isApp.value ? getCssVar("--bottom-menu-height") : 0
  const playerHeight = getCssVar("--player-height")

  // Calculate the initial buffer based on whether an episode is loaded that would show the bottom player.
  const updateBuffer = () => {
    bottomBuffer.value = currentEpisode.value
      ? `${Number(bottomMenuHeight) + Number(playerHeight)}px`
      : `${bottomMenuHeight}px`
  }
  updateBuffer()
  watch(currentEpisode, updateBuffer)
})
</script>

<template>
  <div class="back-to-top-button">
    <Transition name="fade">
      <ScrollTop :threshold="props.threshold" />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.back-to-top-button {
  .p-scrolltop {
    margin-bottom: calc(env(safe-area-inset-bottom) + v-bind(bottomBuffer));
    z-index: 1;
    background: #000000b3;
    border: none;
    box-shadow: 0 2px 4px -1px #0003, 0 4px 5px #00000024, 0 1px 10px #0000001f;
    height: 2rem;
    width: 2rem;
    &:hover {
      background: #000000;
    }
  }
}
</style>
