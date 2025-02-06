<template>
  <div class="skeleton-holder large-card">
    <Skeleton class="flex-none" height="159px" width="100%" borderRadius="0px" />
    <div
      class="flex w-full h-full flex-column justify-content-between p-3 pb-4 gap-3 h-15rem"
    >
      <div class="flex flex-column gap-2">
        <div>
          <Skeleton
            height="12px"
            width="95%"
            borderRadius="16px"
            style="margin-bottom: 4px; margin-top: 4px"
          />
          <Skeleton
            height="12px"
            width="70%"
            borderRadius="16px"
            style="margin-bottom: 6px"
          />
        </div>
        <div class="flex flex-column gap-2">
          <Skeleton class="" height="10.5px" width="97%" borderRadius="16px" />
          <Skeleton class="" height="10.5px" width="95%" borderRadius="16px" />
          <Skeleton class="" height="10.5px" width="85%" borderRadius="16px" />
          <Skeleton class="" height="10.5px" width="100%" borderRadius="16px" />
        </div>
        <Skeleton class="mt-2" height="10px" width="100%" borderRadius="16px" />
      </div>
      <div class="flex justify-content-between">
        <Skeleton height="28px" width="84px" borderRadius="15px" />
        <Skeleton height="28px" width="10px" borderRadius="15px" />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.large-card {
  &.skeleton-holder {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    max-width: 248px;
    min-width: 248px;
    height: 400px;
    background-color: var(--p-surface-25);
  }
}
</style>
