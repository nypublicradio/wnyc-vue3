<template>
  <div>
    <Skeleton
      height="20px"
      width="226px"
      borderRadius="16px"
      style="margin-bottom: 4px; margin-top: 4px"
      class="mb-4"
    />
    <div class="grid">
      <skeleton-media-card
        class="col-12 lg:col-8 mb-3"
        is-horizontal
        is-feature
        imgCol="w-8"
        :size="{ xs: [369, 246], sm: [592, 395] }"
      />

      <div
        class="ad col mb-3 hidden lg:flex flex-column align-items-center justify-content-center"
      >
        <Skeleton
          height="250px"
          width="300px"
          borderRadius="0px"
          style="margin-bottom: 4px; margin-top: 4px"
        />
        <Skeleton
          height="12px"
          width="286px"
          borderRadius="16px"
          style="margin-bottom: 4px; margin-top: 4px"
        />
      </div>

      <skeleton-media-card
        v-for="index in 3"
        :key="`skeleton-1-${index}`"
        class="col-12 md:col-4 mb-3"
        :size="{ xs: [112, 112], md: [438, 292] }"
      />
    </div>
  </div>
</template>