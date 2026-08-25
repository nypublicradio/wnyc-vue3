<script setup>
const props = defineProps({
  contentClass: {
    type: String,
    default: "",
  },
  imageClass: {
    type: String,
    default: "",
  },
  hideButtons: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="skeleton-holder show-item flex gap-3">
    <div class="flex w-full" :class="props.contentClass">
      <Skeleton class="flex-none v-image" :class="props.imageClass" borderRadius="0px" />
      <div class="flex w-full flex-column gap-2">
        <div>
          <Skeleton height="12px" width="120px" borderRadius="16px" />
        </div>
        <Skeleton class="opacity-50" height="12px" width="80px" borderRadius="16px" />
      </div>
    </div>
    <Skeleton
      v-if="!props.hideButtons"
      class="opacity-50 flex-none align-self-center"
      height="38px"
      width="38px"
      borderRadius="16px"
    />
  </div>
</template>
