<template>
  <div class="skeleton-holder flex gap-3">
    <Skeleton class="flex-none" height="116px" width="116px" borderRadius="0px" />
    <div class="flex w-full flex-column py-1">
      <div>
        <Skeleton
          height="12px"
          width="85%"
          borderRadius="16px"
          style="margin-bottom: 6px"
        />
      </div>
      <Skeleton class="opacity-50" height="12px" width="60%" borderRadius="16px" />
    </div>
    <Skeleton
      class="opacity-50 flex-none align-self-center"
      height="38px"
      width="38px"
      borderRadius="16px"
    />
  </div>
</template>
