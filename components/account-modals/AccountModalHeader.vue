<script setup>
import ModalCloseBtn from "./ModalCloseBtn.vue"
const dialogRef = inject("dialogRef")
</script>

<template>
  <div class="account-modal-header">
    <ModalCloseBtn class="absolute right-0 top-0 p-2" @clickEmit="dialogRef.close()" />
    <div class="font-meta text-2xl font-bold mb-2 line-height-2">
      <slot />
    </div>
  </div>
</template>
