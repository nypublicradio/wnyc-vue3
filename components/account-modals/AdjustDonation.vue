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

const InputNumberRef = ref(null)

const finalAmount = ref(15)
const value = ref(15)
const otherAmount = ref(null)
const options = ref([15, 30, 45, "other"])

const onUpdateOtherAmount = (e) => {
  console.log("updating other amount = ", e.value)
  finalAmount.value = e.value
}
const onRbClicked = (e) => {
  console.log("clicked RB", e)
  value.value = e
  finalAmount.value = e
  if (e === "other") {
    console.log("is other")
    // set focus to the inputtext element after nextTick()

    InputNumberRef.value.focus()
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
    {{ value }}
    {{ finalAmount }}
    <div class="amount-rb flex align-items-center gap-2 my-4">
      <Button
        v-for="amount in options"
        class="px-3"
        severity="secondary"
        size="small"
        @click="onRbClicked(amount)"
        :class="[{ selected: value === amount }, { other: value === 'other' }]"
      >
        <p v-if="amount !== 'other'" class="font-bold">${{ amount }}/mo</p>
        <p v-else-if="amount === 'other' && value !== amount" class="font-bold">
          $ Other
        </p>

        <InputNumber
          v-else
          ref="InputNumberRef"
          prefix="$"
          suffix="/mo"
          v-model="otherAmount"
          inputId="minmaxfraction"
          :minFractionDigits="2"
          :maxFractionDigits="5"
          placeholder="$0.00/mo"
          fluid
          @value-change="onUpdateOtherAmount"
        />
      </Button>
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
        &.other {
        }
      }
      .p-inputnumber {
        .p-inputtext {
          max-width: 110px;
          padding: 0;
          background-color: transparent;
          border: transparent;
          font-weight: 700;
          color: #ffffff;
        }
      }
    }
  }
}
</style>
