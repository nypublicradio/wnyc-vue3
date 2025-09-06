<script setup>
const emit = defineEmits(["onAdjust", "onCancel"])

const dialogRef = inject("dialogRef")
</script>

<template>
  <div class="cancel-membership-thank-you">
    <div class="flex justify-content-between align-items-center mb-3">
      <h2>Thank you for your support</h2>
      <Button
        class="-mr-2"
        rounded
        icon="pi pi-times"
        variant="text"
        severity="secondary"
        @click="dialogRef.close()"
      />
    </div>
    <p>
      Your donation has been cancelled. We understand, circumstances change. Your
      generosity has made a difference, and we hope you’ll consider coming back when the
      time is right for you. In the meantime, feel free to stay connected with us and see
      how your past contributions continue to make an impact.
    </p>
    <div class="flex flex-column gap-3 align-items-center mt-3">
      <Button
        class="w-full px-3 max-w-15rem"
        @click="dialogRef.close()"
        label="Done"
        size="small"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cancel-membership-thank-you {
}
</style>
