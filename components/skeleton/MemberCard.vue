<template>
  <div class="member-card-skeleton">
    <div class="flex flex-wrap align-items-start gap-3">
      <Skeleton shape="circle" class="w-4rem h-4rem" />
      <div class="flex flex-column gap-2 flex-grow-1">
        <Skeleton width="35%" borderRadius="16px"></Skeleton>
        <Skeleton width="50%" height="0.75rem" borderRadius="16px"></Skeleton>
        <Skeleton width="70%" height="0.75rem" borderRadius="16px"></Skeleton>
        <div class="flex gap-4 flex-grow-1 align-items-center mt-3">
          <Skeleton
            width="11rem"
            height="2rem"
            class="flex-none"
            borderRadius="16px"
          ></Skeleton>
          <Skeleton height="1rem" borderRadius="16px"></Skeleton>
          <Skeleton height="1rem" borderRadius="16px"></Skeleton>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.member-card-skeleton {
  background-color: var(--s-box-background-color);
  border-radius: 10px;
  padding: 1rem;
}
</style>
