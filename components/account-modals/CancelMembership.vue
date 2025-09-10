<script setup>
import ModalCloseBtn from "./ModalCloseBtn.vue"
const emit = defineEmits(["adjust", "cancel"])

const dialogRef = inject("dialogRef")

const springboardId = ref(null)

// Handle the cancel action
const onCancel = () => {
  dialogRef.value.close()
  emit("cancel")
}
// Handle the adjust action
const onAdjust = () => {
  dialogRef.value.close()
  emit("adjust")
}

onMounted(() => {
  springboardId.value = dialogRef.value.data.springboardId
})
</script>

<template>
  <div class="cancel-membership">
    <div class="flex justify-content-between align-items-center mb-2">
      <div class="font-meta text-2xl font-bold">Before you go...</div>
      <ModalCloseBtn class="-mr-2" @clickEmit="dialogRef.close()" />
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
