<script setup>
import { useSavedMenuItems } from '~/composables/globals.ts'

const savedMenuItems = useSavedMenuItems()

const selectMenuItem = (menuItem) => {
  console.log('selectMenuItem', menuItem)
}
</script>

<template>
  <div class="saved-page">
    <section class="flex align-items-center justify-content-between">
      <h1>Saved</h1>
      <Button
        class="-mr-3 text-sm"
        label="Add"
        text
        plain
        icon="pi pi-plus"
        iconPos="right"
        size="large"
      ></Button>
    </section>
    <HorizontalScrollFeature class="topics-holder">
      <div class="flex gap-3">
        <div
          v-for="topic in savedMenuItems"
          class="station-holder"
          :key="topic.label"
        >
          <div class="relative topic-btn-holder">
            <Button
              class="topic-btn text-sm white-space-nowrap"
              :label="topic.label"
              @click="selectMenuItem(topic)"
            />
            <!-- :style="`background-color: ${topic.color};`" -->
          </div>
        </div>
      </div>
    </HorizontalScrollFeature>
  </div>
</template>
