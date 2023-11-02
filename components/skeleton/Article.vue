<template>
  <div class="skeleton-holder flex flex-column">
    <Skeleton
      class="flex-none"
      height="auto"
      width="100%"
      borderRadius="0px"
      style="aspect-ratio: 3 / 2"
    />
    <Skeleton
      class="opacity-50 align-self-end mt-1 mr-3"
      height="12px"
      width="40%"
      borderRadius="16px"
    />

    <section>
      <div class="flex w-full flex-column">
        <Skeleton
          class="opacity-50 my-3"
          height="12px"
          width="40%"
          borderRadius="16px"
        />
        <div>
          <Skeleton
            height="18px"
            width="95%"
            borderRadius="16px"
            style="margin-bottom: 6px"
          />
          <Skeleton height="18px" width="85%" borderRadius="16px" />
        </div>
        <Skeleton
          class="opacity-50 my-3"
          height="12px"
          width="40%"
          borderRadius="16px"
        />
      </div>
      <div class="flex gap-4 mt-3">
        <Skeleton
          class="opacity-50 flex-none align-self-center"
          height="38px"
          width="38px"
          borderRadius="16px"
        />
        <Skeleton
          class="opacity-50 flex-none align-self-center"
          height="38px"
          width="38px"
          borderRadius="16px"
        />
        <div class="flex align-items-center gap-2">
          <Skeleton
            class="opacity-50 flex-none align-self-center"
            height="38px"
            width="38px"
            borderRadius="16px"
          />
          <Skeleton
            class="opacity-50"
            height="12px"
            width="80px"
            borderRadius="16px"
          />
        </div>
      </div>
      <div class="mt-5">
        <skeleton-text :lines="10" />
      </div>
    </section>
  </div>
</template>
