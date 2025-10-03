<script setup>
import AccountModalHeader from "./AccountModalHeader.vue"
const { formatCurrency } = useProfileApi()
const emit = defineEmits(["save", "cancel"])

const dialogRef = inject("dialogRef")

const currentDonationAmount = ref(null)

const finalAmount = ref(null)
const value = ref(null)
const otherAmount = ref(null)
// adjust these numbers below to control the amount added to the current donation amount
const options = ref([3, 5, 8, "other"])
const isOtherError = ref(false)

// Handle the cancel action
const onCancel = () => {
  dialogRef.value.close()
  emit("cancel")
}
// Handle the save action
const onSave = () => {
  // finalAmount should already be set by now, but add safety check
  if (value.value) {
    if (value.value === "other") {
      if (otherAmount.value === null || otherAmount.value < 1) {
        isOtherError.value = true
      } else {
        finalAmount.value = otherAmount.value
        isOtherError.value = false

        dialogRef.value.close()
        emit("save", { amount: finalAmount.value })
      }
    } else {
      dialogRef.value.close()
      emit("save", { amount: finalAmount.value })
    }
  }
}
// Handle radio button click
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
  options.value = options.value.map((amount) => {
    if (typeof amount === "number") {
      const adjustedAmount = Math.ceil(amount + Math.ceil(currentDonationAmount.value))
      //value.value = adjustedAmount
      return adjustedAmount
    }
    return amount
  })
})
</script>

<template>
  <div class="adjust-donation">
    <AccountModalHeader>Update Gift Amount</AccountModalHeader>
    <p>Your current monthly gift is {{ formatCurrency(currentDonationAmount) }}.</p>
    <div
      v-if="currentDonationAmount"
      class="amount-rb flex flex-wrap align-items-center mt-4 w-full"
    >
      <div
        v-for="amount in options"
        :key="`rb-${amount}`"
        class="w-6 md:w-3 px-2 py-2 md:px-1 relative"
      >
        <Button
          class="w-full"
          severity="secondary"
          size="small"
          @click="onRbClicked(amount)"
          :class="[
            { selected: value === amount },
            { other: value === 'other' },
            { otherRb: amount === 'other' },
            { 'p-invalid': isOtherError && amount === 'other' },
          ]"
          :aria-label="
            amount === 'other' ? 'Enter custom amount' : `Select $${amount} per month`
          "
        >
          <p v-if="amount !== 'other'" class="font-bold">${{ amount }}/mo</p>
          <p v-else-if="amount === 'other' && value !== amount" class="font-bold">
            $ <span>Other</span>
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
            placeholder="$0/mo"
            fluid
            :invalid="isOtherError"
            @keyup.enter="onSave"
          />
        </Button>
        <small v-if="amount === 'other'" class="absolute left-0 top-100 ml-2"
          >Enter amount</small
        >
      </div>
    </div>
    <small v-if="isOtherError" class="w-full p-error mb-2">
      Please enter an amount of $1 or more
    </small>

    <div class="flex flex-column gap-3 align-items-center mt-6">
      <Button
        class="w-full px-3 max-w-15rem"
        @click="onSave"
        label="Save Changes"
        size="small"
        :disabled="!value"
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
      border-color: var(--p-darkblue-500);
      &.selected {
        background-color: var(--p-darkblue-500);
        border-color: transparent;
        p {
          color: #fff;
        }
      }
      &.otherRb {
        border-color: #c3c3c3;
        p span {
          color: #c3c3c3;
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
