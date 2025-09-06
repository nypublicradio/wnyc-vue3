<script setup>
const { formatCurrency } = useProfileApi()
const emit = defineEmits(["adjust", "cancel"])

const dialogRef = inject("dialogRef")

const currentDonationAmount = ref(null)

const onCancel = () => {
  console.log("canceling emit fired")
  dialogRef.value.close()
  emit("cancel")
}
const onAdjust = () => {
  dialogRef.value.close()
  emit("adjust")
}

const value = ref("$15/mo")
const options = ref(["$15/mo", "$30/mo", "$34/mo", "other"])

onMounted(() => {
  currentDonationAmount.value = dialogRef.value.data.currentDonationAmount
})
</script>

<template>
  <div class="adjust-donation">
    <div class="flex justify-content-between align-items-center mb-3">
      <h2>Update Gift Amount</h2>
      <Button
        class="-mr-2"
        rounded
        icon="pi pi-times"
        variant="text"
        severity="secondary"
        @click="dialogRef.close()"
      />
    </div>
    <p>Your current monthly gift is {{ formatCurrency(currentDonationAmount) }}.</p>

    <div class="amount-rb flex align-items-center gap-2 my-4">
      <Button
        v-for="amount in options"
        class="px-3"
        :label="amount"
        severity="secondary"
        size="small"
        @click="value = amount"
        :class="value === amount ? 'selected' : ''"
      />
    </div>

    <div class="flex flex-column gap-3 align-items-center mt-3">
      <Button
        class="w-full px-3 max-w-15rem"
        @click="onAdjust"
        label="Save Changes"
        size="small"
      />
      <Button
        class="w-full px-3 max-w-15rem"
        severity="secondary"
        @click="onCancel"
        label="Never mind, don't update"
        size="small"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.adjust-donation {
  .amount-rb {
    .p-button {
      &.selected {
        background-color: #000000;
        border-color: transparent;
        color: #fff;
      }
    }
  }
}
</style>
