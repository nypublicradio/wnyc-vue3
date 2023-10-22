<template>
  <div class="skeleton-holder flex gap-3">
    <Skeleton
      class="flex-none"
      height="72px"
      width="72px"
      borderRadius="0px"
    ></Skeleton>
    <div class="flex w-full flex-column py-1">
      <div>
        <Skeleton
          height="12px"
          width="95%"
          borderRadius="16px"
          style="margin-bottom: 6px"
        ></Skeleton>
        <Skeleton
          height="12px"
          width="85%"
          borderRadius="16px"
          style="margin-bottom: 6px"
        ></Skeleton>
      </div>
      <div class="flex gap-2 mt-2">
        <Skeleton
          class="opacity-50"
          height="12px"
          width="60%"
          borderRadius="16px"
        ></Skeleton>
        <Skeleton
          class=""
          height="12px"
          width="12px"
          borderRadius="16px"
        ></Skeleton>
      </div>
    </div>
    <div class="flex-none align-self-center" style="width: 18px; height: 38px">
      <Skeleton
        class="flex-none align-self-center"
        height="38px"
        width="8px"
        borderRadius="16px"
      ></Skeleton>
    </div>
  </div>
</template>
