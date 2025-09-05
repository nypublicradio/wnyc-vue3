<script setup>
const emit = defineEmits(["onAdjust", "onCancel"])

const dialogRef = inject("dialogRef")

const springboardId = ref(null)

const onCancel = () => {
  console.log("canceling emit fired")
  emit("onCancel")
}
const onAdjust = () => {
  emit("onAdjust")
}

onMounted(() => {
  springboardId.value = dialogRef.value.data.springboardId
})
</script>

<template>
  <div class="cancel-membership">
    <div class="flex justify-content-between align-items-center mb-3">
      <h2>Before you go...</h2>
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
      Would you consider adjusting your donation amount instead of canceling? Even small
      contributions go a long way.
    </p>
    <div class="flex flex-column gap-3 align-items-center mt-3">
      <Button
        class="w-full px-3 max-w-15rem"
        @click="onAdjust"
        label="Adjust donation amount"
        size="small"
      />
      <Button
        class="w-full px-3 max-w-15rem"
        severity="secondary"
        @click="onCancel"
        label="Cancel membership"
        size="small"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cancel-membership {
}
</style>
