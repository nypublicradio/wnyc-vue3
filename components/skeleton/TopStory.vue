<template>
  <div class="skeleton-holder flex gap-3">
    <Skeleton class="flex-none" height="116px" width="116px" borderRadius="0px" />
    <div class="flex w-full flex-column pt-1 justify-content-between">
      <div>
        <div>
          <Skeleton
            height="12px"
            width="95%"
            borderRadius="16px"
            style="margin-bottom: 6px"
          />
          <Skeleton
            height="12px"
            width="85%"
            borderRadius="16px"
            style="margin-bottom: 6px"
          />
        </div>
        <div class="flex gap-2 mt-2">
          <Skeleton class="opacity-50" height="12px" width="60%" borderRadius="16px" />
        </div>
      </div>
      <div class="flex align-items-center justify-content-between">
        <Skeleton height="24px" width="91.73px" borderRadius="16px" />
        <div class="flex align-items-center gap-4">
          <Skeleton class="" height="16px" width="16px" borderRadius="16px" />
          <Skeleton class="mr-2" height="25px" width="5px" borderRadius="16px" />
        </div>
      </div>
    </div>
  </div>
</template>
