<template>
  <div class="s-box relative overflow-hidden">
    <div class="content flex align-items-center">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.s-box {
  background-color: var(--s-box-background-color);
  width: 100%;
  min-height: 50px;

  border: 1px solid var(--stroke-toggle-color);
  border-left: none;
  border-right: none;
  margin-top: -1px;

  .content {
    width: 100%;
    padding: 0 1.25rem;
  }
}
</style>
