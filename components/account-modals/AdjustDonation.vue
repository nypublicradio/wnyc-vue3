<script setup>
const { formatCurrency } = useProfileApi()
const emit = defineEmits(["adjust", "cancel"])

const dialogRef = inject("dialogRef")

const currentDonationAmount = ref(null)

const finalAmount = ref(null)
const value = ref(15)
const otherAmount = ref(null)
const options = ref([15, 30, 45, "other"])
const isOtherError = ref(false)

const onCancel = () => {
  dialogRef.value.close()
  emit("cancel")
}
const onAdjust = () => {
  // finalAmount should already be set by now, but add safety check
  if (value.value === "other") {
    if (otherAmount.value === null || otherAmount.value < 1) {
      isOtherError.value = true
      return
    } else {
      finalAmount.value = otherAmount.value
      isOtherError.value = false

      dialogRef.value.close()
      emit("adjust", { amount: finalAmount.value })
    }
  } else {
    dialogRef.value.close()
    emit("adjust", { amount: finalAmount.value })
  }
}

const onRbClicked = (e) => {
  value.value = e

  if (e === "other") {
    // Don't set finalAmount here, let the user input determine it
    nextTick(() => {
      document.getElementById("otherInputId")?.focus()
    })
  } else {
    isOtherError.value = false
    otherAmount.value = null
    // For preset amounts, update finalAmount immediately
    finalAmount.value = e
  }
}

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
    <div class="amount-rb flex align-items-center mt-4 w-full gap-2">
      <div v-for="amount in options" class="w-6 md:w-3">
        <Button
          class="px-2 w-full"
          severity="secondary"
          size="small"
          @click="onRbClicked(amount)"
          :class="[
            { selected: value === amount },
            { other: value === 'other' },
            { 'p-invalid': isOtherError && amount === 'other' },
          ]"
          :aria-label="
            amount === 'other' ? 'Enter custom amount' : `Select $${amount} per month`
          "
        >
          <p v-if="amount !== 'other'" class="font-bold">${{ amount }}/mo</p>
          <p v-else-if="amount === 'other' && value !== amount" class="font-bold">
            Custom
          </p>

          <InputNumber
            v-else
            prefix="$"
            suffix="/mo"
            v-model="otherAmount"
            inputId="otherInputId"
            :minFractionDigits="0"
            :maxFractionDigits="5"
            :min="0"
            placeholder="Enter amount"
            fluid
            :invalid="isOtherError"
            @keyup.enter="onAdjust"
          />
        </Button>
      </div>
    </div>
    <small v-if="isOtherError" class="w-full p-error mb-2">
      Please enter an amount of $1 or more
    </small>

    <div class="flex flex-column gap-3 align-items-center mt-6">
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

<style lang="scss">
.adjust-donation {
  .amount-rb {
    .p-button {
      border-color: #000000;
      &.selected {
        background-color: #000000;
        border-color: transparent;
        p {
          color: #fff;
        }
      }
      .p-inputnumber {
        .p-inputtext {
          text-align: center;
          padding: 0;
          background-color: transparent;
          border: transparent;
          font-weight: 700;
          color: #ffffff;

          @include media("<md") {
            font-size: 0.8725rem;
          }
        }
      }
      &.p-invalid {
        border: 4px solid var(--p-primary-500);
      }
    }
  }
}
</style>
