<template>
  <div class="segment-list">
    <p class="segment-list-title">Segments</p>
    <div class="flex flex-column">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.segment-list .segment-list-title {
  text-transform: uppercase;
  font-weight: bold;
}
</style>
