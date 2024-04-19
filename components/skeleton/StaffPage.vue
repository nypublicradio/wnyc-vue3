<template>
  <div class="skeleton-holder">
    <div class="flex gap-3 mb-4">
      <Skeleton class="flex-none" height="68px" width="68px" borderRadius="50px" />
      <div class="w-full flex flex-column gap-3">
        <Skeleton height="24px" width="42%" borderRadius="16px" />
        <div class="flex gap-2 mb-2">
          <div v-for="n of 4" :key="`staff-sk-${n}`">
            <Skeleton height="20px" width="20px" borderRadius="4px" />
          </div>
        </div>
        <div class="w-full">
          <skeleton-text :lines="3" />
        </div>
      </div>
    </div>
    <hr />
  </div>
</template>
