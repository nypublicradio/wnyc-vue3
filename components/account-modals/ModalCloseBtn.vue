<script setup>
const emit = defineEmits(["clickEmit"])
</script>

<template>
  <div class="modal-close-btn">
    <Button
      class="-mr-2"
      rounded
      icon="pi pi-times"
      variant="text"
      severity="secondary"
      @click="emit('clickEmit')"
    />
  </div>
</template>

<style lang="scss" scoped>
.modal-close-btn {
  .p-button {
    .p-button-label {
      font-size: 1.5rem;
    }
  }
}
</style>
