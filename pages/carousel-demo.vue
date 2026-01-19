<script setup>
import MaterialCarousel from "~/components/MaterialCarousel.vue"

const items = Array.from({ length: 12 }, (_, i) => {
  // Cycle through aspect ratios: 1:1, 16:9, 3:2
  const ratios = [
    { w: 400, h: 400, label: "1:1" },
    { w: 640, h: 360, label: "16:9" },
    { w: 600, h: 400, label: "3:2" },
  ]
  const ratio = ratios[i % ratios.length]

  return {
    id: i,
    title: `Item ${i + 1} (${ratio.label})`,
    image: `https://picsum.photos/seed/${i + 1}/${ratio.w}/${ratio.h}`,
    aspectRatio: ratio.w / ratio.h,
  }
})
</script>

<template>
  <div class="p-0 mb-8">
    <h1 class="text-3xl font-bold mb-6">Material Carousel Demo</h1>

    <!-- <div class="mb-12">
      <h2 class="text-xl mb-4">
        Throw Physics Enabled (Draggable) - Default Settings
      </h2>
      <MaterialCarousel :enableThrow="true">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-gray-100 rounded-xl overflow-hidden shadow-sm"
        >
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover"
          />
        </div>
      </MaterialCarousel>
    </div>

    <div class="mb-12">
      <h2 class="text-xl mb-4">Throw + Edge Fade (Distance 64px)</h2>
      <MaterialCarousel
        :enableThrow="true"
        :edge-fade="true"
        :edge-fade-distance="64"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-gray-100 rounded-xl overflow-hidden shadow-sm"
        >
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover"
          />
        </div>
      </MaterialCarousel>
    </div> -->

    <div class="mb-12">
      <MaterialCarousel
        :enableThrow="true"
        :items-to-show="3"
        :gap="8"
        :min-item-width="0"
        :min-item-height="248"
        :max-item-height="324"
        :enable-material-scaling="true"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="item"
          :data-aspect-ratio="item.aspectRatio"
        >
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover"
          />
        </div>
      </MaterialCarousel>
    </div>
  </div>
</template>
 <style lang="scss">
.item {
  background-color: #f1f1f1;
  border-radius: 16px;
  overflow: hidden;
}
</style>