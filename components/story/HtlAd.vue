<script setup lang="ts">
defineProps<{
  slotClass: string
  layout: string
  fineprint?: string
  fineprintClass?: string
}>()

const sensitiveContent = useSensitiveContent()
</script>

<template>
  <ClientOnly>
    <div>
      <div :class="`ad-wrapper ${sensitiveContent ? '' : layout}`">
        <div v-if="!sensitiveContent" :class="slotClass"></div>
      </div>
      <p
        v-if="fineprint && !sensitiveContent"
        :class="`type-fineprint text-center ${fineprintClass || ''}`"
        class="mt-3"
      >
        {{ fineprint }}
      </p>
    </div>
  </ClientOnly>
</template>
<style lang="scss">
.ad-wrapper.leaderboard .htl-ad-gpt {
  min-width: 320px;
  min-height: 50px;
  margin: 40px auto;
}

.ad-wrapper.wide {
  min-width: 300px;
  min-height: 250px;
  @include media(">sm") {
    min-width: 728px;
    min-height: 90px;
  }
}

.ad-wrapper.rectangle {
  min-width: 300px;
  min-height: 250px;
}
</style>
