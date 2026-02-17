<template>
  <div class="member-card-skeleton">
    <div
      class="flex flex-wrap flex-nowrap align-items-start justify-content-start gap-3"
    >
      <Skeleton shape="circle" class="flex-none w-4rem h-4rem" />
      <div class="flex flex-column gap-2 flex-grow-1">
        <Skeleton width="35%" borderRadius="16px"></Skeleton>
        <Skeleton width="70%" height="0.75rem" borderRadius="16px"></Skeleton>
        <Skeleton width="70%" height="0.75rem" borderRadius="16px"></Skeleton>
        <Skeleton width="50%" height="0.75rem" borderRadius="16px"></Skeleton>
        <div
          class="flex gap-3 mt-2 align-items-center justify-content-start flex-wrap"
        >
          <Skeleton
            width="10rem"
            height="2rem"
            class="flex-none"
            borderRadius="16px"
          ></Skeleton>
          <Skeleton width="8rem" height="1rem" borderRadius="16px"></Skeleton>
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
