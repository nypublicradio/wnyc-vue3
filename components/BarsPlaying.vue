<script setup>
import { useCurrentEpisode, useIsEpisodePlaying } from "~/composables/states"

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
})

const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isPlaying = ref(false)

watch(isEpisodePlaying, () => {
  isPlaying.value = currentEpisode.value?.id === props.data?.id && isEpisodePlaying.value
})
</script>

<template>
  <WnycLoader v-if="isPlaying" class="loader-anim" :svgYscale="1.75" :bars="3" />
</template>

<style lang="scss" scoped>
.loader-anim {
  width: 16px;
  height: 20px;
}
</style>
