<script lang="ts" setup>
import { useCurrentEpisode } from "~/composables/states"
import { getCssVar } from "~/utilities/helpers"
const props = defineProps({
  threshold: {
    type: Number,
    default: 600,
  },
})

const currentEpisode = useCurrentEpisode()
const bottomMenuHeight: number | string = getCssVar("--bottom-menu-height")
const playerHeight: number | string = getCssVar("--player-height")

const bottomBuffer = ref(`${bottomMenuHeight}px`)

watch(
  currentEpisode,
  () => {
    bottomBuffer.value = currentEpisode.value
      ? `${Number(bottomMenuHeight) + Number(playerHeight)}px`
      : `${bottomMenuHeight}px`
  },
  { immediate: true }
)
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
