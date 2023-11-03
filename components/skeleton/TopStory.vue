<template>
  <div>
    <Skeleton class="flex-none" height="116px" width="116px" borderRadius="0px" />
    <div class="flex w-full flex-column justify-content-between py-1">
      <div>
        <Skeleton
          height="12px"
          width="85%"
          borderRadius="16px"
          style="margin-bottom: 6px"
        />
        <Skeleton
          height="12px"
          width="70%"
          borderRadius="16px"
          style="margin-bottom: 6px"
        />
      </div>
      <Skeleton class="opacity-50" height="12px" width="60%" borderRadius="16px" />
    </div>
  </div>
</template>
