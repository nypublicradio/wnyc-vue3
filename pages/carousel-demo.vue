<script setup>
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

    <div class="mb-12">
      <h2 class="text-xl font-bold mb-4">
        MaterialCarouselAdvanced (Original)
      </h2>
      <MaterialCarouselAdvanced
        :enableThrow="true"
        :items-to-show="3"
        :gap="8"
        :min-item-width="0"
        :min-content-width="248"
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
            class="h-20rem object-cover"
          />
        </div>
      </MaterialCarouselAdvanced>
    </div>

    <div class="mb-12">
      <h2 class="text-xl font-bold mb-4">MaterialCarouselBasic (New)</h2>
      <MaterialCarouselBasic :gap="8">
        <div v-for="item in items" :key="'basic-' + item.id" class="item">
          <img
            :src="item.image"
            :alt="item.title"
            class="h-20rem object-cover"
          />
        </div>
      </MaterialCarouselBasic>
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