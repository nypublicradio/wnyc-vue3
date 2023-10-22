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
          width="85%"
          borderRadius="16px"
          style="margin-bottom: 6px"
        ></Skeleton>
      </div>
      <Skeleton
        class="opacity-50"
        height="12px"
        width="60%"
        borderRadius="16px"
      ></Skeleton>
    </div>
    <Skeleton
      class="opacity-50 flex-none align-self-center"
      height="38px"
      width="38px"
      borderRadius="16px"
    ></Skeleton>
  </div>
</template>
