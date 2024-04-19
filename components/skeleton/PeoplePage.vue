<template>
  <div class="skeleton-holder">
    <div class="flex gap-3">
      <Skeleton class="flex-none" height="68px" width="68px" borderRadius="50px" />
      <div class="w-full flex flex-column gap-3">
        <Skeleton height="24px" width="42%" borderRadius="16px" />
        <div class="flex gap-2 mb-2">
          <div v-for="n of 4">
            <Skeleton height="20px" width="20px" borderRadius="4px" />
          </div>
        </div>
        <div>
          <Skeleton class="mb-2" height="12px" width="50px" borderRadius="16px" />
          <div v-for="n of 7" class="flex gap-1 align-items-center mb-3">
            <Skeleton
              class="flex-none align-self-center"
              height="20px"
              width="20px"
              borderRadius="0px"
            />
            <Skeleton height="12px" width="30%" borderRadius="16px" />
          </div>
          <div class="w-full">
            <skeleton-text :lines="10" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
